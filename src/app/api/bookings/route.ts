import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { bookings, clients } from "@/lib/db/schema";
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

		const bookingsData = await db.query.bookings.findMany({
			where: eq(bookings.organizationId, userOrganizationId),
			with: {
				clients: true,
				shoots: true,
			},
			limit,
			offset,
		});

		const total = await db.$count(
			bookings,
			eq(bookings.organizationId, userOrganizationId),
		);

		return NextResponse.json(
			{
				data: bookingsData,
				total,
				page,
				limit,
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
