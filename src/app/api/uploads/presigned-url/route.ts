import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getUploadUrl } from "@/lib/storage";

const UPLOAD_CONTEXTS = {
	submissions: "submissions",
	receipts: "receipts",
	logos: "logos",
	invoices: "invoices",
	payments: "payments",
} as const;

type UploadContext = keyof typeof UPLOAD_CONTEXTS;

const sanitizeFilename = (filename: string): string => {
	return filename
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/[^a-zA-Z0-9-.]/g, "");
};

export async function POST(request: Request) {
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
		const {
			fileName,
			fileType,
			context,
		}: { fileName: string; fileType: string; context: UploadContext } =
			await request.json();

		if (!context || !UPLOAD_CONTEXTS[context]) {
			return new NextResponse("Invalid upload context", { status: 400 });
		}

		const folderPath = UPLOAD_CONTEXTS[context];
		const sanitizedFile = sanitizeFilename(fileName);
		const timestamp = Date.now();

		const key = `orgs/${userOrganizationId}/${folderPath}/${timestamp}-${randomUUID()}-${sanitizedFile}`;

		const url = await getUploadUrl(key, fileType);

		return NextResponse.json({ url, key });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
