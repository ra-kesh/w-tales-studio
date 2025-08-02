// app/api/submissions/[id]/claim/route.ts
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { assignmentSubmissions, crews, members } from "@/lib/db/schema";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const submissionId = parseInt(id, 10);

	try {
		const { session } = await getServerSession();
		if (!session?.user?.id || !session.session.activeOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const canUpdate = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { task: ["review"], deliverable: ["review"] } },
		});

		if (!canUpdate) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const userId = session.user.id;
		const organizationId = session.session.activeOrganizationId;

		const callerInfo = await db
			.select({
				id: crews.id,
				// role: crews.role
			})
			.from(crews)
			.innerJoin(members, eq(crews.memberId, members.id))
			.where(
				and(
					eq(members.userId, userId),
					eq(members.organizationId, organizationId),
				),
			)
			.limit(1);

		if (!callerInfo) {
			return NextResponse.json(
				{ message: "Caller is not a member of this organization" },
				{ status: 403 },
			);
		}
		const callerCrewId = callerInfo[0].id;

		// // Get the caller's crewId
		// const callerInfo = await db.query.members.findFirst({
		// 	where: and(
		// 		eq(members.userId, session.user.id),
		// 		eq(members.organizationId, session.session.activeOrganizationId),
		// 	),
		// 	with: { crew: { columns: { id: true } } },
		// });
		// if (!callerInfo?.crew?.id) {
		// 	return NextResponse.json(
		// 		{ message: "User is not a crew member." },
		// 		{ status: 403 },
		// 	);
		// }
		// const callerCrewId = callerInfo.crew.id;

		// 2. Core Logic: Atomically update the submission
		// We find the submission and update it in one step.
		const [updatedSubmission] = await db
			.update(assignmentSubmissions)
			.set({ currentReviewer: callerCrewId })
			.where(
				and(
					eq(assignmentSubmissions.id, submissionId),
					isNull(assignmentSubmissions.currentReviewer), // IMPORTANT: Prevents race conditions. Only claim if it's unassigned.
				),
			)
			.returning();

		if (!updatedSubmission) {
			return NextResponse.json(
				{
					message:
						"Submission could not be claimed. It may have already been assigned.",
				},
				{ status: 409 },
			); // 409 Conflict
		}

		return NextResponse.json(updatedSubmission);
	} catch (error) {
		console.error(`Failed to claim submission ${id}:`, error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
