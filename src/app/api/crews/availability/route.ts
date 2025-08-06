import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { shoots, shootsAssignments } from "@/lib/db/schema";

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

	const { searchParams } = new URL(request.url);
	const date = searchParams.get("date");

	if (!date) {
		return NextResponse.json(
			{ message: "Date parameter is required" },
			{ status: 400 },
		);
	}

	try {
		const shootsOnDate = await db
			.select({ id: shoots.id })
			.from(shoots)
			.where(and(eq(shoots.date, date), eq(shoots.organizationId, orgId)));

		if (shootsOnDate.length === 0) {
			return NextResponse.json({ data: [] }, { status: 200 });
		}

		const shootIds = shootsOnDate.map((s) => s.id);

		const assignments = await db
			.selectDistinct({ crewId: shootsAssignments.crewId })
			.from(shootsAssignments)
			.where(inArray(shootsAssignments.shootId, shootIds));

		const assignedCrewIds = assignments.map((a) => a.crewId);

		return NextResponse.json({ data: assignedCrewIds }, { status: 200 });
	} catch (error) {
		console.error("Error fetching crew availability:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
