import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { TaskSchema } from "@/app/(dashboard)/tasks/task-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { bookings, crews, tasks, tasksAssignments } from "@/lib/db/schema";

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
				tasksAssignments: {
					columns: {
						id: true,
						crewId: true,
						assignedAt: true,
					},
					with: {
						crew: {
							columns: {
								id: true,
								name: true,
								role: true,
								specialization: true,
								status: true,
							},
							with: {
								member: {
									with: {
										user: {
											columns: {
												name: true,
												email: true,
												image: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!task) {
			return NextResponse.json({ message: "Task not found" }, { status: 404 });
		}

		// Transform response to include crew members
		const responseData = {
			...task,
			crewMembers: task.tasksAssignments.map((assignment) =>
				assignment.crewId.toString(),
			),
		};

		return NextResponse.json(responseData, { status: 200 });
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

	const { id } = await params;
	const taskId = Number.parseInt(id, 10);
	const body = await request.json();
	const validatedData = TaskSchema.parse(body);

	try {
		const result = await db.transaction(async (tx) => {
			const existingTask = await tx.query.tasks.findFirst({
				where: and(
					eq(tasks.id, taskId),
					eq(tasks.organizationId, userOrganizationId),
				),
			});

			if (!existingTask) {
				throw new Error("Task not found or access denied");
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

			const [updatedTask] = await tx
				.update(tasks)
				.set({
					bookingId: Number.parseInt(validatedData.bookingId),
					deliverableId: validatedData.deliverableId
						? Number.parseInt(validatedData.deliverableId)
						: null,
					priority: validatedData.priority,
					description: validatedData.description,
					startDate: validatedData.startDate,
					dueDate: validatedData.dueDate,
					status: validatedData.status,
					updatedAt: new Date(),
				})
				.where(eq(tasks.id, taskId))
				.returning();

			// Update crew assignments
			const existingAssignments = await tx
				.select({ crewId: tasksAssignments.crewId })
				.from(tasksAssignments)
				.where(eq(tasksAssignments.taskId, taskId));

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
						.delete(tasksAssignments)
						.where(
							and(
								eq(tasksAssignments.taskId, taskId),
								inArray(tasksAssignments.crewId, crewIdsToDelete),
							),
						);
				}
			}

			// Add new assignments
			const crewIdsToAdd = [...newCrewIds].filter(
				(id) => !existingCrewIds.has(id),
			);
			if (crewIdsToAdd.length > 0) {
				const assignmentValues = crewIdsToAdd.map((crewId) => ({
					taskId: taskId,
					crewId: crewId,
					organizationId: userOrganizationId,
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				assignmentResults = await tx
					.insert(tasksAssignments)
					.values(assignmentValues)
					.returning({
						id: tasksAssignments.id,
						crewId: tasksAssignments.crewId,
					});
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedTask.bookingId))
				.returning();

			return {
				task: updatedTask,
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
