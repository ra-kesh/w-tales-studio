import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { paymentSchedules, bookings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { count, eq } from "drizzle-orm";

export async function GET(request: Request) {
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

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
		const offset = (page - 1) * limit;

		const [paymentScheduleData, totalData] = await Promise.all([
			db
				.select({
					id: paymentSchedules.id,
					bookingId: paymentSchedules.bookingId,
					bookingName: bookings.name,
					amount: paymentSchedules.amount,
					description: paymentSchedules.description,
					dueDate: paymentSchedules.dueDate,
					createdAt: paymentSchedules.createdAt,
					updatedAt: paymentSchedules.updatedAt,
				})
				.from(paymentSchedules)
				.leftJoin(bookings, eq(paymentSchedules.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(paymentSchedules)
				.leftJoin(bookings, eq(paymentSchedules.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId)),
		]);

		const total = totalData[0].count;

		return NextResponse.json(
			{
				data: paymentScheduleData,
				total,
				page,
				limit,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching payment schedules:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
