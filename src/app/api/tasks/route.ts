import { NextResponse } from "next/server";
import { getTasks } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { TaskSchema } from "@/app/(dashboard)/tasks/task-form-schema";
import { db } from "@/lib/db/drizzle";
import { and, eq, inArray } from "drizzle-orm";
import { bookings, crews, tasks, tasksAssignments } from "@/lib/db/schema";

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
				throw new Error("Booking not found or access denied");
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
					throw new Error(`Invalid crew members: ${invalidCrewIds.join(", ")}`);
				}

				crewAssignments = crewIds.map((crewId) => ({ crewId: Number(crewId) }));
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
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const assignmentResults = [];
			if (crewAssignments.length > 0) {
				const assignmentValues = crewAssignments.map((assignment) => ({
					taskId: newTask.id,
					crewId: assignment.crewId,
					organizationId: userOrganizationId,
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				const assignmentsInserted = await tx
					.insert(tasksAssignments)
					.values(assignmentValues)
					.returning({
						id: tasksAssignments.id,
						crewId: tasksAssignments.crewId,
					});

				assignmentResults.push(...assignmentsInserted);
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return {
				task: newTask,
				booking: updatedBooking,
				assignments: assignmentResults,
			};
		});

		return NextResponse.json(
			{
				data: {
					taskId: result.task.id,
					bookingId: result.booking.id,
					assignments: result.assignments,
				},
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
