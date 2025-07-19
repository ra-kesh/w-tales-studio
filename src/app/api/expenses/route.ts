import { organization } from "better-auth/plugins";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ExpenseSchema } from "@/app/(dashboard)/expenses/expense-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	type AllowedExpenseSortFields,
	type ExpenseFilters,
	type ExpenseSortOption,
	getExpenses,
} from "@/lib/db/queries";
import {
	bookings,
	crews,
	expenses,
	expensesAssignments,
} from "@/lib/db/schema";

export async function GET(request: Request) {
	const { session } = await getServerSession();

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userOrganizationId = session.session.activeOrganizationId;

	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

		const sortParam = searchParams.get("sort");
		let sortOptions: ExpenseSortOption[] | undefined;
		if (sortParam) {
			try {
				const parsedSort = JSON.parse(sortParam);
				const allowedFields: AllowedExpenseSortFields[] = [
					"category",
					"amount",
					"date",
					"createdAt",
					"updatedAt",
				];
				sortOptions = parsedSort.filter((option: ExpenseSortOption) =>
					allowedFields.includes(option.id),
				);
			} catch (e) {
				console.error("Failed to parse sort parameter:", e);
			}
		}

		// 2. Construct Filters Object from URL Search Params
		const filters: ExpenseFilters = {
			description: searchParams.get("description") || undefined,
			category: searchParams.get("category") || undefined,
			date: searchParams.get("date") || undefined,
			crewId: searchParams.get("crewId") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
		};

		// 3. Call the updated getExpenses function with all parameters
		const result = await getExpenses(
			userOrganizationId,
			page,
			limit,
			sortOptions,
			filters,
		);

		// const transformedData = result.data.map((expense) => ({
		// 	...expense,
		// 	expensesAssignments: expense.expensesAssignments?.map((assignment) => ({
		// 		...assignment,
		// 		crew: {
		// 			...assignment.crew,
		// 			name: assignment.crew.member?.user?.name || assignment.crew.name,
		// 		},
		// 	})),
		// }));

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching expenses:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	const { session } = await getServerSession();

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userOrganizationId = session.session.activeOrganizationId;
	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	const body = await request.json();

	const validation = ExpenseSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.issues },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	try {
		const result = await db.transaction(async (tx) => {
			const existingBooking = await tx.query.bookings.findFirst({
				where: and(
					eq(bookings.id, Number.parseInt(validatedData.bookingId)),
					eq(bookings.organizationId, userOrganizationId),
				),
			});

			if (!existingBooking) {
				return NextResponse.json(
					{ message: "Booking not found or access denied" },
					{ status: 404 },
				);
			}

			let crewAssignments: { crewId: number }[] = [];
			if (validatedData.crewMembers && validatedData.crewMembers.length > 0) {
				const crewIds = validatedData.crewMembers;

				const existingCrews = await tx
					.select({ id: crews.id })
					.from(crews)
					.where(
						and(
							inArray(crews.id, crewIds.map(Number)),
							eq(crews.organizationId, userOrganizationId),
						),
					);

				const foundCrewIds = new Set(existingCrews.map((crew) => crew.id));
				const invalidCrewIds = crewIds.filter(
					(id) => !foundCrewIds.has(Number(id)),
				);

				if (invalidCrewIds.length > 0) {
					return NextResponse.json(
						{
							message: "Invalid crew members",
							invalidCrewIds,
						},
						{ status: 400 },
					);
				}

				crewAssignments = crewIds.map((crewId) => ({ crewId: Number(crewId) }));
			}

			// Insert the new expense
			const [newExpense] = await tx
				.insert(expenses)
				.values({
					bookingId: Number.parseInt(validatedData.bookingId),
					organizationId: userOrganizationId,
					description: validatedData.description,
					amount: validatedData.amount,
					category: validatedData.category,
					date: validatedData.date,
					billTo: validatedData.billTo as "Studio" | "Client",
					fileUrls: validatedData.fileUrls,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: expenses.id });

			const assignmentResults = [];

			if (crewAssignments.length > 0) {
				const assignmentValues = crewAssignments.map((assignment) => {
					return {
						expenseId: newExpense.id,
						crewId: assignment.crewId,
						organizationId: userOrganizationId,
						assignedAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				});

				const assignMentsInserted = await tx
					.insert(expensesAssignments)
					.values(assignmentValues)
					.returning({
						id: expensesAssignments.id,
						crewId: expensesAssignments.crewId,
					});

				assignmentResults.push(...assignMentsInserted);
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return [newExpense, updatedBooking, assignmentResults];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [newExpense, updatedBooking, assignmentResults] = result as [
			{ id: number },
			{ id: number },
			{ id: number; crewId: number }[],
		];

		return NextResponse.json(
			{
				data: {
					expenseId: newExpense.id,
					bookingId: updatedBooking.id,
					assignments: assignmentResults,
				},
				message: "Expense created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
