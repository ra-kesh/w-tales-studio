// app/api/submissions/route.ts

import { and, count, desc, eq, max, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	assignmentSubmissions,
	bookings,
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

		const pendingSubmission = await db.query.assignmentSubmissions.findFirst({
			where: and(
				eq(assignmentSubmissions.assignmentId, assignmentId),
				eq(assignmentSubmissions.assignmentType, assignmentType),
				eq(assignmentSubmissions.status, "ready_for_review"),
			),
		});

		if (pendingSubmission) {
			return NextResponse.json(
				{
					message:
						"A submission is already pending review. Please wait for feedback before submitting a new version.",
				},
				{ status: 409 }, // 409 Conflict is the perfect status code for this
			);
		}

		const newSubmission = await db.transaction(async (tx) => {
			const [latestVersionResult] = await tx
				.select({ maxVersion: max(assignmentSubmissions.version) })
				.from(assignmentSubmissions)
				.where(
					and(
						eq(assignmentSubmissions.assignmentId, assignmentId),
						eq(assignmentSubmissions.assignmentType, assignmentType),
					),
				);

			const newVersion = (latestVersionResult?.maxVersion || 0) + 1;

			const [submission] = await tx
				.insert(assignmentSubmissions)
				.values({
					assignmentType,
					assignmentId,
					status: data.status,
					comment: data.comment,
					powLinks: data.submissionLinks,
					submittedBy: submittedByCrewId,
					version: newVersion,
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
		const { session } = await getServerSession();
		if (!session?.user?.id || !session.session.activeOrganizationId)
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		const orgId = session.session.activeOrganizationId;
		const userId = session.user.id;

		const canSee = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: { task: ["review"], deliverable: ["review"] } },
		});
		if (!canSee)
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });

		const qp = new URL(request.url).searchParams;
		const page = Number(qp.get("page") ?? 1);
		const pageSize = Number(qp.get("pageSize") ?? 10);
		const status = qp.get("status");
		const aType = qp.get("assignmentType");
		const assignedToMe = qp.get("assignedToMe") === "true";

		let callerCrewId: number | null = null;
		if (assignedToMe) {
			const callerInfo = await db
				.select({ id: crews.id })
				.from(crews)
				.innerJoin(members, eq(crews.memberId, members.id))
				.where(
					and(eq(members.userId, userId), eq(members.organizationId, orgId)),
				)
				.limit(1);
			if (callerInfo.length > 0) callerCrewId = callerInfo[0].id;
		}

		const base = or(
			eq(tasks.organizationId, orgId),
			eq(deliverables.organizationId, orgId),
		);
		const whereClause = and(
			base,
			status ? eq(assignmentSubmissions.status, status) : sql`true`,
			aType ? eq(assignmentSubmissions.assignmentType, aType) : sql`true`,
			assignedToMe && callerCrewId
				? eq(assignmentSubmissions.currentReviewer, callerCrewId)
				: assignedToMe
					? sql`false`
					: sql`true`,
		);

		const reviewerCrew = alias(crews, "reviewerCrew");
		const currentReviewerCrew = alias(crews, "currentReviewerCrew");

		const rows = await db
			.select({
				sub: assignmentSubmissions,

				submittedBy: {
					id: crews.id,
					name: crews.name,
					email: crews.email,
				},

				reviewedBy: {
					id: reviewerCrew.id,
					name: reviewerCrew.name,
				},

				currentReviewer: {
					id: currentReviewerCrew.id,
					name: currentReviewerCrew.name,
				},

				task: tasks,
				del: deliverables,
				bk: { id: bookings.id, name: bookings.name },

				file: submissionFiles,
			})
			.from(assignmentSubmissions)
			.leftJoin(crews, eq(crews.id, assignmentSubmissions.submittedBy))
			.leftJoin(
				reviewerCrew,
				eq(reviewerCrew.id, assignmentSubmissions.reviewedBy),
			)
			.leftJoin(
				currentReviewerCrew,
				eq(currentReviewerCrew.id, assignmentSubmissions.currentReviewer),
			)
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
			.leftJoin(
				bookings,
				eq(
					bookings.id,
					sql`COALESCE(${tasks.bookingId}, ${deliverables.bookingId})`,
				),
			)
			.leftJoin(
				submissionFiles,
				eq(submissionFiles.submissionId, assignmentSubmissions.id),
			)
			.where(whereClause)
			.orderBy(desc(assignmentSubmissions.submittedAt))
			.limit(pageSize)
			.offset((page - 1) * pageSize);

		const byId: Record<number, any> = {};
		for (const r of rows) {
			const id = r.sub.id;
			if (!byId[id]) {
				byId[id] = {
					...r.sub,
					submittedBy: r.submittedBy,
					reviewedBy: r.reviewedBy && r.reviewedBy.id ? r.reviewedBy : null,
					currentReviewer:
						r.currentReviewer && r.currentReviewer.id
							? r.currentReviewer
							: null,
					task:
						r.sub.assignmentType === "task"
							? { ...r.task, booking: r.bk }
							: null,
					deliverable:
						r.sub.assignmentType === "deliverable"
							? { ...r.del, booking: r.bk }
							: null,
					files: [] as (typeof r.file)[],
				};
			}
			if (r.file && r.file.id) byId[id].files.push(r.file);
		}
		const data = Object.values(byId);

		const total = (
			await db
				.select({ v: count() })
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
				.where(whereClause)
		)[0].v;

		return NextResponse.json({
			data,
			pagination: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
