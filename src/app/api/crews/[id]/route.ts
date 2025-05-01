import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { crews } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

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
		const { id } = params;
		const crewId = Number.parseInt(id, 10);

		const crew = await db.query.crews.findFirst({
			where: and(
				eq(crews.id, crewId),
				eq(crews.organizationId, userOrganizationId),
			),
			with: {
				member: {
					with: {
						user: {
							columns: {
								name: true,
								email: true,
								image: true,
							},
						},
					},
				},
				assignments: true,
			},
		});

		if (!crew) {
			return NextResponse.json({ message: "Crew not found" }, { status: 404 });
		}

		return NextResponse.json(crew, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching crew:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
