import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { crews, bookings } from "@/lib/db/schema";
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

		const [crewData, totalData] = await Promise.all([
			db
				.select({
					id: crews.id,
					bookingId: crews.bookingId,
					bookingName: bookings.name,
					userId: crews.userId,
					freelancerName: crews.freelancerName,
					role: crews.role,
					isLead: crews.isLead,
					createdAt: crews.createdAt,
					updatedAt: crews.updatedAt,
				})
				.from(crews)
				.leftJoin(bookings, eq(crews.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(crews)
				.leftJoin(bookings, eq(crews.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId)),
		]);

		const total = totalData[0].count;

		return NextResponse.json(
			{
				data: crewData,
				total,
				page,
				limit,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching crews:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
