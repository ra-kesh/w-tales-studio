import { and, eq, inArray, ne, not, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";
import { BookingEditSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-edit-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { getBookingDetail } from "@/lib/db/queries";
import {
	bookings,
	paymentSchedules,
	receivedAmounts,
	shoots,
	shootsAssignments,
} from "@/lib/db/schema";

export async function GET(
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

	const canReadBooking = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				booking: ["read"],
			},
		},
	});

	if (!canReadBooking) {
		return NextResponse.json(
			{ message: "You do not have permission to add booking." },
			{ status: 403 },
		);
	}

	try {
		const { id } = await params;
		const bookingId = Number.parseInt(id, 10);

		const response = await getBookingDetail(userOrganizationId, bookingId);

		return NextResponse.json(response, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching booking:", error);
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

	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const orgId = session.session.activeOrganizationId;

	if (!orgId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	const canUpdateBooking = await auth.api.hasPermission({
		headers: await headers(),
		body: { permissions: { booking: ["update"] } },
	});
	if (!canUpdateBooking) {
		return NextResponse.json(
			{ message: "You do not have permission to update this booking." },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const bookingId = Number.parseInt(id, 10);

	if (Number.isNaN(bookingId)) {
		return NextResponse.json(
			{ message: "Invalid booking ID" },
			{ status: 400 },
		);
	}

	try {
		const body = await request.json();
		const validatedData = BookingEditSchema.parse(body);
		const { bookingName, packageCost, status, note } = validatedData;

		const existingBooking = await db.query.bookings.findFirst({
			where: and(
				eq(bookings.id, bookingId),
				eq(bookings.organizationId, orgId),
			),
		});
		if (!existingBooking) {
			return NextResponse.json(
				{ message: "Booking not found" },
				{ status: 404 },
			);
		}

		if (bookingName !== existingBooking.name) {
			const duplicate = await db.query.bookings.findFirst({
				where: and(
					eq(bookings.organizationId, orgId),
					ne(bookings.id, bookingId),
					eq(bookings.name, bookingName),
				),
			});
			if (duplicate) {
				return NextResponse.json(
					{ message: "A booking with this name already exists." },
					{ status: 409 },
				);
			}
		}

		const newCost = parseFloat(packageCost);

		if (newCost < parseFloat(existingBooking.packageCost)) {
			const [recvTotalResult] = await db
				.select({ total: sum(receivedAmounts.amount) })
				.from(receivedAmounts)
				.where(eq(receivedAmounts.bookingId, bookingId));
			const [schedTotalResult] = await db
				.select({ total: sum(paymentSchedules.amount) })
				.from(paymentSchedules)
				.where(eq(paymentSchedules.bookingId, bookingId));

			const totalPayments =
				(Number(recvTotalResult.total) || 0) +
				(Number(schedTotalResult.total) || 0);

			if (totalPayments > newCost) {
				return NextResponse.json(
					{
						message:
							"Cannot reduce package cost below the total of received and scheduled payments.",
					},
					{ status: 400 },
				);
			}
		}

		const validTransitions: Record<string, string[]> = {
			new: ["preparation", "cancelled"],
			preparation: ["shooting", "cancelled"],
			shooting: ["delivery", "cancelled"],
			delivery: ["completed", "cancelled"],
			completed: [],
			cancelled: [],
		};
		if (
			status !== existingBooking.status &&
			!validTransitions[existingBooking.status]?.includes(status)
		) {
			return NextResponse.json(
				{
					message: `Invalid status transition from "${existingBooking.status}" to "${status}"`,
				},
				{ status: 400 },
			);
		}

		const [updatedBooking] = await db
			.update(bookings)
			.set({
				name: bookingName,
				packageCost: packageCost,
				status: status,
				note: note,
				updatedAt: new Date(),
			})
			.where(
				and(eq(bookings.id, bookingId), eq(bookings.organizationId, orgId)),
			)
			.returning();

		if (!updatedBooking) {
			return NextResponse.json(
				{ message: "Failed to update booking" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				data: {
					bookingId: updatedBooking.id,
				},
				message: "Booking updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.issues }, { status: 400 });
		}
		console.error(`Error updating booking ${bookingId}:`, error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
