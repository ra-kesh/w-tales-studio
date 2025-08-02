import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	assignmentSubmissions,
	crews,
	deliverables,
	members,
	notifications,
	tasks,
} from "@/lib/db/schema";

const reviewSchema = z.object({
	action: z.enum(["approve", "request_changes"]),
	reviewComment: z.string().optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const submissionId = parseInt(id, 10);

	if (isNaN(submissionId)) {
		return NextResponse.json(
			{ message: "Invalid submission ID" },
			{ status: 400 },
		);
	}

	try {
		const { session } = await getServerSession();
		if (!session?.user?.id || !session.session.activeOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const userId = session.user.id;
		const organizationId = session.session.activeOrganizationId;

		// 2. Authorization (Consistent with your other routes)
		const canReview = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { task: ["review"], deliverable: ["review"] } },
		});
		if (!canReview) {
			return NextResponse.json(
				{
					message:
						"Forbidden: You do not have permission to review submissions.",
				},
				{ status: 403 },
			);
		}

		// 3. Get Reviewer's Crew ID (Consistent pattern)
		const callerInfoResult = await db
			.select({ id: crews.id })
			.from(crews)
			.innerJoin(members, eq(crews.memberId, members.id))
			.where(
				and(
					eq(members.userId, userId),
					eq(members.organizationId, organizationId),
				),
			)
			.limit(1);

		if (callerInfoResult.length === 0) {
			return NextResponse.json(
				{ message: "Reviewer is not a registered crew member." },
				{ status: 403 },
			);
		}
		const reviewerCrewId = callerInfoResult[0].id;

		// 4. Parse and Validate Payload
		const body = await request.json();
		const validation = reviewSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid request body", errors: validation.error.issues },
				{ status: 400 },
			);
		}
		const { action, reviewComment } = validation.data;

		// 5. Execute Logic within a Transaction
		const updatedSubmission = await db.transaction(async (tx) => {
			const submission = await tx.query.assignmentSubmissions.findFirst({
				where: eq(assignmentSubmissions.id, submissionId),
			});
			if (!submission) {
				throw new Error("Submission not found.");
			}

			const [result] = await tx
				.update(assignmentSubmissions)
				.set({
					status: action === "approve" ? "approved" : "changes_requested",
					reviewedBy: reviewerCrewId,
					reviewComment: reviewComment,
					reviewedAt: new Date(),
				})
				.where(eq(assignmentSubmissions.id, submissionId))
				.returning();

			if (action === "approve") {
				const parentUpdatePayload = {
					status: "completed",
					workflowStatus: "approved",
					approvedAt: new Date(),
					approvedSubmissionId: submissionId,
				};
				if (submission.assignmentType === "task") {
					await tx
						.update(tasks)
						.set(parentUpdatePayload)
						.where(eq(tasks.id, submission.assignmentId));
				} else {
					await tx
						.update(deliverables)
						.set(parentUpdatePayload)
						.where(eq(deliverables.id, submission.assignmentId));
				}
			} else {
				const parentUpdatePayload = { workflowStatus: "revision_needed" };
				if (submission.assignmentType === "task") {
					await tx
						.update(tasks)
						.set(parentUpdatePayload)
						.where(eq(tasks.id, submission.assignmentId));
				} else {
					await tx
						.update(deliverables)
						.set(parentUpdatePayload)
						.where(eq(deliverables.id, submission.assignmentId));
				}
			}

			await tx.insert(notifications).values({
				crewId: submission.submittedBy,
				notificationType: "submission_review",
				assignmentType: submission.assignmentType,
				assignmentId: submission.assignmentId,
				message: `Your submission for the ${submission.assignmentType} has been ${action === "approve" ? "approved" : "reviewed with change requests"}.`,
			});

			return result;
		});

		return NextResponse.json(updatedSubmission, { status: 200 });
	} catch (error) {
		console.error(`Review submission failed for ID ${id}:`, error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal Server Error";
		const statusCode = errorMessage.startsWith("Forbidden") ? 403 : 500;
		return NextResponse.json({ message: errorMessage }, { status: statusCode });
	}
}
