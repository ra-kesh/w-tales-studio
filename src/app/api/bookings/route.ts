import { NextResponse } from "next/server";
import { getBookings, getBookingsStats } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	bookings,
	clients,
	crews,
	deliverables,
	NewShoot,
	paymentSchedules,
	receivedAmounts,
	shoots,
	shootsAssignments,
} from "@/lib/db/schema";
import { z } from "zod";
import { BookingSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { and, eq, inArray } from "drizzle-orm";

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

			let newShoots: { id: number }[] = [];

			if (validatedData.shoots && validatedData.shoots.length > 0) {
				const allCrewIds = [
					...new Set(
						validatedData.shoots
							.filter((shoot) => shoot.crews && shoot.crews.length > 0)
							.flatMap(
								(shoot) =>
									shoot.crews?.filter((id): id is string => id !== undefined) ??
									[],
							)
							.map((id) => Number.parseInt(id, 10))
							.filter((id) => !Number.isNaN(id)),
					),
				];

				if (allCrewIds.length > 0) {
					const existingCrews = await tx
						.select({ id: crews.id })
						.from(crews)
						.where(
							and(
								inArray(crews.id, allCrewIds),
								eq(crews.organizationId, userOrganizationId),
							),
						);

					const foundCrewIds = new Set(existingCrews.map((crew) => crew.id));
					const invalidCrewIds = allCrewIds.filter(
						(id) => !foundCrewIds.has(id),
					);

					if (invalidCrewIds.length > 0) {
						return NextResponse.json(
							{
								message: "Invalid crew members",
								invalidCrewIds,
							},
							{ status: 400 },
						);
					}
				}

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

				newShoots = await tx
					.insert(shoots)
					.values(shootValues)
					.returning({ id: shoots.id });

				const shootAssignments = validatedData.shoots.flatMap(
					(shoot, index) => {
						if (!shoot.crews || shoot.crews.length === 0) return [];
						const shootId = newShoots[index].id;
						return shoot.crews.map((crewId) => ({
							shootId,
							crewId: Number.parseInt(crewId, 10),
							organizationId: userOrganizationId,
							isLead: false,
							assignedAt: new Date(),
							createdAt: new Date(),
							updatedAt: new Date(),
						}));
					},
				);

				if (shootAssignments.length > 0) {
					await tx.insert(shootsAssignments).values(shootAssignments);
				}
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

// In the GET function of your route.ts file
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
		const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);

		const sortParam = searchParams.get("sort");
		let sortOptions = undefined;

		if (sortParam) {
			try {
				sortOptions = JSON.parse(sortParam);
			} catch (error) {
				console.error("Error parsing sort parameter:", error);
			}
		}

		const result = await getBookings(
			userOrganizationId,
			page,
			limit,
			// sortOptions,
		);

		const stats = await getBookingsStats(userOrganizationId);

		return NextResponse.json(
			{
				...result,
				stats,
			},
			{ status: 200 },
		);
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
