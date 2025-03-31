import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { shoots, bookings } from "@/lib/db/schema";
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

		// Fetch shoots with pagination using relational query
		// const shootsData = await db.query.shoots.findMany({
		// 	// leftjoin:eq(shoots.bookingId, bookings.id),
		// 	where: eq(bookings.organizationId, userOrganizationId),
		// 	with: {
		// 		booking: {
		// 			columns: {
		// 				id: true,
		// 				name: true,
		// 				organizationId: true,
		// 			},
		// 		},
		// 	},
		// 	limit,
		// 	offset,
		// });

		// // Filter shoots by organizationId (since the organizationId is in the bookings table)
		// const filteredShootsData = shootsData.filter(
		// 	(shoot) => shoot.booking?.organizationId === userOrganizationId,
		// );

		// // Fetch the total count for pagination
		// const totalData = await db
		// 	.select({ count: count() })
		// 	.from(shoots)
		// 	.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
		// 	.where(eq(bookings.organizationId, userOrganizationId));

		// const total = totalData[0].count;

		const [shootData, totalData] = await Promise.all([
			db
				.select({
					id: shoots.id,
					bookingId: shoots.bookingId,
					bookingName: bookings.name,
					title: shoots.title,
					date: shoots.date,
					time: shoots.time,
					reportingTime: shoots.reportingTime,
					duration: shoots.duration,
					city: shoots.city,
					venue: shoots.venue,
					notes: shoots.notes,
					additionalServices: shoots.additionalServices,
					createdAt: shoots.createdAt,
					updatedAt: shoots.updatedAt,
				})
				.from(shoots)
				.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(shoots)
				.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId)),
		]);

		const total = totalData[0].count;

		return NextResponse.json(
			{
				data: shootData,
				total,
				page,
				limit,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching shoots:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
