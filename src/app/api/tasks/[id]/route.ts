import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { and, eq } from "drizzle-orm";
import { bookings, tasks } from "@/lib/db/schema";
import { TaskSchema } from "@/app/(dashboard)/tasks/task-form-schema";

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

		const taskId = Number.parseInt(id, 10);

		const task = await db.query.tasks.findFirst({
			where: and(
				eq(tasks.id, taskId),
				eq(tasks.organizationId, userOrganizationId),
			),
			with: {
				booking: {
					columns: {
						name: true,
					},
				},
			},
		});

		if (!task) {
			return NextResponse.json({ message: "task not found" }, { status: 404 });
		}

		return NextResponse.json(task, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching task:", error);
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

	const taskId = Number.parseInt(params.id, 10);
	const body = await request.json();

	const validatedData = TaskSchema.parse({ ...body, id: taskId });

	try {
		const result = await db.transaction(async (tx) => {
			// Verify the task exists and belongs to the user's organization
			const existingTask = await tx.query.tasks.findFirst({
				where: and(
					eq(tasks.id, taskId),
					eq(tasks.organizationId, userOrganizationId),
				),
			});

			if (!existingTask) {
				return NextResponse.json(
					{ message: "Task not found or access denied" },
					{ status: 404 },
				);
			}

			// Update the task with provided fields, preserving unchanged ones
			const [updatedTask] = await tx
				.update(tasks)
				.set({
					bookingId: validatedData.bookingId
						? Number.parseInt(validatedData.bookingId)
						: existingTask.bookingId,
					description: validatedData.description ?? existingTask.description,
					dueDate: validatedData.dueDate
						? validatedData.dueDate
						: existingTask.dueDate,
					status: validatedData.status ?? existingTask.status,
					assignedTo: validatedData.assignedTo ?? existingTask.assignedTo,
					updatedAt: new Date(),
				})
				.where(eq(tasks.id, taskId))
				.returning();

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedTask.bookingId))
				.returning();

			return [updatedTask, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [updatedTask, updatedBooking] = result;

		return NextResponse.json(
			{
				data: { taskId: updatedTask.id, bookingId: updatedBooking.id },
				message: "Task updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating task:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
