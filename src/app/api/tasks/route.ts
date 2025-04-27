import { NextResponse } from "next/server";
import { getTasks } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { TaskSchema } from "@/app/(dashboard)/tasks/task-form-schema";
import { db } from "@/lib/db/drizzle";
import { and, eq } from "drizzle-orm";
import { bookings, tasks } from "@/lib/db/schema";

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
		const result = await getTasks(userOrganizationId, page, limit);
		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching tasks:", error);
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

	const validation = TaskSchema.safeParse(body);
	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
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

			const [newTask] = await tx
				.insert(tasks)
				.values({
					bookingId: Number.parseInt(validatedData.bookingId),
					organizationId: userOrganizationId,
					description: validatedData.description,
					priority: validatedData.priority,
					dueDate: validatedData.dueDate,
					status: validatedData.status,
					assignedTo: validatedData.assignedTo ?? null,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: tasks.id });

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return [newTask, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [newTask, updatedBooking] = result;

		return NextResponse.json(
			{
				data: { taskId: newTask.id, bookingId: updatedBooking.id },
				message: "Task created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating task:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
