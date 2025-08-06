import { and, eq, ne, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";
import { receivedPaymentFormSchema } from "@/app/(dashboard)/payments/_component/received-payment-form-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import {
	attachments,
	bookings,
	paymentSchedules,
	receivedAmounts,
} from "@/lib/db/schema";

interface RouteContext {
	params: {
		id: string;
	};
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

		const attachment = await db.query.attachments.findFirst({
			where: and(
				eq(attachments.resourceType, "received_payment"),
				eq(attachments.resourceId, payment.id.toString()),
			),
		});

		return NextResponse.json(
			{
				...payment,
				bookingId: payment.bookingId.toString(),
				attachment: attachment
					? {
							name: attachment.fileName,
							size: attachment.fileSize,
							type: attachment.mimeType,
							key: attachment.filePath,
							url: `${process.env.AWS_ENDPOINT_URL_S3}/${attachment.filePath}`,
						}
					: null,
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

	const validatedData = receivedPaymentFormSchema.parse(body);
	const { bookingId, amount, description, paidOn, attachment } = validatedData;
	const numericBookingId = Number(bookingId);

	const existingPayment = await db.query.receivedAmounts.findFirst({
		where: and(
			eq(receivedAmounts.id, paymentId),
			eq(receivedAmounts.organizationId, activeOrganizationId),
		),
	});

	if (!existingPayment) {
		return NextResponse.json({ message: "Payment not found" }, { status: 404 });
	}

	const bookingExists = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, Number(bookingId)),
			eq(bookings.organizationId, activeOrganizationId),
		),
	});

	if (!bookingExists) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	const [otherReceivedTotalResult] = await db
		.select({ total: sum(receivedAmounts.amount) })
		.from(receivedAmounts)
		.where(
			and(
				eq(receivedAmounts.bookingId, numericBookingId),
				ne(receivedAmounts.id, Number(id)),
			),
		);
	const [scheduledTotalResult] = await db
		.select({ total: sum(paymentSchedules.amount) })
		.from(paymentSchedules)
		.where(eq(paymentSchedules.bookingId, numericBookingId));

	const totalOfOtherPayments =
		(Number(otherReceivedTotalResult?.total) || 0) +
		(Number(scheduledTotalResult?.total) || 0);
	const newGrandTotal = totalOfOtherPayments + parseFloat(amount);

	if (newGrandTotal > parseFloat(bookingExists.packageCost)) {
		return NextResponse.json(
			{ message: "Total of all payments cannot exceed the package cost." },
			{ status: 400 },
		);
	}

	try {
		const updatedPayment = await db.transaction(async (tx) => {
			const [payment] = await tx
				.update(receivedAmounts)
				.set({
					bookingId: Number(bookingId),
					amount,
					description: description || "N/a",
					paidOn,
					updatedAt: new Date(),
				})
				.where(eq(receivedAmounts.id, paymentId))
				.returning();

			const existingAttachment = await tx.query.attachments.findFirst({
				where: and(
					eq(attachments.resourceType, "received_payment"),
					eq(attachments.resourceId, paymentId.toString()),
				),
			});

			if (attachment && !existingAttachment) {
				await tx.insert(attachments).values({
					organizationId: activeOrganizationId,
					resourceType: "received_payment",
					resourceId: paymentId.toString(),
					subType: "payment_proof",
					fileName: attachment.name,
					filePath: attachment.key,
					fileSize: attachment.size,
					mimeType: attachment.type,
					uploadedBy: session.user.id,
				});
			} else if (attachment && existingAttachment) {
				await tx
					.update(attachments)
					.set({
						fileName: attachment.name,
						filePath: attachment.key,
						fileSize: attachment.size,
						mimeType: attachment.type,
						uploadedBy: session.user.id,
						updatedAt: new Date(),
					})
					.where(eq(attachments.id, existingAttachment.id));
			} else if (!attachment && existingAttachment) {
				await tx
					.delete(attachments)
					.where(eq(attachments.id, existingAttachment.id));
			}

			return payment;
		});

		return NextResponse.json(
			{
				id: updatedPayment.id,
				bookingId: numericBookingId,
			},
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.issues }, { status: 400 });
		}
		console.error(`Error updating payment ${paymentId}:`, error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
