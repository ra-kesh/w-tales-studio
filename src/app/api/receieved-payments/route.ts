// src/app/api/received-payments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import {
	getReceivedPayments,
	type ReceivedPaymentFilters,
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

		const filters: ReceivedPaymentFilters = {
			description: searchParams.get("description") || undefined,
			paidOn: searchParams.get("paidOn") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
			invoiceId: searchParams.get("invoiceId") || undefined,
		};

		const result = await getReceivedPayments(
			orgId,
			page,
			limit,
			undefined,
			filters,
		);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching received payments:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
