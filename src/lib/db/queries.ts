import { and, count, desc, eq, or, sql } from "drizzle-orm";
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
	type BookingDetail,
	type Shoot,
	crews,
} from "./schema";
import { alias } from "drizzle-orm/pg-core";

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
		orderBy: (deliverables, { desc }) => [
			desc(deliverables.updatedAt),
			desc(deliverables.createdAt),
		],
		// limit,
		// offset,
	});

	const total = await db.$count(
		deliverables,
		eq(deliverables.organizationId, userOrganizationId),
	);

	return {
		data: deliverableData,
		total,
		// page,
		// limit,
	};
}

const packageConfigs = alias(configurations, "package_configs");
const bookingConfigs = alias(configurations, "booking_configs");

export async function getBookings(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	fields = "",
) {
	const offset = (page - 1) * limit;

	const bookingsData = await db
		.select({
			id: bookings.id,
			organizationId: bookings.organizationId,
			name: bookings.name,
			bookingType: sql<string>`booking_configs.value`,
			packageType: sql<string>`package_configs.value`,
			packageCost: bookings.packageCost,
			clientId: bookings.clientId,
			createdAt: bookings.createdAt,
			updatedAt: bookings.updatedAt,
			note: bookings.note,
			clients: clients,
			shoots: sql<Shoot[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${shoots.id},
              'bookingId', ${shoots.bookingId},
			        'title', ${shoots.title},
              'organizationId', ${shoots.organizationId},
			        'time', ${shoots.time},
              'date', ${shoots.date},
              'location', ${shoots.location},
              'createdAt', ${shoots.createdAt},
              'updatedAt', ${shoots.updatedAt}
            )
          ) FILTER (WHERE ${shoots.id} IS NOT NULL),
          '[]'
        )
      `.as("shoots"),
		})
		.from(bookings)
		.leftJoin(
			packageConfigs,
			and(
				eq(bookings.packageType, sql`package_configs.key`),
				eq(sql`package_configs.type`, "package_type"),
				eq(sql`package_configs.organization_id`, userOrganizationId),
			),
		)
		.leftJoin(
			bookingConfigs,
			and(
				eq(bookings.bookingType, sql`booking_configs.key`),
				eq(sql`booking_configs.type`, "booking_type"),
				eq(sql`booking_configs.organization_id`, userOrganizationId),
			),
		)
		.leftJoin(clients, eq(bookings.clientId, clients.id))
		.leftJoin(shoots, eq(shoots.bookingId, bookings.id))
		.where(eq(bookings.organizationId, userOrganizationId))
		.groupBy(
			bookings.id,
			bookings.organizationId,
			bookings.name,
			bookings.bookingType,
			bookings.packageType,
			bookings.packageCost,
			bookings.clientId,
			bookings.createdAt,
			bookings.updatedAt,
			bookings.note,
			clients.id,
			clients.organizationId,
			clients.name,
			clients.brideName,
			clients.groomName,
			clients.relation,
			clients.phoneNumber,
			clients.email,
			clients.address,
			clients.createdAt,
			clients.updatedAt,
			packageConfigs.value,
			bookingConfigs.value,
		)
		.orderBy(desc(bookings.updatedAt), desc(bookings.createdAt));
	// .limit(limit)
	// .offset(offset);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(bookings)
		.where(eq(bookings.organizationId, userOrganizationId))
		.then((result) => result[0]?.count || 0);

	return {
		data: bookingsData,
		total,
		// page,
		// limit,
	};
}
export async function getMinimalBookings(
	userOrganizationId: string,
	fields = "",
) {
	const fieldsArray = fields
		? fields.split(",").map((f) => f.trim())
		: ["id", "name"];

	const bookingColumns = {
		id: fieldsArray.includes("id"),
		name: fieldsArray.includes("name"),
		packageType: fieldsArray.includes("packageType"),
		packageCost: fieldsArray.includes("packageCost"),
		updatedAt: fieldsArray.includes("updatedAt"),
		createdAt: fieldsArray.includes("createdAt"),
	};

	const bookingsData = await db.query.bookings.findMany({
		where: eq(bookings.organizationId, userOrganizationId),
		columns: bookingColumns,
		orderBy: (bookings, { desc }) => [
			desc(bookings.updatedAt),
			desc(bookings.createdAt),
		],
	});

	const total = await db.$count(
		bookings,
		eq(bookings.organizationId, userOrganizationId),
	);

	return {
		data: bookingsData,
		total,
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
		orderBy: (clients, { desc }) => [
			desc(clients.updatedAt),
			desc(clients.createdAt),
		],
		// limit,
		// offset,
	});

	const total = await db.$count(
		clients,
		eq(clients.organizationId, userOrganizationId),
	);

	return {
		data: clientsData,
		total,
		// page,
		// limit,
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
		orderBy: (expenses, { desc }) => [
			desc(expenses.updatedAt),
			desc(expenses.createdAt),
		],

		// limit,
		// offset,
	});

	const total = await db.$count(
		expenses,
		eq(expenses.organizationId, userOrganizationId),
	);

	return {
		data: expenseData,
		total,
		// page,
		// limit,
	};
}

export async function getShoots(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const shootsData = await db.query.shoots.findMany({
		where: eq(shoots.organizationId, userOrganizationId),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
			shootsAssignments: {
				columns: {
					id: true,
					crewId: true,
					isLead: true,
					assignedAt: true,
				},
				with: {
					crew: {
						columns: {
							id: true,
							name: true,
							role: true,
							specialization: true,
							status: true,
						},
						with: {
							member: {
								with: {
									user: {
										columns: {
											name: true,
											email: true,
											image: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
		orderBy: (shoots, { desc }) => [
			desc(shoots.updatedAt),
			desc(shoots.createdAt),
		],
		// limit,
		// offset,
	});

	const total = await db.$count(
		shoots,
		eq(shoots.organizationId, userOrganizationId),
	);

	return {
		data: shootsData,
		total,
		// page,
		// limit,
	};
}

export async function getTasks(
	userOrganizationId: string,
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const tasksData = await db.query.tasks.findMany({
		where: eq(tasks.organizationId, userOrganizationId),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
		},
		orderBy: (tasks, { desc }) => [
			desc(tasks.updatedAt),
			desc(tasks.createdAt),
		],

		// limit,
		// offset,
	});

	const total = await db.$count(
		tasks,
		eq(tasks.organizationId, userOrganizationId),
	);

	return {
		data: tasksData,
		total,
		// page,
		// limit,
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
		orderBy: (configurations, { desc }) => [
			desc(configurations.updatedAt),
			desc(configurations.createdAt),
		],
	});

	return config;
}

export async function getBookingDetail(
	userOrganizationId: string,
	bookingId: number,
): Promise<BookingDetail | undefined> {
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
			tasks: true,
		},
	});

	return response;
}

export async function getClientDetail(
	userOrganizationId: string,
	clientId: number,
) {
	const client = await db.query.clients.findFirst({
		where: and(
			eq(clients.id, clientId),
			eq(clients.organizationId, userOrganizationId),
		),
		orderBy: (clients, { desc }) => [desc(clients.updatedAt)],
	});

	return client;
}

export async function getCrews(organizationId: string) {
	if (!organizationId) {
		throw new Error("Organization ID is required");
	}

	return db.query.crews.findMany({
		where: eq(crews.organizationId, organizationId),
		with: {
			member: {
				with: {
					user: {
						columns: {
							name: true,
							email: true,
							image: true,
						},
					},
				},
			},
		},
		orderBy: [desc(crews.updatedAt), desc(crews.createdAt)],
	});
}
