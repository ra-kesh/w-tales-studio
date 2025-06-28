// src/app/api/payment-schedules/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import {
	getPaymentSchedules,
	type ScheduledPaymentFilters,
} from "@/lib/db/queries";

export async function GET(request: Request) {
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

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);

		// Add sort parsing here if needed in the future

		const filters: ScheduledPaymentFilters = {
			description: searchParams.get("description") || undefined,
			dueDate: searchParams.get("dueDate") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
		};

		const result = await getPaymentSchedules(
			orgId,
			page,
			limit,
			undefined,
			filters,
		);

		return NextResponse.json(result, { status: 200 });
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
