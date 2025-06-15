import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { crews } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: { id: string } }) {
	try {
		const { session } = await getServerSession();
		const userOrganizationId = session?.session.activeOrganizationId;

		if (!userOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const paramsId = await Number.parseInt(params.id, 10);

		const crew = await db.query.crews.findFirst({
			where: and(
				eq(crews.id, paramsId),
				eq(crews.organizationId, userOrganizationId),
			),
			with: {
				member: {
					with: {
						user: {
							columns: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!crew) {
			return NextResponse.json(
				{ message: "Crew member not found" },
				{ status: 404 },
			);
		}

		// Transform data to include member information
		const transformedData = {
			...crew,
			memberName: crew.member?.user.name,
			memberEmail: crew.member?.user.email,
		};

		return NextResponse.json(transformedData);
	} catch (error) {
		console.error("Error in GET /api/crews/[id]:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { session } = await getServerSession();
		const userOrganizationId = session?.session.activeOrganizationId;

		if (!userOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const json = await request.json();

		const [updated] = await db
			.update(crews)
			.set({
				...json,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(crews.id, Number.parseInt(params.id)),
					eq(crews.organizationId, userOrganizationId),
				),
			)
			.returning();

		if (!updated) {
			return NextResponse.json(
				{ message: "Crew member not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(updated);
	} catch (error) {
		console.error("Error in PUT /api/crews/[id]:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
