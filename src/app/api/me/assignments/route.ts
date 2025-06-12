import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getUserAssignments } from "@/lib/db/queries";
import { z } from "zod";

const assignmentsQuerySchema = z.object({
	types: z
		.string()
		.optional()
		.transform((val) => (val ? val.split(",") : [])),
	status: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: Request) {
	const { session } = await getServerSession();
	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userOrganizationId = session.session.activeOrganizationId;

	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "No active organization selected" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const queryParams = assignmentsQuerySchema.safeParse(
			Object.fromEntries(searchParams),
		);

		if (!queryParams.success) {
			return NextResponse.json(
				{
					message: "Invalid query parameters",
					errors: queryParams.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const assignments = await getUserAssignments({
			userId: session.user.id,
			organizationId: userOrganizationId as string,
			...queryParams.data,
		});

		console.log("Assignments fetched:", assignments);

		if (!assignments) {
			return NextResponse.json(
				{ message: "User not found or not part of the crew." },
				{ status: 404 },
			);
		}

		return NextResponse.json(assignments, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching user assignments:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
