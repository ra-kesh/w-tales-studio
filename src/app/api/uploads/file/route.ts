import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { deleteObject, getDownloadUrl } from "@/lib/storage";

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

export async function POST(request: Request) {
	try {
		const { session } = await getServerSession();
		if (!session?.user?.id || !session.session.activeOrganizationId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { key }: { key: string } = await request.json();
		if (!key) {
			return new NextResponse("File key is required", { status: 400 });
		}

		// Security Check: Ensure the key belongs to the user's organization
		const orgId = session.session.activeOrganizationId;
		if (!key.startsWith(`orgs/${orgId}/`)) {
			return new NextResponse("Forbidden", { status: 403 });
		}

		// Generate a short-lived URL (e.g., valid for 60 seconds)
		const downloadUrl = await getDownloadUrl(key, 60);

		return NextResponse.json({ url: downloadUrl });
	} catch (error) {
		console.error("Error generating download URL:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
