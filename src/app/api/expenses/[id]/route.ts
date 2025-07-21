import { and, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ExpenseSchema } from "@/app/(dashboard)/expenses/expense-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	bookings,
	crews,
	expenses,
	expensesAssignments,
} from "@/lib/db/schema";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
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
		const { id } = await params;
		const expenseId = Number.parseInt(id, 10);

		const expense = await db.query.expenses.findFirst({
			where: and(
				eq(expenses.id, expenseId),
				eq(expenses.organizationId, userOrganizationId),
			),
			//   with: {
			//     booking: true,
			//   },
		});

		if (!expense) {
			return NextResponse.json(
				{ message: "Expense not found" },
				{ status: 404 },
			);
		}

		if (expense.organizationId !== userOrganizationId) {
			return new NextResponse("Unauthorized", { status: 403 });
		}

		const assignments = await db
			.select({ crewId: expensesAssignments.crewId })
			.from(expensesAssignments)
			.where(
				and(
					eq(expensesAssignments.expenseId, expenseId),
					eq(expensesAssignments.organizationId, userOrganizationId),
				),
			);

		const crewMembers = assignments.map((assignment) =>
			assignment.crewId.toString(),
		);

		const responseData = {
			...expense,
			crewMembers,
		};

		return NextResponse.json(responseData, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
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

	const canUpdate = await auth.api.hasPermission({
		headers: await headers(),
		body: { permissions: { expense: ["update"] } },
	});
	if (!canUpdate) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const expenseId = Number.parseInt(id, 10);
	const body = await request.json();

	const validatedData = ExpenseSchema.parse({ ...body, id: expenseId });

	try {
		const result = await db.transaction(async (tx) => {
			const existingExpense = await tx.query.expenses.findFirst({
				where: and(
					eq(expenses.id, expenseId),
					eq(expenses.organizationId, userOrganizationId),
				),
			});

			if (!existingExpense) {
				return NextResponse.json(
					{ message: "Expense not found or access denied" },
					{ status: 404 },
				);
			}

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
				const crewIds = validatedData.crewMembers.map((id) =>
					Number.parseInt(id, 10),
				);
				const existingCrews = await tx
					.select({ id: crews.id })
					.from(crews)
					.where(
						and(
							inArray(crews.id, crewIds),
							eq(crews.organizationId, userOrganizationId),
						),
					);

				const foundCrewIds = new Set(existingCrews.map((crew) => crew.id));
				const invalidCrewIds = crewIds.filter((id) => !foundCrewIds.has(id));

				if (invalidCrewIds.length > 0) {
					return NextResponse.json(
						{
							message: "Invalid crew members",
							invalidCrewIds,
						},
						{ status: 400 },
					);
				}

				crewAssignments = crewIds.map((crewId) => ({ crewId }));
			}

			const [updatedExpense] = await tx
				.update(expenses)
				.set({
					bookingId: Number.parseInt(validatedData.bookingId),
					billTo: validatedData.billTo as "Studio" | "Client",
					category: validatedData.category,
					amount: sql`${validatedData.amount}::numeric`,
					date: validatedData.date,
					description: validatedData.description,
					fileUrls: validatedData.fileUrls,
					updatedAt: new Date(),
				})
				.where(eq(expenses.id, expenseId))
				.returning();

			const existingAssignments = await tx
				.select({ crewId: expensesAssignments.crewId })
				.from(expensesAssignments)
				.where(eq(expensesAssignments.expenseId, expenseId));

			const existingCrewIds = new Set(existingAssignments.map((a) => a.crewId));
			const newCrewIds = new Set(crewAssignments.map((a) => a.crewId));

			let assignmentResults: { id: number; crewId: number }[] = [];

			if (existingCrewIds.size > 0) {
				// Delete assignments that are no longer needed
				const crewIdsToDelete = [...existingCrewIds].filter(
					(id) => !newCrewIds.has(id),
				);
				if (crewIdsToDelete.length > 0) {
					await tx
						.delete(expensesAssignments)
						.where(
							and(
								eq(expensesAssignments.expenseId, expenseId),
								inArray(expensesAssignments.crewId, crewIdsToDelete),
							),
						);
				}
			} // Add new assignments
			const crewIdsToAdd = [...newCrewIds].filter(
				(id) => !existingCrewIds.has(id),
			);
			if (crewIdsToAdd.length > 0) {
				const assignmentValues = crewIdsToAdd.map((crewId) => ({
					expenseId: expenseId,
					crewId: crewId,
					organizationId: userOrganizationId,
					assignedAt: new Date(),
				}));

				assignmentResults = await tx
					.insert(expensesAssignments)
					.values(assignmentValues)
					.returning({
						id: expensesAssignments.id,
						crewId: expensesAssignments.crewId,
					});
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedExpense.bookingId))
				.returning();

			return [updatedExpense, updatedBooking, assignmentResults];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [updatedExpense, updatedBooking, assignmentResults] = result as [
			{ id: number },
			{ id: number },
			{ id: number; crewId: number }[],
		];

		return NextResponse.json(
			{
				data: {
					expenseId: updatedExpense.id,
					bookingId: updatedBooking.id,
					assignments: assignmentResults,
				},
				message: "Expense updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
