import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { assignmentSubmissions } from "@/lib/db/schema";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ type: string; id: string }> },
) {
	try {
		const { type, id } = await params;
		const assignmentId = parseInt(id, 10);

		if ((type !== "task" && type !== "deliverable") || isNaN(assignmentId)) {
			return NextResponse.json(
				{ message: "Invalid request parameters" },
				{ status: 400 },
			);
		}

		const { session } = await getServerSession();

		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const submissions = await db.query.assignmentSubmissions.findMany({
			where: and(
				eq(assignmentSubmissions.assignmentType, type),
				eq(assignmentSubmissions.assignmentId, assignmentId),
			),
			with: {
				reviewedBy: {
					columns: { name: true },
					// do the below if necessary
					// with: {
					// 	member: {
					// 		with: {
					// 			user: {
					// 				columns: {
					// 					name: true,
					// 					email: true,
					// 					image: true,
					// 				},
					// 			},
					// 		},
					// 	},
					// },
				},
				submittedBy: { columns: { name: true } },
				files: true,
			},
			orderBy: desc(assignmentSubmissions.submittedAt),
		});

		return NextResponse.json(submissions);
	} catch (error) {
		console.error("Failed to fetch assignment submissions:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
