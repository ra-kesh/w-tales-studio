// app/api/submissions/route.ts

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	assignmentSubmissions,
	crews,
	deliverables,
	deliverablesAssignments,
	members,
	submissionFiles,
	tasks,
	tasksAssignments,
} from "@/lib/db/schema";

const createSubmissionSchema = z.object({
	assignmentType: z.enum(["task", "deliverable"]),
	status: z.string(),
	comment: z.string().optional(),
	submissionLinks: z.array(z.string().url()).optional(),
	files: z
		.array(
			z.object({
				key: z.string(),
				name: z.string(),
				size: z.number(),
				url: z.string().url(),
			}),
		)
		.optional(),
	taskId: z.number().optional(),
	deliverableId: z.number().optional(),
	delegateCrewId: z.number().optional(),
});

export async function POST(request: Request) {
	try {
		const { session } = await getServerSession();

		if (!session?.user?.id || !session.session.activeOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;
		const organizationId = session.session.activeOrganizationId;

		const callerInfo = await db
			.select({ id: crews.id, role: crews.role })
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
		const callerRole = callerInfo[0].role;
		const isManager = ["manager"].includes(callerRole ?? "");

		const body = await request.json();
		const validation = createSubmissionSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid request body", errors: validation.error.issues },
				{ status: 400 },
			);
		}
		const {
			assignmentType,
			taskId,
			deliverableId,
			delegateCrewId,
			files,
			...data
		} = validation.data;

		const assignmentId = assignmentType === "task" ? taskId : deliverableId;

		if (!assignmentId) {
			return NextResponse.json(
				{ message: "Missing taskId or deliverableId" },
				{ status: 400 },
			);
		}

		let submittedByCrewId: number;

		if (delegateCrewId) {
			if (!isManager) {
				return NextResponse.json(
					{
						message: "Forbidden: Only managers can submit on behalf of others.",
					},
					{ status: 403 },
				);
			}
			submittedByCrewId = delegateCrewId;
		} else {
			if (!callerCrewId) {
				return NextResponse.json(
					{ message: "Forbidden: You are not registered as a crew member." },
					{ status: 403 },
				);
			}
			submittedByCrewId = callerCrewId;

			if (assignmentType === "task") {
				const assignment = await db.query.tasksAssignments.findFirst({
					where: and(
						eq(tasksAssignments.taskId, assignmentId),
						eq(tasksAssignments.crewId, submittedByCrewId),
					),
				});

				if (!assignment)
					throw new Error("Forbidden: You are not assigned to this task.");
			} else {
				const assignment = await db.query.deliverablesAssignments.findFirst({
					where: and(
						eq(deliverablesAssignments.deliverableId, assignmentId),
						eq(deliverablesAssignments.crewId, submittedByCrewId),
					),
				});
				if (!assignment)
					throw new Error(
						"Forbidden: You are not assigned to this deliverable.",
					);
			}
		}

		const newSubmission = await db.transaction(async (tx) => {
			const [submission] = await tx
				.insert(assignmentSubmissions)
				.values({
					assignmentType,
					assignmentId,
					status: data.status,
					comment: data.comment,
					powLinks: data.submissionLinks,
					submittedBy: submittedByCrewId,
					version: 1,
				})
				.returning();

			if (files && files.length > 0) {
				const fileRecords = files.map((file) => ({
					submissionId: submission.id,
					filePath: file.url,
					fileName: file.name,
					fileSize: file.size,
					uploadedBy: submittedByCrewId,
				}));
				await tx.insert(submissionFiles).values(fileRecords);
			}

			const parentUpdatePayload = {
				workflowStatus: data.status,
				lastStatusUpdateBy: submittedByCrewId,
				lastStatusUpdatedAt: new Date(),
			};

			if (assignmentType === "task") {
				await tx
					.update(tasks)
					.set(parentUpdatePayload)
					.where(eq(tasks.id, assignmentId));
			} else {
				await tx
					.update(deliverables)
					.set(parentUpdatePayload)
					.where(eq(deliverables.id, assignmentId));
			}

			// ... notification logic ...

			return submission;
		});

		return NextResponse.json(newSubmission, { status: 201 });
	} catch (error) {
		console.error("Submission creation failed:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal Server Error";
		const statusCode = errorMessage.startsWith("Forbidden") ? 403 : 500;
		return NextResponse.json({ message: errorMessage }, { status: statusCode });
	}
}
