import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { receivedPaymentFormSchema } from "@/app/(dashboard)/payments/_component/received-payment-form-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { bookings, receivedAmounts } from "@/lib/db/schema";

interface RouteContext {
	params: {
		id: string;
	};
}

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
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

	try {
		if (Number.isNaN(paymentId)) {
			return NextResponse.json(
				{ message: "Invalid ID format" },
				{ status: 400 },
			);
		}

		const payment = await db.query.receivedAmounts.findFirst({
			where: and(
				eq(receivedAmounts.id, paymentId),
				eq(receivedAmounts.organizationId, activeOrganizationId),
			),
			with: {
				booking: {
					columns: { name: true },
				},
			},
		});

		if (!payment) {
			return NextResponse.json(
				{ message: "Payment not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				...payment,
				bookingId: payment.bookingId.toString(),
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(`Error fetching payment ${paymentId}:`, error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
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

	try {
		const body = await request.json();
		// 3. Validation
		const validatedData = receivedPaymentFormSchema.parse(body);
		const { bookingId, amount, description, paidOn } = validatedData;

		const existingPayment = await db.query.receivedAmounts.findFirst({
			where: and(
				eq(receivedAmounts.id, paymentId),
				eq(receivedAmounts.organizationId, activeOrganizationId),
			),
		});

		if (!existingPayment) {
			return NextResponse.json(
				{ message: "Payment not found" },
				{ status: 404 },
			);
		}

		const bookingExists = await db.query.bookings.findFirst({
			where: and(
				eq(bookings.id, Number(bookingId)),
				eq(bookings.organizationId, activeOrganizationId),
			),
		});

		if (!bookingExists) {
			return NextResponse.json(
				{ message: "Booking not found" },
				{ status: 404 },
			);
		}

		const updatedPayment = await db
			.update(receivedAmounts)
			.set({
				bookingId: Number(bookingId),
				amount,
				description: description || "",
				paidOn,
				updatedAt: new Date(),
			})
			.where(eq(receivedAmounts.id, paymentId))
			.returning();

		return NextResponse.json(updatedPayment[0], { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.errors }, { status: 400 });
		}
		console.error(`Error updating payment ${paymentId}:`, error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
