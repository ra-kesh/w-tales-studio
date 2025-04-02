import { and, count, eq, or } from "drizzle-orm";
import { client, db } from "./drizzle";
import {
	members,
	users,
	deliverables,
	bookings,
	clients,
	expenses,
	shoots,
	tasks,
	configurations,
	type ConfigType,
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
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const deliverableData = await db.query.deliverables.findMany({
		where: and(eq(deliverables.organizationId, userOrganizationId)),
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
		eq(deliverables.organizationId, userOrganizationId),
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

	const expenseData = await db.query.expenses.findMany({
		where: eq(expenses.organizationId, userOrganizationId),
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
		expenses,
		eq(expenses.organizationId, userOrganizationId),
	);

	return {
		data: expenseData,
		total,
		page,
		limit,
	};
}
export async function getShoots(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;
	const [shootsData, totalData] = await Promise.all([
		db
			.select({
				id: shoots.id,
				bookingId: shoots.bookingId,
				bookingName: bookings.name,
				title: shoots.title,
				date: shoots.date,
				time: shoots.time,
				reportingTime: shoots.reportingTime,
				duration: shoots.duration,
				city: shoots.city,
				venue: shoots.venue,
				notes: shoots.notes,
				additionalServices: shoots.additionalServices,
				createdAt: shoots.createdAt,
				updatedAt: shoots.updatedAt,
			})
			.from(shoots)
			.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
			.where(eq(bookings.organizationId, userOrganizationId))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: count() })
			.from(shoots)
			.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
			.where(eq(bookings.organizationId, userOrganizationId)),
	]);

	const total = totalData[0].count;

	return {
		data: shootsData,
		total,
		page,
		limit,
	};
}
export async function getTasks(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
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

	return {
		data: taskData,
		total,
		page,
		limit,
	};
}

export async function getConfigs(
	userOrganizationId: string,
	type: (typeof ConfigType.enumValues)[number],
) {
	const config = await db.query.configurations.findMany({
		where: and(
			eq(configurations.type, type),
			or(
				eq(configurations.organizationId, userOrganizationId),
				eq(configurations.isSystem, true),
			),
		),
		orderBy: configurations.isSystem,
	});

	return config;
}

export async function getBookingDetail(
	userOrganizationId: string,
	bookingId: number,
) {
	const response = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, bookingId),
			eq(bookings.organizationId, userOrganizationId),
		),
		with: {
			clients: true,
			shoots: true,
			deliverables: true,
			receivedAmounts: true,
			paymentSchedules: true,
			expenses: true,
			crews: true,
			tasks: true,
		},
	});

	return response;
}
