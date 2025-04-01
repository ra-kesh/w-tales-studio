import { and, count, eq } from "drizzle-orm";
import { client, db } from "./drizzle";
import {
	members,
	users,
	deliverables,
	bookings,
	clients,
	expenses,
} from "./schema";

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

export async function getClients(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const clientsData = await db.query.clients.findMany({
		where: eq(clients.organizationId, userOrganizationId),
		limit,
		offset,
	});

	const total = await db.$count(
		clients,
		eq(clients.organizationId, userOrganizationId),
	);

	return {
		data: clientsData,
		total,
		page,
		limit,
	};
}

export async function getExpenses(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const [expenseData, totalData] = await Promise.all([
		db
			.select({
				id: expenses.id,
				bookingId: expenses.bookingId,
				bookingName: bookings.name,
				billTo: expenses.billTo,
				category: expenses.category,
				amount: expenses.amount,
				date: expenses.date,
				spentBy: expenses.spentBy,
				spentByUserId: expenses.spentByUserId,
				description: expenses.description,
				fileUrls: expenses.fileUrls,
				createdAt: expenses.createdAt,
				updatedAt: expenses.updatedAt,
			})
			.from(expenses)
			.leftJoin(bookings, eq(expenses.bookingId, bookings.id))
			.where(eq(bookings.organizationId, userOrganizationId))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: count() })
			.from(expenses)
			.leftJoin(bookings, eq(expenses.bookingId, bookings.id))
			.where(eq(bookings.organizationId, userOrganizationId)),
	]);

	const total = totalData[0].count;

	return {
		data: expenseData,
		total,
		page,
		limit,
	};
}
