import { and, eq } from "drizzle-orm";
import { db } from "./drizzle";
import { members, users, deliverables, bookings } from "./schema";

export async function getActiveOrganization(userId: string) {
	const result = await db
		.select({
			organizationId: members.organizationId,
		})
		.from(users)
		.leftJoin(members, eq(users.id, members.userId))
		.where(eq(users.id, userId))
		.limit(1);

	return result[0];
}

export async function getDeliverables(
	organizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const deliverableData = await db.query.deliverables.findMany({
		where: and(eq(deliverables.organizationId, organizationId)),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
		},
		limit,
		offset,
	});

	const total = await db.$count(
		deliverables,
		eq(deliverables.organizationId, organizationId),
	);

	return {
		data: deliverableData,
		total,
		page,
		limit,
	};
}
export async function getBookings(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const bookingsData = await db.query.bookings.findMany({
		where: eq(bookings.organizationId, userOrganizationId),
		with: {
			clients: true,
			shoots: true,
		},
		limit,
		offset,
	});

	const total = await db.$count(
		bookings,
		eq(bookings.organizationId, userOrganizationId),
	);

	return {
		data: bookingsData,
		total,
		page,
		limit,
	};
}
