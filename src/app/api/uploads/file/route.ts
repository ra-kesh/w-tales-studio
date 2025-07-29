import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { deleteObject } from "@/lib/storage";

export async function DELETE(request: Request) {
	try {
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
		const { key }: { key: string } = await request.json();

		if (!key) {
			return new NextResponse("File key is required", { status: 400 });
		}

		const keyOrgId = key.split("/")[1];

		if (keyOrgId !== userOrganizationId) {
			return new NextResponse("Forbidden", { status: 403 });
		}

		await deleteObject(key);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting file:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
