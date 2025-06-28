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

		const interval = searchParams.get("interval") || "all";

		const operationsInterval = searchParams.get("operationsInterval") || "7d";

		const dashboardData = await getDashboardData({
			organizationId: userOrganizationId,
			interval: interval,
			operationsInterval: operationsInterval,
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
