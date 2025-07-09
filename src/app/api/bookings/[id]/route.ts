import { and, eq, inArray, ne, not } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BookingSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { getBookingDetail } from "@/lib/db/queries";
import {
	bookingParticipants,
	bookings,
	clients,
	crews,
	deliverables,
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

// Depreacate this type of deleting and replacing apis and do something better

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
		body: {
			permissions: {
				booking: ["update"],
			},
		},
	});

	if (!canUpdateBooking) {
		return NextResponse.json(
			{ message: "You do not have permission to update booking." },
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

	const body = await request.json();
	const parse = BookingSchema.safeParse(body);
	if (!parse.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: parse.error.errors },
			{ status: 400 },
		);
	}
	const data = parse.data;

	const existing = await db.query.bookings.findFirst({
		where: and(eq(bookings.id, bookingId), eq(bookings.organizationId, orgId)),
	});
	if (!existing) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	const duplicate = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.organizationId, orgId),
			ne(bookings.id, bookingId),
			eq(bookings.name, data.bookingName),
		),
	});
	if (duplicate) {
		return NextResponse.json(
			{ message: "A booking with this name already exists." },
			{ status: 409 },
		);
	}

	const totalReceived =
		data.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) ?? 0;
	const totalScheduled =
		data.scheduledPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) ??
		0;
	const packageCost = parseFloat(data.packageCost);

	if (totalReceived + totalScheduled > packageCost) {
		return NextResponse.json(
			{
				message:
					"The sum of received and scheduled payments cannot exceed the package cost.",
			},
			{ status: 400 },
		);
	}

	const allCrewIds = Array.from(
		new Set(
			(data.shoots ?? [])
				.flatMap((s) => s.crews ?? [])
				.map((id) => Number.parseInt(id, 10))
				.filter((n) => !Number.isNaN(n)),
		),
	);
	if (allCrewIds.length) {
		const crewsFound = await db
			.select({ id: crews.id })
			.from(crews)
			.where(
				and(inArray(crews.id, allCrewIds), eq(crews.organizationId, orgId)),
			);

		const validIds = new Set(crewsFound.map((c) => c.id));
		const invalidIds = allCrewIds.filter((id) => !validIds.has(id));
		if (invalidIds.length) {
			return NextResponse.json(
				{ message: "Invalid crew IDs provided", invalid: invalidIds },
				{ status: 400 },
			);
		}
	}

	await db.transaction(async (tx) => {
		await tx
			.update(bookings)
			.set({
				name: data.bookingName,
				bookingType: data.bookingType,
				packageType: data.packageType,
				packageCost: data.packageCost,
				note: data.note,
				updatedAt: new Date(),
			})
			.where(
				and(eq(bookings.id, bookingId), eq(bookings.organizationId, orgId)),
			);

		await tx
			.delete(bookingParticipants)
			.where(eq(bookingParticipants.bookingId, bookingId));

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

		await tx.delete(shoots).where(eq(shoots.bookingId, bookingId));

		await tx
			.delete(shootsAssignments)
			.where(eq(shootsAssignments.shootId, bookingId));

		if (data.shoots?.length) {
			const newShoots = await tx
				.insert(shoots)
				.values(
					data.shoots.map((s) => ({
						bookingId,
						organizationId: orgId,
						title: s.title,
						date: s.date,
						time: s.time,
						location: s.location,
					})),
				)
				.returning({ id: shoots.id });

			const assigns = data.shoots.flatMap((s, idx) =>
				(s.crews ?? []).map((cid) => ({
					shootId: newShoots[idx].id,
					crewId: Number.parseInt(cid, 10),
					organizationId: orgId,
					isLead: false,
					assignedAt: new Date(),
				})),
			);
			if (assigns.length) await tx.insert(shootsAssignments).values(assigns);
		}

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

		/* 5) Replace received payments */
		await tx
			.delete(receivedAmounts)
			.where(eq(receivedAmounts.bookingId, bookingId));

		if (data.payments?.length) {
			await tx.insert(receivedAmounts).values(
				data.payments.map((p) => ({
					bookingId,
					organizationId: orgId,
					amount: p.amount,
					description: p.description,
					paidOn: p.date,
				})),
			);
		}

		await tx
			.delete(paymentSchedules)
			.where(eq(paymentSchedules.bookingId, bookingId));

		if (data.scheduledPayments?.length) {
			await tx.insert(paymentSchedules).values(
				data.scheduledPayments.map((sp) => ({
					bookingId,
					organizationId: orgId,
					amount: sp.amount,
					description: sp.description,
					dueDate: sp.dueDate,
				})),
			);
		}
	});

	return NextResponse.json(
		{ data: { bookingId }, message: "Booking updated successfully" },
		{ status: 200 },
	);
}
