import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getClientDetail } from "@/lib/db/queries";

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
		const clientId = Number.parseInt(id, 10);

		const client = await getClientDetail(userOrganizationId, clientId);

		if (!client) {
			return NextResponse.json(
				{ message: "Client not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(client);
	} catch (error: unknown) {
		console.error("Error fetching client:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
