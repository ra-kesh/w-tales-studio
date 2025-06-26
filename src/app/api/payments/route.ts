import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { receivedAmounts, paymentSchedules } from "@/lib/db/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const ReceivedPaymentSchema = z.object({
	booking_id: z.number(),
	invoice_id: z.number().optional(),
	amount: z.number(),
	description: z.string(),
	paid_on: z.string(),
});

const ScheduledPaymentSchema = z.object({
	booking_id: z.number(),
	amount: z.number(),
	description: z.string(),
	due_date: z.string(),
});

export async function POST(request: Request) {
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

	const body = await request.json();
	const { type, ...data } = body;

	if (type === "received") {
		const parse = ReceivedPaymentSchema.safeParse(data);
		if (!parse.success) {
			return NextResponse.json(
				{ message: "Validation error", errors: parse.error.errors },
				{ status: 400 },
			);
		}
		try {
			await db.insert(receivedAmounts).values(parse.data);
			return NextResponse.json(
				{ message: "Received payment created successfully" },
				{ status: 201 },
			);
		} catch (err) {
			console.error("Error creating received payment:", err);
			return NextResponse.json(
				{ message: "Internal server error" },
				{ status: 500 },
			);
		}
	} else if (type === "scheduled") {
		const parse = ScheduledPaymentSchema.safeParse(data);
		if (!parse.success) {
			return NextResponse.json(
				{ message: "Validation error", errors: parse.error.errors },
				{ status: 400 },
			);
		}
		try {
			await db.insert(paymentSchedules).values(parse.data);
			return NextResponse.json(
				{ message: "Scheduled payment created successfully" },
				{ status: 201 },
			);
		} catch (err) {
			console.error("Error creating scheduled payment:", err);
			return NextResponse.json(
				{ message: "Internal server error" },
				{ status: 500 },
			);
		}
	} else {
		return NextResponse.json(
			{ message: "Invalid payment type" },
			{ status: 400 },
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
		const type = searchParams.get("type");

		if (type === "received") {
			const results = await db
				.select()
				.from(receivedAmounts)
				.where(eq(receivedAmounts.organizationId, userOrganizationId));
			return NextResponse.json({ data: results }, { status: 200 });
		} else if (type === "scheduled") {
			const results = await db
				.select()
				.from(paymentSchedules)
				.where(eq(paymentSchedules.organizationId, userOrganizationId));
			return NextResponse.json({ data: results }, { status: 200 });
		} else {
			const received = await db
				.select()
				.from(receivedAmounts)
				.where(eq(receivedAmounts.organizationId, userOrganizationId));
			const scheduled = await db
				.select()
				.from(paymentSchedules)
				.where(eq(paymentSchedules.organizationId, userOrganizationId));
			return NextResponse.json({ received, scheduled }, { status: 200 });
		}
	} catch (error: unknown) {
		console.error("Error fetching payments:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
