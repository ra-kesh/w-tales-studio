// app/api/me/assignments/deliverables/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getAllUserDeliverableAssignments } from "@/lib/db/queries";

export async function GET(request: Request) {
	const { session } = await getServerSession();
	if (!session?.user?.id || !session.session.activeOrganizationId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const pageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);

		const result = await getAllUserDeliverableAssignments({
			userId: session.user.id,
			organizationId: session.session.activeOrganizationId,
			page,
			pageSize,
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error fetching all deliverable assignments:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
