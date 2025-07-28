import { and, eq, ne, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";
import { updateScheduledPaymentSchema } from "@/app/(dashboard)/payments/_component/scheduled-payment-form-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { bookings, paymentSchedules, receivedAmounts } from "@/lib/db/schema";

interface RouteContext {
	params: { id: string };
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const activeOrganizationId = session.session.activeOrganizationId;

	if (!activeOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}
	const canReadPayment = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				payment: ["read"],
			},
		},
	});

	if (!canReadPayment) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const paymentId = Number.parseInt(id, 10);

	const payment = await db.query.paymentSchedules.findFirst({
		where: and(
			eq(paymentSchedules.id, paymentId),
			eq(paymentSchedules.organizationId, activeOrganizationId),
		),
		with: { booking: { columns: { name: true } } },
	});

	if (!payment) {
		return NextResponse.json({ message: "Payment not found" }, { status: 404 });
	}
	return NextResponse.json(
		{ ...payment, bookingId: payment.bookingId.toString() },
		{ status: 200 },
	);
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const activeOrganizationId = session.session.activeOrganizationId;

	if (!activeOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}
	const canUpdatePayment = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				payment: ["update"],
			},
		},
	});

	if (!canUpdatePayment) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const paymentId = Number.parseInt(id, 10);

	const body = await request.json();
	const validatedData = updateScheduledPaymentSchema.parse({
		...body,
		id: paymentId,
	});

	const { bookingId, amount, description, dueDate } = validatedData;
	const numericBookingId = Number(bookingId);

	const existingPayment = await db.query.paymentSchedules.findFirst({
		where: and(
			eq(paymentSchedules.id, Number(id)),
			eq(paymentSchedules.organizationId, activeOrganizationId),
		),
	});
	if (!existingPayment) {
		return NextResponse.json(
			{ message: "Scheduled payment not found" },
			{ status: 404 },
		);
	}

	// b) Verify the associated booking exists and belongs to the org
	const booking = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, numericBookingId),
			eq(bookings.organizationId, activeOrganizationId),
		),
	});
	if (!booking) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	const [receivedTotalResult] = await db
		.select({ total: sum(receivedAmounts.amount) })
		.from(receivedAmounts)
		.where(eq(receivedAmounts.bookingId, numericBookingId));

	const [otherScheduledTotalResult] = await db
		.select({ total: sum(paymentSchedules.amount) })
		.from(paymentSchedules)
		.where(
			and(
				eq(paymentSchedules.bookingId, numericBookingId),
				ne(paymentSchedules.id, Number(id)),
			),
		);

	const totalOfOtherPayments =
		(Number(receivedTotalResult?.total) || 0) +
		(Number(otherScheduledTotalResult?.total) || 0);
	const newGrandTotal = totalOfOtherPayments + parseFloat(amount);

	if (newGrandTotal > parseFloat(booking.packageCost)) {
		return NextResponse.json(
			{ message: "Total of all payments cannot exceed the package cost." },
			{ status: 400 },
		);
	}

	try {
		const updatedPayment = await db
			.update(paymentSchedules)
			.set({
				bookingId: Number(bookingId),
				amount,
				description: description || "n/a",
				dueDate: dueDate,
				updatedAt: new Date(),
			})
			.where(eq(paymentSchedules.id, Number(id)))
			.returning();

		return NextResponse.json(updatedPayment[0], { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.issues }, { status: 400 });
		}
		console.error(`Error updating scheduled payment ${paymentId}:`, error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
