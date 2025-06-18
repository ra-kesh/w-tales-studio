// app/api/dashboard/v1/route.ts (Corrected and Simplified)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getDashboardData } from "@/lib/db/queries";

export async function GET(request: Request) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;

	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "Active organization not found" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);

		// CHANGED: Use a single, central interval filter. Default to '30d'.
		const interval = searchParams.get("interval") || "30d";

		const dashboardData = await getDashboardData({
			organizationId: userOrganizationId,
			interval: interval, // Pass the single interval
		});

		return NextResponse.json(dashboardData);
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown server error";
		return NextResponse.json(
			{ message: "Failed to fetch dashboard data", error: errorMessage },
			{ status: 500 },
		);
	}
}
