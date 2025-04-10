import { NextResponse } from "next/server";
import { getBookings } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	bookings,
	clients,
	deliverables,
	paymentSchedules,
	receivedAmounts,
	shoots,
} from "@/lib/db/schema";
import { z } from "zod";
import { BookingSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";

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

	try {
		const body = await request.json();

		const validation = BookingSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: "Validation error", errors: validation.error.errors },
				{ status: 400 },
			);
		}

		const validatedData = validation.data;

		const result = await db.transaction(async (tx) => {
			// Create a client record
			const [newClient] = await tx
				.insert(clients)
				.values({
					organizationId: userOrganizationId,
					name: validatedData.clientName,
					relation: validatedData.relation,
					brideName: validatedData.brideName,
					groomName: validatedData.groomName,
					phoneNumber: validatedData.phone,
					email: validatedData.email,
					address: validatedData.address,
				})
				.returning({ id: clients.id });

			// Insert the booking
			const [newBooking] = await tx
				.insert(bookings)
				.values({
					organizationId: userOrganizationId,
					name: validatedData.bookingName,
					bookingType: validatedData.bookingType,
					packageType: validatedData.packageType,
					packageCost: validatedData.packageCost,
					clientId: newClient.id,
				})
				.returning();

			const bookingId = newBooking.id;

			// Insert shoots if provided
			if (validatedData.shoots && validatedData.shoots.length > 0) {
				const shootValues = validatedData.shoots.map((shoot) => ({
					bookingId,
					organizationId: userOrganizationId,
					title: shoot.title,
					date: shoot.date, // Required, so no undefined check
					time: shoot.time, // Required, so no undefined check
					reportingTime: undefined, // Optional, adjust if provided
					duration: undefined, // Optional, adjust if provided
					location: shoot.location, // JSONB object
					notes: validatedData.note, // Map note to shoots if desired
					additionalServices: undefined, // Optional, adjust if provided
				}));
				await tx.insert(shoots).values(shootValues);
			}

			// Insert deliverables if provided
			if (validatedData.deliverables && validatedData.deliverables.length > 0) {
				const deliverableValues = validatedData.deliverables.map(
					(deliverable) => ({
						bookingId,
						organizationId: userOrganizationId,
						title: deliverable.title,
						isPackageIncluded: true,
						cost: deliverable.cost,
						quantity: Number.parseInt(deliverable.quantity),
						dueDate: deliverable.dueDate,
					}),
				);
				await tx.insert(deliverables).values(deliverableValues);
			}

			// Insert received amounts if provided
			if (validatedData.payments && validatedData.payments.length > 0) {
				const paymentValues = validatedData.payments.map((payment) => ({
					bookingId,
					amount: payment.amount,
					description: payment.description,
					paidOn: payment.date,
				}));
				await tx.insert(receivedAmounts).values(paymentValues);
			}

			// Insert payment schedules if provided
			if (
				validatedData.scheduledPayments &&
				validatedData.scheduledPayments.length > 0
			) {
				const scheduleValues = validatedData.scheduledPayments.map(
					(schedule) => ({
						bookingId,
						amount: schedule.amount,
						description: schedule.description,
						dueDate: schedule.dueDate,
					}),
				);
				await tx.insert(paymentSchedules).values(scheduleValues);
			}

			// Fetch the created booking with related data
			// const createdBooking = await tx.query.bookings.findFirst({
			// 	where: eq(bookings.id, bookingId),
			// 	// with: {
			// 	// 	shoots: true,
			// 	// 	deliverables: true,
			// 	// 	receivedAmounts: true,
			// 	// 	paymentSchedules: true,
			// 	// },
			// });

			return bookingId; // Include client details in response
		});

		return NextResponse.json(
			{ data: { bookingId: result }, message: "Booking created successfully" },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating booking:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Validation error", errors: error.errors },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

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

		const result = await getBookings(userOrganizationId, page, limit);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching bookings:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
