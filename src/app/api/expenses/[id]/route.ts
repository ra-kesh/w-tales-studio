import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { bookings, expenses } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { ExpenseSchema } from "@/app/(dashboard)/expenses/expense-form-schema";

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

		return NextResponse.json(expense, { status: 200 });
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

			const [updatedExpense] = await tx
				.update(expenses)
				.set({
					bookingId: Number.parseInt(validatedData.bookingId),
					billTo: validatedData.billTo,
					category: validatedData.category,
					amount: sql`${validatedData.amount}::numeric`,
					date: validatedData.date,
					description: validatedData.description,
					fileUrls: validatedData.fileUrls,
					updatedAt: new Date(),
				})
				.where(eq(expenses.id, expenseId))
				.returning();

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedExpense.bookingId))
				.returning();

			return [updatedExpense, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [updatedExpense, updatedBooking] = result;

		return NextResponse.json(
			{
				data: { expenseId: updatedExpense.id, bookingId: updatedBooking.id },
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
