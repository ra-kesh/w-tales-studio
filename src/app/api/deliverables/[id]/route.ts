import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliverables } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/dal";

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

		const deliverableId = Number.parseInt(id, 10);

		const deliverable = await db.query.deliverables.findFirst({
			where: eq(deliverables.id, deliverableId),
			with: {
				booking: {
					columns: {
						name: true,
					},
				},
			},
		});

		if (!deliverable) {
			return new NextResponse("Deliverable not found", { status: 404 });
		}

		// Verify the deliverable belongs to the user's organization
		if (deliverable.organizationId !== session.session.activeOrganizationId) {
			return new NextResponse("Unauthorized", { status: 403 });
		}

		return NextResponse.json({ data: deliverable });
	} catch (error) {
		console.error("Error fetching deliverable:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
