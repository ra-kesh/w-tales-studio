import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
	deliverables,
	bookings,
	deliverablesAssignments,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/dal";
import { DeliverableSchema } from "@/app/(dashboard)/deliverables/deliverable-form-schema";

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
			{ message: "Validation error", errors: validation.error.errors },
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
					updatedAt: new Date(),
				})
				.where(eq(deliverables.id, deliverableId))
				.returning();

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedDeliverable.bookingId))
				.returning();

			return [updatedDeliverable, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [updatedDeliverable, updatedBooking] = result;

		return NextResponse.json(
			{
				data: {
					deliverableId: updatedDeliverable.id,
					bookingId: updatedBooking.id,
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
