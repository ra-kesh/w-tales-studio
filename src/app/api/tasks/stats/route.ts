// app/api/tasks/stats/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getTasksStats } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
	const { session } = await getServerSession();
	const searchParams = request.nextUrl.searchParams;
	const orgId = searchParams.get("orgId");

	if (!session || !orgId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const stats = await getTasksStats(orgId);
		return NextResponse.json(stats);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch stats" },
			{ status: 500 },
		);
	}
}
