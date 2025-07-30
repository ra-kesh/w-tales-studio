// app/api/submissions/route.ts

import { and, count, desc, eq, or } from "drizzle-orm";
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
		// const callerRole = callerInfo[0].role;
		// const isManager = ["owner", "studio_admin", "manager"].includes(
		// 	callerRole ?? "",
		// );

		// const roleObject = callerRole
		// 	? appRoles[callerRole as keyof typeof appRoles]
		// 	: undefined;

		// if (!roleObject) {
		// 	return NextResponse.json(
		// 		{ message: "Invalid user role configured." },
		// 		{ status: 403 },
		// 	);
		// }

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

		const hasManagerialPower = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { [assignmentType]: ["update"] } },
		});

		let isAssigned = false;

		if (callerCrewId) {
			if (assignmentType === "task") {
				const assignment = await db.query.tasksAssignments.findFirst({
					where: and(
						eq(tasksAssignments.taskId, assignmentId),
						eq(tasksAssignments.crewId, callerCrewId),
					),
				});
				isAssigned = !!assignment;
			} else {
				const assignment = await db.query.deliverablesAssignments.findFirst({
					where: and(
						eq(deliverablesAssignments.deliverableId, assignmentId),
						eq(deliverablesAssignments.crewId, callerCrewId),
					),
				});
				isAssigned = !!assignment;
			}
		}

		if (!hasManagerialPower && !isAssigned) {
			return NextResponse.json(
				{
					message: "Forbidden: You do not have permission for this assignment.",
				},
				{ status: 403 },
			);
		}

		let submittedByCrewId: number;

		if (delegateCrewId) {
			if (!hasManagerialPower) {
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
					{
						message:
							"Cannot submit because your user is not linked to a crew member.",
					},
					{ status: 400 },
				);
			}
			submittedByCrewId = callerCrewId;
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

export async function GET(request: Request) {
	try {
		// 1. Authentication & Authorization
		const { session } = await getServerSession();
		if (!session?.user?.id || !session.session.activeOrganizationId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const organizationId = session.session.activeOrganizationId;

		// A user needs read access to either tasks or deliverables to see this list.
		const canReadTasks = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { task: ["review"] } },
		});
		const canReadDeliverables = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { deliverable: ["review"] } },
		});

		if (!canReadTasks && !canReadDeliverables) {
			return NextResponse.json(
				{
					message: "Forbidden: You do not have permission to view submissions.",
				},
				{ status: 403 },
			);
		}

		// 2. Filtering & Pagination from Query Params
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
		const status = searchParams.get("status"); // e.g., 'ready_for_review'
		const assignmentType = searchParams.get("assignmentType"); // 'task' or 'deliverable'

		// const conditions = [
		// 	assignmentType === "task"
		// 		? eq(tasks.organizationId, organizationId)
		// 		: eq(deliverables.organizationId, organizationId),
		// ];

		// if (status) {
		// 	conditions.push(eq(assignmentSubmissions.status, status));
		// }
		// if (assignmentType) {
		// 	conditions.push(eq(assignmentSubmissions.assignmentType, assignmentType));
		// }

		const securityCondition = or(
			eq(tasks.organizationId, organizationId),
			eq(deliverables.organizationId, organizationId),
		);

		const conditions = [securityCondition];

		if (status) {
			// The optional filters are now added correctly on top of the base security check.
			conditions.push(eq(assignmentSubmissions.status, status));
		}
		if (assignmentType) {
			conditions.push(eq(assignmentSubmissions.assignmentType, assignmentType));
		}

		// 3. Execute Queries (Data and Total Count)
		const submissionsQuery = db
			.select({
				// Select specific fields to keep the payload lean for a list view
				id: assignmentSubmissions.id,
				status: assignmentSubmissions.status,
				submittedAt: assignmentSubmissions.submittedAt,
				assignmentType: assignmentSubmissions.assignmentType,
				assignmentId: assignmentSubmissions.assignmentId,
				taskTitle: tasks.description,
				deliverableTitle: deliverables.title,
			})
			.from(assignmentSubmissions)
			.leftJoin(
				tasks,
				and(
					eq(assignmentSubmissions.assignmentId, tasks.id),
					eq(assignmentSubmissions.assignmentType, "task"),
				),
			)
			.leftJoin(
				deliverables,
				and(
					eq(assignmentSubmissions.assignmentId, deliverables.id),
					eq(assignmentSubmissions.assignmentType, "deliverable"),
				),
			)
			.where(and(...conditions))
			.orderBy(desc(assignmentSubmissions.submittedAt))
			.limit(pageSize)
			.offset((page - 1) * pageSize);

		const countQuery = db
			.select({ value: count() })
			.from(assignmentSubmissions)
			.leftJoin(
				tasks,
				and(
					eq(assignmentSubmissions.assignmentId, tasks.id),
					eq(assignmentSubmissions.assignmentType, "task"),
				),
			)
			.leftJoin(
				deliverables,
				and(
					eq(assignmentSubmissions.assignmentId, deliverables.id),
					eq(assignmentSubmissions.assignmentType, "deliverable"),
				),
			)
			.where(and(...conditions));

		const [data, totalResult] = await Promise.all([
			submissionsQuery,
			countQuery,
		]);
		const total = totalResult[0].value;

		return NextResponse.json({
			data,
			pagination: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		});
	} catch (error) {
		console.error("Failed to fetch submissions:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
