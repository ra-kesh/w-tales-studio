import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { clients } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, count } from "drizzle-orm";

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	console.log(session);

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
		// Get pagination parameters from the query string
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
		const offset = (page - 1) * limit;

		// Fetch clients for the user's organization with pagination
		const [clientData, totalData] = await Promise.all([
			db
				.select()
				.from(clients)
				.where(eq(clients.organizationId, userOrganizationId))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(clients)
				.where(eq(clients.organizationId, userOrganizationId)),
		]);

		const total = totalData[0].count;

		return NextResponse.json(
			{
				data: clientData,
				total,
				page,
				limit,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching clients:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
