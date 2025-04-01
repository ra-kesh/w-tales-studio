import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { bookings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/dal";
import { getBookingDetail } from "@/lib/db/queries";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
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
		const { id } = await params;
		const bookingId = Number.parseInt(id, 10);

		const response = await getBookingDetail(userOrganizationId, bookingId);

		return NextResponse.json(response, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching booking:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
