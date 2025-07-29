// app/api/uploads/presigned-url/route.ts

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getUploadUrl } from "@/lib/storage";

// Define our allowed upload contexts and their corresponding folder paths
const UPLOAD_CONTEXTS = {
	submissions: "submissions",
	receipts: "receipts",
	logos: "logos",
	// Add more as your app grows
} as const;

type UploadContext = keyof typeof UPLOAD_CONTEXTS;

// A simple function to sanitize filenames for URLs and S3 keys
const sanitizeFilename = (filename: string): string => {
	// 1. Replace spaces and multiple hyphens with a single hyphen
	// 2. Remove all characters that are not alphanumeric, a hyphen, or a dot.
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

		// 1. Security Validation: Ensure the context is valid
		if (!context || !UPLOAD_CONTEXTS[context]) {
			return new NextResponse("Invalid upload context", { status: 400 });
		}

		const folderPath = UPLOAD_CONTEXTS[context];
		const sanitizedFile = sanitizeFilename(fileName);
		const timestamp = Date.now();

		// 2. Build the final, secure key on the server
		const key = `orgs/${userOrganizationId}/${folderPath}/${timestamp}-${randomUUID()}-${sanitizedFile}`;

		const url = await getUploadUrl(key, fileType);

		return NextResponse.json({ url, key });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
