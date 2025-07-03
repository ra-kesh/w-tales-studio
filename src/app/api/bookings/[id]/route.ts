import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { BookingSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { getBookingDetail } from "@/lib/db/queries";
import {
	bookingParticipants,
	bookings,
	clients,
	deliverables,
	paymentSchedules,
	receivedAmounts,
	shoots,
	shootsAssignments,
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

// export async function PUT(
// 	request: Request,
// 	{ params }: { params: { id: string } },
// ) {
// 	const { session } = await getServerSession();

// 	if (!session || !session.user) {
// 		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// 	}

// 	const userOrganizationId = session.session.activeOrganizationId;

// 	if (!userOrganizationId) {
// 		return NextResponse.json(
// 			{ message: "User not associated with an organization" },
// 			{ status: 403 },
// 		);
// 	}
// 	try {
// 		const body = await request.json();
// 		const { id } = await params;
// 		const bookingId = Number.parseInt(id, 10);

// 		const validation = BookingSchema.safeParse(body);

// 		if (!validation.success) {
// 			return NextResponse.json(
// 				{ message: "Validation error", errors: validation.error.errors },
// 				{ status: 400 },
// 			);
// 		}

// 		const validatedData = validation.data;

// 		const existingBooking = await db.query.bookings.findFirst({
// 			where: eq(bookings.id, bookingId),
// 		});

// 		if (!existingBooking) {
// 			return NextResponse.json(
// 				{ message: "Booking not found" },
// 				{ status: 404 },
// 			);
// 		}

// 		await db.transaction(async (tx) => {
// 			const clientId = existingBooking.clientId;

// 			await tx
// 				.update(clients)
// 				.set({
// 					name: validatedData.clientName,
// 					brideName: validatedData.brideName,
// 					groomName: validatedData.groomName,
// 					relation: validatedData.relation,
// 					phoneNumber: validatedData.phone,
// 					email: validatedData.email,
// 					address: validatedData.address,
// 				})
// 				.where(eq(clients.id, clientId));

// 			// Update booking
// 			await tx
// 				.update(bookings)
// 				.set({
// 					name: validatedData.bookingName,
// 					//   bookingType: body.bookingType,
// 					packageType: validatedData.packageType,
// 					packageCost: validatedData.packageCost,
// 					note: validatedData.note,
// 				})
// 				.where(
// 					and(
// 						eq(bookings.id, bookingId),
// 						eq(bookings.organizationId, userOrganizationId),
// 					),
// 				)
// 				.returning();

// 			// Update shoots
// 			await tx.delete(shoots).where(eq(shoots.bookingId, bookingId));
// 			let newShoots: { id: number }[] = [];
// 			if (validatedData.shoots && validatedData.shoots.length > 0) {
// 				const shootValues = validatedData.shoots.map((shoot) => ({
// 					bookingId,
// 					organizationId: userOrganizationId,
// 					title: shoot.title,
// 					date: shoot.date,
// 					time: shoot.time,
// 					reportingTime: undefined,
// 					duration: undefined,
// 					location: shoot.location,
// 					notes: validatedData.note,
// 					additionalServices: undefined,
// 				}));
// 				newShoots = await tx
// 					.insert(shoots)
// 					.values(shootValues)
// 					.returning({ id: shoots.id });

// 				// Insert shootsAssignments for each shoot
// 				for (let i = 0; i < validatedData.shoots.length; i++) {
// 					const shoot = validatedData.shoots[i];
// 					const newShootId = newShoots[i]?.id;

// 					if (shoot.crews && shoot.crews.length > 0 && newShootId) {
// 						const assignmentValues = shoot.crews.map((crewId) => ({
// 							shootId: newShootId,
// 							crewId: Number.parseInt(crewId, 10),
// 							isLead: false,
// 							organizationId: userOrganizationId,
// 							assignedAt: new Date(),
// 						}));
// 						await tx.insert(shootsAssignments).values(assignmentValues);
// 					}
// 				}
// 			}

// 			await tx
// 				.delete(deliverables)
// 				.where(eq(deliverables.bookingId, bookingId));
// 			if (validatedData.deliverables && validatedData.deliverables.length > 0) {
// 				const deliverableValues = validatedData.deliverables.map(
// 					(deliverable) => ({
// 						bookingId,
// 						organizationId: userOrganizationId,
// 						title: deliverable.title,
// 						isPackageIncluded: true,
// 						cost: deliverable.cost,
// 						quantity: Number.parseInt(deliverable.quantity),
// 						dueDate: deliverable.dueDate,
// 					}),
// 				);
// 				await tx.insert(deliverables).values(deliverableValues);
// 			}

// 			// Update payments
// 			await tx
// 				.delete(receivedAmounts)
// 				.where(eq(receivedAmounts.bookingId, bookingId));
// 			if (validatedData.payments && validatedData.payments.length > 0) {
// 				const paymentValues = validatedData.payments.map((payment) => ({
// 					bookingId,
// 					amount: payment.amount,
// 					description: payment.description,
// 					paidOn: payment.date,
// 				}));
// 				await tx.insert(receivedAmounts).values(paymentValues);
// 			}

// 			await tx
// 				.delete(paymentSchedules)
// 				.where(eq(paymentSchedules.bookingId, bookingId));
// 			if (
// 				validatedData.scheduledPayments &&
// 				validatedData.scheduledPayments.length > 0
// 			) {
// 				const scheduleValues = validatedData.scheduledPayments.map(
// 					(schedule) => ({
// 						bookingId,
// 						amount: schedule.amount,
// 						description: schedule.description,
// 						dueDate: schedule.dueDate,
// 					}),
// 				);
// 				await tx.insert(paymentSchedules).values(scheduleValues);
// 			}
// 		});

// 		return NextResponse.json(
// 			{ data: { bookingId }, message: "Booking updated successfully" },
// 			{ status: 200 },
// 		);
// 	} catch (error) {
// 		console.error("Error updating booking:", error);
// 		const errorMessage =
// 			error instanceof Error ? error.message : "Unknown error";
// 		return NextResponse.json(
// 			{ message: "Internal server error", error: errorMessage },
// 			{ status: 500 },
// 		);
// 	}
// }

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
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

	const { id } = await params;

	// parse bookingId
	const bookingId = Number.parseInt(id, 10);
	if (Number.isNaN(bookingId)) {
		return NextResponse.json(
			{ message: "Invalid booking id" },
			{ status: 400 },
		);
	}

	// validate payload
	const body = await request.json();
	const parseResult = BookingSchema.safeParse(body);
	if (!parseResult.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: parseResult.error.errors },
			{ status: 400 },
		);
	}
	const data = parseResult.data;

	// ensure booking exists under this org
	const existing = await db.query.bookings.findFirst({
		where: and(eq(bookings.id, bookingId), eq(bookings.organizationId, orgId)),
	});
	if (!existing) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	// Perform update in one transaction
	await db.transaction(async (tx) => {
		// 1) Update booking row
		await tx
			.update(bookings)
			.set({
				name: data.bookingName,
				bookingType: data.bookingType,
				packageType: data.packageType,
				packageCost: data.packageCost,
				note: data.note,
			})
			.where(
				and(eq(bookings.id, bookingId), eq(bookings.organizationId, orgId)),
			);

		// 2) Replace participants
		//    a) delete existing links
		await tx
			.delete(bookingParticipants)
			.where(eq(bookingParticipants.bookingId, bookingId));

		//    b) insert each participant as new client + join
		for (const p of data.participants) {
			const [cl] = await tx
				.insert(clients)
				.values({
					organizationId: orgId,
					name: p.name,
					phoneNumber: p.phone,
					email: p.email,
					address: p.address,
					metadata: p.metadata,
				})
				.returning({ id: clients.id });

			await tx.insert(bookingParticipants).values({
				bookingId,
				clientId: cl.id,
				role: p.role,
			});
		}

		// 3) Replace shoots & assignments
		await tx.delete(shoots).where(eq(shoots.bookingId, bookingId));
		if (data.shoots?.length) {
			const insertedShoots = await tx
				.insert(shoots)
				.values(
					data.shoots.map((s) => ({
						bookingId,
						organizationId: orgId,
						title: s.title,
						date: s.date,
						time: s.time,
						reportingTime: undefined,
						duration: undefined,
						location: s.location,
						notes: data.note,
						additionalServices: undefined,
					})),
				)
				.returning({ id: shoots.id });

			for (let i = 0; i < data.shoots.length; i++) {
				const s = data.shoots[i];
				const sid = insertedShoots[i].id;
				if (s.crews?.length) {
					await tx.insert(shootsAssignments).values(
						s.crews.map((cid) => ({
							shootId: sid,
							crewId: Number.parseInt(cid, 10),
							organizationId: orgId,
							isLead: false,
							assignedAt: new Date(),
							createdAt: new Date(),
							updatedAt: new Date(),
						})),
					);
				}
			}
		}

		// 4) Replace deliverables
		await tx.delete(deliverables).where(eq(deliverables.bookingId, bookingId));
		if (data.deliverables?.length) {
			await tx.insert(deliverables).values(
				data.deliverables.map((d) => ({
					bookingId,
					organizationId: orgId,
					title: d.title,
					isPackageIncluded: true,
					cost: d.cost,
					quantity: Number.parseInt(d.quantity, 10),
					dueDate: d.dueDate,
				})),
			);
		}

		// 5) Replace receivedAmounts
		await tx
			.delete(receivedAmounts)
			.where(eq(receivedAmounts.bookingId, bookingId));

		if (data.payments?.length) {
			await tx.insert(receivedAmounts).values(
				data.payments.map((pmt) => ({
					bookingId,
					organizationId: orgId,
					amount: pmt.amount,
					description: pmt.description,
					paidOn: pmt.date,
				})),
			);
		}

		// 6) Replace paymentSchedules
		await tx
			.delete(paymentSchedules)
			.where(eq(paymentSchedules.bookingId, bookingId));

		if (data.scheduledPayments?.length) {
			await tx.insert(paymentSchedules).values(
				data.scheduledPayments.map((sch) => ({
					bookingId,
					organizationId: orgId,
					amount: sch.amount,
					description: sch.description,
					dueDate: sch.dueDate,
				})),
			);
		}
	});

	return NextResponse.json(
		{ data: { bookingId }, message: "Booking updated successfully" },
		{ status: 200 },
	);
}
