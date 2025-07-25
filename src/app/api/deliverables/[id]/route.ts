import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { DeliverableSchema } from "@/app/(dashboard)/deliverables/deliverable-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	bookings,
	crews,
	deliverables,
	deliverablesAssignments,
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

		const deliverableId = Number.parseInt(id, 10);

		const deliverable = await db.query.deliverables.findFirst({
			where: eq(deliverables.id, deliverableId),
			with: {
				booking: {
					columns: {
						name: true,
					},
				},
			},
		});

		if (!deliverable) {
			return new NextResponse("Deliverable not found", { status: 404 });
		}

		if (deliverable.organizationId !== userOrganizationId) {
			return new NextResponse("Unauthorized", { status: 403 });
		}

		const assignments = await db
			.select({ crewId: deliverablesAssignments.crewId })
			.from(deliverablesAssignments)
			.where(
				and(
					eq(deliverablesAssignments.deliverableId, deliverableId),
					eq(deliverablesAssignments.organizationId, userOrganizationId),
				),
			);

		const crewMembers = assignments.map((assignment) =>
			assignment.crewId.toString(),
		);

		const responseData = {
			...deliverable,
			crewMembers,
		};

		return NextResponse.json({ data: responseData });
	} catch (error) {
		console.error("Error fetching deliverable:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
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
	const deliverableId = Number.parseInt(id, 10);

	const body = await request.json();
	const validation = DeliverableSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.issues },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	try {
		const result = await db.transaction(async (tx) => {
			const existingDeliverable = await tx.query.deliverables.findFirst({
				where: and(
					eq(deliverables.id, deliverableId),
					eq(deliverables.organizationId, userOrganizationId),
				),
			});

			if (!existingDeliverable) {
				return NextResponse.json(
					{ message: "Deliverable not found or access denied" },
					{ status: 404 },
				);
			}

			// Verify the new bookingId exists and belongs to the user's organization
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

			const [updatedDeliverable] = await tx
				.update(deliverables)
				.set({
					bookingId: Number.parseInt(validatedData.bookingId),
					title: validatedData.title,
					dueDate: validatedData.dueDate,
					isPackageIncluded: validatedData.isPackageIncluded,
					quantity: Number.parseInt(validatedData.quantity),
					cost: validatedData.cost,
					notes: validatedData.notes,
					status: validatedData.status as
						| "pending"
						| "in_progress"
						| "in_revision"
						| "completed"
						| "delivered"
						| "cancelled",
					updatedAt: new Date(),
				})
				.where(eq(deliverables.id, deliverableId))
				.returning();

			// Optimize crew assignment updates: only delete removed assignments and add new ones
			const existingAssignments = await tx
				.select({ crewId: deliverablesAssignments.crewId })
				.from(deliverablesAssignments)
				.where(eq(deliverablesAssignments.deliverableId, deliverableId));

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
						.delete(deliverablesAssignments)
						.where(
							and(
								eq(deliverablesAssignments.deliverableId, deliverableId),
								inArray(deliverablesAssignments.crewId, crewIdsToDelete),
							),
						);
				}
			} // Add new assignments
			const crewIdsToAdd = [...newCrewIds].filter(
				(id) => !existingCrewIds.has(id),
			);
			if (crewIdsToAdd.length > 0) {
				const assignmentValues = crewIdsToAdd.map((crewId) => ({
					deliverableId: deliverableId,
					crewId: crewId,
					organizationId: userOrganizationId,
					assignedAt: new Date(),
				}));

				assignmentResults = await tx
					.insert(deliverablesAssignments)
					.values(assignmentValues)
					.returning({
						id: deliverablesAssignments.id,
						crewId: deliverablesAssignments.crewId,
					});
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedDeliverable.bookingId))
				.returning();

			return [updatedDeliverable, updatedBooking, assignmentResults];
		});

		if (result instanceof NextResponse) {
			return result;
		}

		const [updatedDeliverable, updatedBooking, assignmentResults] = result as [
			{ id: number },
			{ id: number },
			{ id: number; crewId: number }[],
		];

		return NextResponse.json(
			{
				data: {
					deliverableId: updatedDeliverable.id,
					bookingId: updatedBooking.id,
					assignments: assignmentResults,
				},
				message: "Deliverable updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating deliverable:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
