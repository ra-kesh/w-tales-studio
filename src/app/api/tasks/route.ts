import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { tasks, bookings, deliverables } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { count, eq } from "drizzle-orm";

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

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

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
		const offset = (page - 1) * limit;

		const [taskData, totalData] = await Promise.all([
			db
				.select({
					id: tasks.id,
					bookingId: tasks.bookingId,
					bookingName: bookings.name,
					deliverableId: tasks.deliverableId,
					title: deliverables.title,
					description: tasks.description,
					status: tasks.status,
					assignedTo: tasks.assignedTo,
					priority: tasks.priority,
					dueDate: tasks.dueDate,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
				})
				.from(tasks)
				.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
				.leftJoin(deliverables, eq(tasks.deliverableId, deliverables.id))
				.where(eq(bookings.organizationId, userOrganizationId))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(tasks)
				.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
				.where(eq(bookings.organizationId, userOrganizationId)),
		]);

		const total = totalData[0].count;

		return NextResponse.json(
			{
				data: taskData,
				total,
				page,
				limit,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching tasks:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
