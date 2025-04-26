import { NextResponse } from "next/server";
import { getDeliverables } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

import { db } from "@/lib/db/drizzle";
import { deliverables, bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DeliverableSchema } from "@/app/(dashboard)/deliverables/deliverable-form-schema";

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

		const result = await getDeliverables(userOrganizationId, page, limit);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching deliverables:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

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

	const validation = DeliverableSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	console.log(validatedData);

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

			// Insert the new deliverable
			const [newDeliverable] = await tx
				.insert(deliverables)
				.values({
					bookingId: Number.parseInt(validatedData.bookingId),
					isPackageIncluded: validatedData.isPackageIncluded,
					title: validatedData.title,
					cost: validatedData.cost,
					quantity: Number.parseInt(validatedData.quantity),
					dueDate: validatedData.dueDate,
					organizationId: userOrganizationId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: deliverables.id });

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return [newDeliverable, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [newDeliverable, updatedBooking] = result;

		return NextResponse.json(
			{
				data: {
					deliverableId: newDeliverable.id,
					bookingId: updatedBooking.id,
				},
				message: "Deliverable created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating deliverable:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
