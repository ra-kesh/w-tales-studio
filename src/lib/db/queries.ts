import {
	and,
	asc,
	count,
	countDistinct,
	desc,
	eq,
	exists,
	gte,
	ilike,
	inArray,
	isNull,
	lt,
	lte,
	notInArray,
	or,
	type SQL,
	sql,
	sum,
} from "drizzle-orm";
import { db } from "./drizzle";
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
	crews,
	invitations,
	shootsAssignments,
	tasksAssignments,
	deliverablesAssignments,
	receivedAmounts,
	paymentSchedules,
	expensesAssignments,
	bookingParticipants,
} from "./schema";
import { alias } from "drizzle-orm/pg-core";
import type { BookingDetail } from "@/types/booking";
import { addDays, formatISO, startOfDay, subDays } from "date-fns";

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

export type DeliverableFilters = {
	title?: string;
	status?: string;
	// priority?: string;
	bookingId?: string;
	crewId?: string;
	dueDate?: string;
};

export type AllowedDeliverableSortFields =
	| "title"
	| "status"
	| "dueDate"
	| "createdAt"
	| "updatedAt";

export type DeliverableSortOption = {
	id: AllowedDeliverableSortFields;
	desc: boolean;
};

export async function getDeliverables(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: DeliverableSortOption[] | undefined = undefined,
	filters: DeliverableFilters = {},
) {
	const offset = (page - 1) * limit;

	const whereConditions = [eq(deliverables.organizationId, userOrganizationId)];

	// Filter by Title
	if (filters.title) {
		whereConditions.push(ilike(deliverables.title, `%${filters.title}%`));
	}

	// Filter by Status (multi-select)
	if (filters.status) {
		const statuses = filters.status.split(",").map((s) => s.trim());
		if (statuses.length > 0) {
			whereConditions.push(inArray(deliverables.status, statuses));
		}
	}

	// if (filters.priority) {
	// 	const priorities = filters.priority.split(",").map((p) => p.trim());
	// 	if (priorities.length > 0) {
	// 		whereConditions.push(inArray(deliverables.priority, priorities));
	// 	}
	// }

	// Filter by Booking ID (multi-select)
	if (filters.bookingId) {
		const bookingIds = filters.bookingId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (bookingIds.length > 0) {
			whereConditions.push(inArray(deliverables.bookingId, bookingIds));
		}
	}

	// Filter by Assigned Crew (using a subquery for related table)
	if (filters.crewId) {
		const crewIds = filters.crewId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (crewIds.length > 0) {
			whereConditions.push(
				exists(
					db
						.select({ id: deliverablesAssignments.id })
						.from(deliverablesAssignments)
						.where(
							and(
								eq(deliverablesAssignments.deliverableId, deliverables.id),
								inArray(deliverablesAssignments.crewId, crewIds),
							),
						),
				),
			);
		}
	}

	if (filters.dueDate) {
		const dates = filters.dueDate
			.split(",")
			.map((date) => date.trim())
			.filter(Boolean);
		if (dates.length === 2) {
			const startDate = new Date(dates[0]);
			const endDate = new Date(dates[1]);
			whereConditions.push(
				gte(deliverables.dueDate, startDate.toISOString().slice(0, 10)),
			);
			whereConditions.push(
				lte(deliverables.dueDate, endDate.toISOString().slice(0, 10)),
			);
		}
	}

	// --- Build Dynamic Order By Clause ---
	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc ? desc(deliverables[item.id]) : asc(deliverables[item.id]),
				)
			: [desc(deliverables.updatedAt), desc(deliverables.createdAt)];

	const deliverableData = await db.query.deliverables.findMany({
		where: and(...whereConditions),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
			deliverablesAssignments: {
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
		orderBy,
		limit,
		offset,
	});

	const totalResult = await db
		.select({ count: count() })
		.from(deliverables)
		.where(and(...whereConditions));

	const total = totalResult[0]?.count ?? 0;

	return {
		data: deliverableData,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
	};
}

// 1. Define the new interface for TaskStats
export interface TaskStats {
	totalTasks: number;
	inProgressTasks: number;
	todoTasks: number;
	overdueTasks: number;
}

// 2. Create the equivalent function for tasks
export async function getTasksStats(
	userOrganizationId: string,
): Promise<TaskStats> {
	const todayISO = formatISO(startOfDay(new Date()), {
		representation: "date",
	});

	// All stats can be calculated in a single, efficient query from the tasks table
	const taskCounts = await db
		.select({
			// Total count of all tasks
			total: sql<number>`count(*)`.mapWith(Number),

			// Count of tasks currently in progress (excluding 'todo' and 'completed')
			inProgress:
				sql<number>`sum(case when ${tasks.status} in ('in_progress', 'in_review', 'in_revision') then 1 else 0 end)`.mapWith(
					Number,
				),

			// Count of tasks in 'todo' status
			todo: sql<number>`sum(case when ${tasks.status} = 'todo' then 1 else 0 end)`.mapWith(
				Number,
			),

			// Count of tasks that are past their due date and not completed
			overdue:
				sql<number>`sum(case when ${tasks.dueDate} < ${todayISO} and ${tasks.status} != 'completed' then 1 else 0 end)`.mapWith(
					Number,
				),
		})
		.from(tasks)
		.where(eq(tasks.organizationId, userOrganizationId));

	const stats = taskCounts[0];

	return {
		totalTasks: stats?.total || 0,
		inProgressTasks: stats?.inProgress || 0,
		todoTasks: stats?.todo || 0,
		overdueTasks: stats?.overdue || 0,
	};
}

const packageConfigs = alias(configurations, "package_configs");
const bookingConfigs = alias(configurations, "booking_configs");

type AllowedSortFields =
	| "name"
	| "createdAt"
	| "updatedAt"
	| "packageCost"
	| "bookingType"
	| "status";

type SortOption = {
	id: AllowedSortFields;
	desc: boolean;
};

interface BookingFilters {
	packageType?: string;
	createdAt?: string;
	name?: string; // Optional filter for booking name
}

async function loadConfigMap(
	type: "booking_type" | "package_type",
	orgId: string,
): Promise<Map<string, string>> {
	const tbl = type === "booking_type" ? bookingConfigs : packageConfigs;
	const rows = await db
		.select({ key: tbl.key, value: tbl.value })
		.from(tbl)
		.where(and(eq(tbl.type, type), eq(tbl.organizationId, orgId)));

	return new Map(rows.map((r) => [r.key, r.value]));
}

export async function getBookings(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: SortOption[] | undefined = undefined,
	filters: BookingFilters = {},
) {
	const offset = (page - 1) * limit;

	// const [bookingConfigData, packageConfigData] = await Promise.all([
	// 	db
	// 		.select({ key: bookingConfigs.key, value: bookingConfigs.value })
	// 		.from(bookingConfigs)
	// 		.where(
	// 			and(
	// 				eq(bookingConfigs.type, "booking_type"),
	// 				eq(bookingConfigs.organizationId, userOrganizationId),
	// 			),
	// 		),
	// 	db
	// 		.select({ key: packageConfigs.key, value: packageConfigs.value })
	// 		.from(packageConfigs)
	// 		.where(
	// 			and(
	// 				eq(packageConfigs.type, "package_type"),
	// 				eq(packageConfigs.organizationId, userOrganizationId),
	// 			),
	// 		),
	// ]);

	// const bookingTypeMap = new Map(
	// 	bookingConfigData.map((config) => [config.key, config.value]),
	// );
	// const packageTypeMap = new Map(
	// 	packageConfigData.map((config) => [config.key, config.value]),
	// );

	const whereConditions = [eq(bookings.organizationId, userOrganizationId)];

	if (filters.packageType) {
		// Apply packageType filter
		const packageTypes = filters.packageType
			.split(",")
			.map((type) => type.trim());
		if (packageTypes.length > 0) {
			whereConditions.push(inArray(bookings.packageType, packageTypes));
		}
	}

	if (filters.createdAt) {
		const parts = filters.createdAt.split(",").map((d) => new Date(d.trim()));

		parts[0].setHours(0, 0, 0, 0);

		if (parts[1]) {
			parts[1].setHours(23, 59, 59, 999);
			whereConditions.push(
				gte(bookings.createdAt, parts[0]),
				lte(bookings.createdAt, parts[1]),
			);
		} else {
			whereConditions.push(gte(bookings.createdAt, parts[0]));
		}
	}

	// if (filters.createdAt) {
	// 	const dates = filters.createdAt
	// 		.split(",")
	// 		.map((date) => date.trim())
	// 		.filter((date) => date);

	// 	if (dates.length === 1) {
	// 		// Single date
	// 		const date = new Date(dates[0]);
	// 		date.setUTCHours(0, 0, 0, 0);
	// 		whereConditions.push(gte(bookings.createdAt, date));
	// 		// date.setUTCHours(23, 59, 59, 999);
	// 		// whereConditions.push(lte(bookings.createdAt, date));
	// 	} else if (dates.length === 2) {
	// 		// Date range
	// 		const startDate = new Date(dates[0]);
	// 		startDate.setUTCHours(0, 0, 0, 0);
	// 		const endDate = new Date(dates[1]);
	// 		endDate.setUTCHours(23, 59, 59, 999);
	// 		whereConditions.push(gte(bookings.createdAt, startDate));
	// 		whereConditions.push(lte(bookings.createdAt, endDate));
	// 	}
	// }

	if (filters.name) {
		const searchTerm = `%${filters.name}%`;
		whereConditions.push(ilike(bookings.name, searchTerm));
	}

	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc ? desc(bookings[item.id]) : asc(bookings[item.id]),
				)
			: [desc(bookings.updatedAt)];

	const bookingsData = await db.query.bookings.findMany({
		where: and(...whereConditions),
		with: {
			participants: {
				with: {
					client: true,
				},
			},
			shoots: {
				columns: {
					id: true,
					bookingId: true,
					title: true,
					organizationId: true,
					time: true,
					date: true,
					location: true,
					createdAt: true,
					updatedAt: true,
				},
				with: {
					shootsAssignments: {
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
			},
			// deliverables: true,
			// receivedAmounts: true,
			// paymentSchedules: true,
		},
		orderBy,
		limit,
		offset,
	});

	// Todo: remove this mappin later and figure out a better way to show booking and package types

	// const formattedBookings = bookingsData.map((booking) => ({
	// 	...booking,
	// 	bookingType: bookingTypeMap.get(booking.bookingType) ?? booking.bookingType,
	// 	packageType: packageTypeMap.get(booking.packageType) ?? booking.packageType,
	// 	// participants: booking.participants.map((pp) => ({
	// 	// 	role: pp.role,
	// 	// 	client: pp.client,
	// 	// })),
	// }));

	const total = await db.$count(bookings, and(...whereConditions));

	return {
		data: bookingsData,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
	};
}

export async function getBookingDetail(
	userOrganizationId: string,
	bookingId: number,
): Promise<BookingDetail | undefined> {
	const [bookingTypeMap, packageTypeMap] = await Promise.all([
		loadConfigMap("booking_type", userOrganizationId),
		loadConfigMap("package_type", userOrganizationId),
	]);

	const booking = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, bookingId),
			eq(bookings.organizationId, userOrganizationId),
		),
		with: {
			participants: {
				with: {
					client: true,
				},
			},
			shoots: {
				with: {
					shootsAssignments: {
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
			},
			deliverables: {
				with: {
					deliverablesAssignments: {
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
			},
			receivedAmounts: true,
			paymentSchedules: true,
			expenses: {
				with: {
					expensesAssignments: {
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
			},
			tasks: {
				with: {
					tasksAssignments: {
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
			},
		},
	});

	if (!booking) {
		return undefined;
	}

	// return {
	// 	id: booking.id,
	// 	organizationId: booking.organizationId,
	// 	name: booking.name,
	// 	// bookingTypeKey: booking.bookingType,
	// 	bookingTypeValue: bookingTypeMap.get(booking.bookingType) ?? booking.bookingType,
	// 	// packageTypeKey: booking.packageType,
	// 	packageTypeValue: packageTypeMap.get(booking.packageType) ?? booking.packageType,
	// 	packageCost: booking.packageCost,
	// 	status: booking.status,
	// 	note: booking.note,
	// 	createdAt: booking.createdAt,
	// 	updatedAt: booking.updatedAt,
	// 	participants: booking.participants.map((pp) => ({
	// 		role: pp.role,
	// 		client: pp.client,
	// 	})),
	// 	shoots: booking.shoots,
	// 	deliverables: b.deliverables,
	// 	expenses: b.expenses,
	// 	receivedAmounts: b.receivedAmounts,
	// 	paymentSchedules: b.paymentSchedules,
	// 	tasks: b.tasks,
	// };

	// Map bookingType and packageType to human-readable values
	// remove crews from booking details types since crews are not directly assigned to booking
	return {
		...booking,
		bookingTypeKey: booking.bookingType,
		bookingTypeValue:
			bookingTypeMap.get(booking.bookingType) ?? booking.bookingType,
		packageTypeKey: booking.packageType,
		packageTypeValue:
			packageTypeMap.get(booking.packageType) ?? booking.packageType,
		participants: booking.participants.map((pp) => ({
			role: pp.role,
			client: pp.client,
		})),
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

// export async function getClients(
// 	userOrganizationId: string,
// 	page = 1,
// 	limit = 10,
// ) {
// 	const offset = (page - 1) * limit;

// 	const clientsData = await db.query.clients.findMany({
// 		where: eq(clients.organizationId, userOrganizationId),
// 		with: {
// 			bookings: {
// 				with: {
// 					booking: true,
// 				},
// 			},
// 		},
// 		orderBy: (clients, { desc }) => [
// 			desc(clients.updatedAt),
// 			desc(clients.createdAt),
// 		],
// 		// limit,
// 		// offset,
// 	});

// 	const total = await db.$count(
// 		clients,
// 		eq(clients.organizationId, userOrganizationId),
// 	);

// 	return {
// 		data: clientsData,
// 		total,
// 		page,
// 		pageCount: Math.ceil(total / limit),
// 		limit,
// 	};
// }

export interface ClientBookingRow {
	id: number;
	name: string;
	email: string | null;
	phoneNumber: string | null;
	address: string | null;
	bookingId: number;
	bookingName: string;
	packageType: string;
	packageCost: string;
	bookingStatus: string;
	bookingCreatedAt: Date | null;
}

export interface ClientsPage {
	data: ClientBookingRow[];
	total: number;
	page: number;
	limit: number;
	pageCount: number;
}

// 1. Define the types for our filters and sorting
export type ClientFilters = {
	name?: string;
	bookingId?: string; // Filtering by booking name is more user-friendly for text search
	packageType?: string; // Will be a comma-separated string of package types
};

// Note: Sorting requires mapping to the correct table's column
export type AllowedClientSortFields =
	| "name"
	| "bookingName"
	| "packageCost"
	| "status"
	| "bookingCreatedAt";
export type ClientSortOption = { id: AllowedClientSortFields; desc: boolean };
/**
 * Fetch a paginated list of CLIENT+BOOKING rows for an org.
 */
export async function getClients(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: ClientSortOption[] | undefined = undefined,
	filters: ClientFilters = {},
): Promise<ClientsPage> {
	const offset = (page - 1) * limit;

	const whereConditions = [eq(clients.organizationId, userOrganizationId)];

	if (filters.name) {
		whereConditions.push(ilike(clients.name, `%${filters.name}%`));
	}

	if (filters.bookingId) {
		const bookingIds = filters.bookingId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));

		if (bookingIds.length > 0) {
			whereConditions.push(inArray(bookings.id, bookingIds));
		}
	}

	if (filters.packageType) {
		const packageTypes = filters.packageType.split(",").map((p) => p.trim());
		if (packageTypes.length > 0) {
			// Filter on the joined 'bookings' table
			whereConditions.push(inArray(bookings.packageType, packageTypes));
		}
	}

	const orderByClauses =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) => {
					const direction = item.desc ? desc : asc;
					// Map the sort key to the correct table and column
					switch (item.id) {
						case "name":
							return direction(clients.name);
						case "bookingName":
							return direction(bookings.name);
						case "packageCost":
							return direction(bookings.packageCost);
						case "status":
							return direction(bookings.status);
						case "bookingCreatedAt":
							return direction(bookings.createdAt);
						default:
							// Fallback or ignore invalid sort keys
							return desc(bookings.updatedAt);
					}
				})
			: [desc(bookings.updatedAt)];

	// 1) Fetch the page of rows
	const data = await db
		.select({
			id: clients.id,
			name: clients.name,
			email: clients.email,
			phoneNumber: clients.phoneNumber,
			address: clients.address,
			bookingId: bookings.id,
			bookingName: bookings.name,
			packageType: bookings.packageType,
			packageCost: bookings.packageCost,
			bookingStatus: bookings.status,
			bookingCreatedAt: bookings.createdAt,
		})
		.from(bookingParticipants)
		.innerJoin(clients, eq(bookingParticipants.clientId, clients.id))
		.innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
		.where(and(...whereConditions)) // Apply all filters here
		.orderBy(...orderByClauses)
		.limit(limit)
		.offset(offset);

	// 2) Count total matching rows
	const totalResult = await db
		.select({ count: count() })
		.from(bookingParticipants)
		.innerJoin(clients, eq(bookingParticipants.clientId, clients.id))
		.innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
		.where(and(...whereConditions)); // Use the exact same where clause

	const total = totalResult[0]?.count ?? 0;
	const pageCount = Math.ceil(total / limit);

	return {
		data,
		total,
		page,
		limit,
		pageCount,
	};
}

export interface ClientStats {
	totalClients: number;
	newClients: number; // joined in last 7 days
	activeClients: number; // have at least one non-completed booking
	clientsWithOverdueDeliverables: number;
}

export async function getClientStats(
	userOrganizationId: string,
): Promise<ClientStats> {
	const today = startOfDay(new Date());
	const weekAgo = subDays(today, 7);
	const todayISO = formatISO(today, { representation: "date" });
	// const weekAgoISO = formatISO(weekAgo, { representation: "date" });

	const [totalRes, newRes, activeRes, overdueRes] = await Promise.all([
		// 1) totalClients
		db
			.select({ count: count() })
			.from(clients)
			.where(eq(clients.organizationId, userOrganizationId)),

		// 2) newClients: createdAt >= weekAgo
		db
			.select({ count: count() })
			.from(clients)
			.where(
				and(
					eq(clients.organizationId, userOrganizationId),
					gte(clients.createdAt, weekAgo),
				),
			),

		// 3) activeClients: distinct clients who appear in booking_participants
		//    for bookings whose status is not completed/cancelled
		db
			.select({ count: countDistinct(bookingParticipants.clientId) })
			.from(bookingParticipants)
			.innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
			.where(
				and(
					eq(bookings.organizationId, userOrganizationId),
					notInArray(bookings.status, ["completed", "cancelled"]),
				),
			),

		// 4) clientsWithOverdueDeliverables: distinct clients who appear in
		//    booking_participants for bookings that have >=1 overdue deliverable
		db
			.select({ count: countDistinct(bookingParticipants.clientId) })
			.from(bookingParticipants)
			.innerJoin(
				deliverables,
				eq(bookingParticipants.bookingId, deliverables.bookingId),
			)
			.innerJoin(bookings, eq(deliverables.bookingId, bookings.id))
			.where(
				and(
					eq(bookings.organizationId, userOrganizationId),
					lt(deliverables.dueDate, todayISO),
					notInArray(deliverables.status, [
						"completed",
						"delivered",
						"cancelled",
					]),
				),
			),
	]);

	return {
		totalClients: totalRes[0]?.count || 0,
		newClients: newRes[0]?.count || 0,
		activeClients: activeRes[0]?.count || 0,
		clientsWithOverdueDeliverables: overdueRes[0]?.count || 0,
	};
}

export type ExpenseFilters = {
	description?: string;
	category?: string; // Will be a comma-separated string of categories
	date?: string; // Will handle date ranges
	crewId?: string; // Will be a comma-separated string of crew IDs
	bookingId?: string; // Bonus: Let's add booking filter as well
};

export type AllowedExpenseSortFields =
	| "category"
	| "amount"
	| "date"
	| "createdAt"
	| "updatedAt";

export type ExpenseSortOption = { id: AllowedExpenseSortFields; desc: boolean };

export async function getExpenses(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: ExpenseSortOption[] | undefined = undefined,
	filters: ExpenseFilters = {},
) {
	const offset = (page - 1) * limit;
	// --- Build Dynamic Where Clause ---
	const whereConditions = [eq(expenses.organizationId, userOrganizationId)];

	if (filters.description) {
		// Filter by Description (text search)
		whereConditions.push(
			ilike(expenses.description, `%${filters.description}%`),
		);
	}

	if (filters.category) {
		// Filter by Category (multi-select)
		const categories = filters.category.split(",").map((c) => c.trim());
		if (categories.length > 0) {
			whereConditions.push(inArray(expenses.category, categories));
		}
	}

	if (filters.crewId) {
		// Filter by Assigned Crew (subquery on a related table)
		const crewIds = filters.crewId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (crewIds.length > 0) {
			whereConditions.push(
				exists(
					db
						.select({ id: expensesAssignments.id })
						.from(expensesAssignments)
						.where(
							and(
								eq(expensesAssignments.expenseId, expenses.id),
								inArray(expensesAssignments.crewId, crewIds),
							),
						),
				),
			);
		}
	}

	if (filters.bookingId) {
		// Filter by Booking ID
		const bookingIds = filters.bookingId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (bookingIds.length > 0) {
			whereConditions.push(inArray(expenses.bookingId, bookingIds));
		}
	}

	if (filters.date) {
		// Filter by Date (date range)
		const dates = filters.date
			.split(",")
			.map((date) => date.trim())
			.filter(Boolean);
		if (dates.length === 2) {
			whereConditions.push(
				gte(expenses.date, new Date(dates[0]).toISOString().slice(0, 10)),
			);
			whereConditions.push(
				lte(expenses.date, new Date(dates[1]).toISOString().slice(0, 10)),
			);
		}
	}

	// --- Build Dynamic Order By Clause ---
	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc ? desc(expenses[item.id]) : asc(expenses[item.id]),
				)
			: [desc(expenses.date), desc(expenses.createdAt)]; // Default sort

	const expenseData = await db.query.expenses.findMany({
		where: and(...whereConditions),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
			expensesAssignments: {
				columns: {
					id: true,
					crewId: true,
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
		orderBy,
		limit,
		offset,
	});

	const totalResult = await db
		.select({ count: count() })
		.from(expenses)
		.where(and(...whereConditions));

	const total = totalResult[0]?.count ?? 0;

	return {
		data: expenseData,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
	};
}

export type ShootFilters = {
	title?: string;
	date?: string; // Handles date ranges
	bookingId?: string;
	crew?: string; // Will be a comma-separated string of crew IDs
};

// Note: Sorting by bookingName or crew would require a JOIN, which complicates
// the query. We'll stick to sorting by fields on the 'shoots' table for now.
export type AllowedShootSortFields =
	| "title"
	| "date"
	| "createdAt"
	| "updatedAt";
export type ShootSortOption = { id: AllowedShootSortFields; desc: boolean };

export async function getShoots(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: ShootSortOption[] | undefined = undefined,
	filters: ShootFilters = {},
) {
	const offset = (page - 1) * limit;

	const whereConditions = [eq(shoots.organizationId, userOrganizationId)];

	if (filters.title) {
		// Filter by Shoot Title
		const searchTerm = `%${filters.title}%`;
		whereConditions.push(ilike(shoots.title, searchTerm));
	}

	if (filters.bookingId) {
		const bookingIds = filters.bookingId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));

		whereConditions.push(
			exists(
				db
					.select({ id: bookings.id })
					.from(bookings)
					.where(
						and(
							eq(bookings.id, shoots.bookingId),
							inArray(bookings.id, bookingIds),
						),
					),
			),
		);
	}

	if (filters.crew) {
		const crewIds = filters.crew
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));

		if (crewIds.length > 0) {
			whereConditions.push(
				exists(
					db
						.select({ id: shootsAssignments.id })
						.from(shootsAssignments)
						.where(
							and(
								eq(shootsAssignments.shootId, shoots.id),
								inArray(shootsAssignments.crewId, crewIds),
							),
						),
				),
			);
		}
	}

	if (filters.date) {
		// Filter by Shoot Date
		const dates = filters.date
			.split(",")
			.map((date) => date.trim())
			.filter((date) => date);

		if (dates.length === 1) {
			const date = new Date(dates[0]);
			date.setUTCHours(0, 0, 0, 0);
			const endDate = new Date(date);
			endDate.setUTCHours(23, 59, 59, 999);
			whereConditions.push(gte(shoots.date, date.toISOString().slice(0, 10)));
			whereConditions.push(
				lte(shoots.date, endDate.toISOString().slice(0, 10)),
			);
		} else if (dates.length === 2) {
			const startDate = new Date(dates[0]);
			startDate.setUTCHours(0, 0, 0, 0);
			const endDate = new Date(dates[1]);
			endDate.setUTCHours(23, 59, 59, 999);
			whereConditions.push(
				gte(shoots.date, startDate.toISOString().slice(0, 10)),
			);
			whereConditions.push(
				lte(shoots.date, endDate.toISOString().slice(0, 10)),
			);
		}
	}

	// --- Build Dynamic Order By Clause ---
	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc ? desc(shoots[item.id]) : asc(shoots[item.id]),
				)
			: [desc(shoots.date), desc(shoots.createdAt)]; // Default sort

	const shootsData = await db.query.shoots.findMany({
		where: and(...whereConditions),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
			shootsAssignments: {
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
										},
									},
								},
							},
						},
					},
				},
			},
		},
		orderBy,
		limit,
		offset,
	});

	const total = await db
		.select({ count: count() })
		.from(shoots)
		.where(and(...whereConditions));

	return {
		data: shootsData,
		total: total[0].count,
		page,
		pageCount: Math.ceil(total[0].count / limit),
		limit,
	};
}

export type TaskFilters = {
	description?: string;
	status?: string;
	priority?: string; // The new priority filter
	bookingId?: string;
	crewId?: string;
	dueDate?: string;
};

export type AllowedTaskSortFields =
	| "description"
	| "status"
	| "priority"
	| "dueDate"
	| "createdAt"
	| "updatedAt";
export type TaskSortOption = { id: AllowedTaskSortFields; desc: boolean };

export async function getTasks(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: TaskSortOption[] | undefined = undefined,
	filters: TaskFilters = {},
) {
	const offset = (page - 1) * limit;

	// --- Build Dynamic Where Clause ---
	const whereConditions = [eq(tasks.organizationId, userOrganizationId)];

	if (filters.description) {
		whereConditions.push(ilike(tasks.description, `%${filters.description}%`));
	}

	if (filters.status) {
		// Filter by Status and Priority (multi-select)
		const statuses = filters.status.split(",").map((s) => s.trim());
		if (statuses.length > 0) {
			whereConditions.push(
				inArray(tasks.status, statuses as typeof tasks.status.enumValues),
			);
		}
	}
	if (filters.priority) {
		const priorities = filters.priority.split(",").map((p) => p.trim());
		if (priorities.length > 0) {
			whereConditions.push(
				inArray(tasks.priority, priorities as typeof tasks.priority.enumValues),
			);
		}
	}

	if (filters.bookingId) {
		// Filter by Booking ID (direct relation, so inArray is efficient)
		const bookingIds = filters.bookingId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (bookingIds.length > 0) {
			whereConditions.push(inArray(tasks.bookingId, bookingIds));
		}
	}

	if (filters.crewId) {
		const crewIds = filters.crewId
			.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));
		if (crewIds.length > 0) {
			whereConditions.push(
				exists(
					db
						.select({ id: tasksAssignments.id })
						.from(tasksAssignments)
						.where(
							and(
								eq(tasksAssignments.taskId, tasks.id),
								inArray(tasksAssignments.crewId, crewIds),
							),
						),
				),
			);
		}
	}

	if (filters.dueDate) {
		// Filter by Due Date
		const dates = filters.dueDate
			.split(",")
			.map((date) => date.trim())
			.filter(Boolean);
		if (dates.length === 2) {
			whereConditions.push(
				gte(tasks.dueDate, new Date(dates[0]).toISOString().slice(0, 10)),
			);
			whereConditions.push(
				lte(tasks.dueDate, new Date(dates[1]).toISOString().slice(0, 10)),
			);
		}
	}

	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc ? desc(tasks[item.id]) : asc(tasks[item.id]),
				)
			: [desc(tasks.updatedAt), desc(tasks.createdAt)];

	const tasksData = await db.query.tasks.findMany({
		where: and(...whereConditions),
		with: {
			booking: {
				columns: {
					name: true,
				},
			},
			tasksAssignments: {
				columns: {
					id: true,
					crewId: true,
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
		orderBy,
		limit,
		offset,
	});

	const transformedData = tasksData.map((task) => ({
		...task,
		crewMembers: task.tasksAssignments.map((assignment) =>
			assignment.crewId.toString(),
		),
	}));

	const totalResult = await db
		.select({ count: count() })
		.from(tasks)
		.where(and(...whereConditions));

	const total = totalResult[0]?.count ?? 0;

	return {
		data: transformedData,
		total,
		page,
		pageCount: Math.ceil(total / limit),
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
		orderBy: (configurations, { desc }) => [
			desc(configurations.updatedAt),
			desc(configurations.createdAt),
		],
	});

	return config;
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

// Add this type definition for your new stats object
export interface BookingStats {
	totalBookings: number;
	activeBookings: number;
	newBookings: number;
	overdueBookings: number;
}

// Refactored function to get the new stats
export async function getBookingsStats(
	userOrganizationId: string,
): Promise<BookingStats> {
	const todayISO = formatISO(startOfDay(new Date()), {
		representation: "date",
	});

	// Use Promise.all to run queries concurrently
	const [bookingCounts, overdueResult] = await Promise.all([
		// Query 1: Get total, active, and new counts from the bookings table
		db
			.select({
				total: sql<number>`count(*)`.mapWith(Number),
				active:
					sql<number>`sum(case when ${bookings.status} not in ('completed', 'cancelled') then 1 else 0 end)`.mapWith(
						Number,
					),
				new: sql<number>`sum(case when ${bookings.status} = 'new' then 1 else 0 end)`.mapWith(
					Number,
				),
			})
			.from(bookings)
			.where(eq(bookings.organizationId, userOrganizationId)),

		// Query 2: Get the count of unique bookings that have at least one overdue deliverable
		db
			.select({
				count: countDistinct(deliverables.bookingId),
			})
			.from(deliverables)
			.where(
				and(
					eq(deliverables.organizationId, userOrganizationId),
					lt(deliverables.dueDate, todayISO),
					notInArray(deliverables.status, [
						"completed",
						"delivered",
						"cancelled",
					]),
				),
			),
	]);

	return {
		totalBookings: bookingCounts[0]?.total || 0,
		activeBookings: bookingCounts[0]?.active || 0,
		newBookings: bookingCounts[0]?.new || 0,
		overdueBookings: overdueResult[0]?.count || 0,
	};
}

// 1. Define the new interface for ShootStats
export interface ShootStats {
	totalShoots: number;
	upcomingShoots: number;
	pastShoots: number;
	unstaffedUpcomingShoots: number;
}

// 2. Create the equivalent function for shoots
export async function getShootsStats(
	userOrganizationId: string,
): Promise<ShootStats> {
	const todayISO = formatISO(startOfDay(new Date()), {
		representation: "date",
	});

	// Use Promise.all to run the main stats query and the unstaffed query concurrently
	const [shootCounts, unstaffedResult] = await Promise.all([
		// Query 1: Get total, upcoming, and past counts in a single efficient query
		db
			.select({
				total: sql<number>`count(*)`.mapWith(Number),
				upcoming:
					sql<number>`sum(case when ${shoots.date} >= ${todayISO} then 1 else 0 end)`.mapWith(
						Number,
					),
				past: sql<number>`sum(case when ${shoots.date} < ${todayISO} then 1 else 0 end)`.mapWith(
					Number,
				),
			})
			.from(shoots)
			.where(eq(shoots.organizationId, userOrganizationId)),

		// Query 2: Get the count of unique upcoming shoots that have no crew assigned
		db
			.select({
				count: countDistinct(shoots.id),
			})
			.from(shoots)
			.leftJoin(shootsAssignments, eq(shoots.id, shootsAssignments.shootId))
			.where(
				and(
					eq(shoots.organizationId, userOrganizationId),
					gte(shoots.date, todayISO), // Only consider upcoming shoots
					isNull(shootsAssignments.id), // The key condition: find shoots with no assignment
				),
			),
	]);

	return {
		totalShoots: shootCounts[0]?.total || 0,
		upcomingShoots: shootCounts[0]?.upcoming || 0,
		pastShoots: shootCounts[0]?.past || 0,
		unstaffedUpcomingShoots: unstaffedResult[0]?.count || 0,
	};
}

// 1. Define the new interface for DeliverableStats
export interface DeliverableStats {
	totalDeliverables: number;
	activeDeliverables: number;
	pendingDeliverables: number;
	overdueDeliverables: number;
}

// 2. Create the equivalent function for deliverables
export async function getDeliverablesStats(
	userOrganizationId: string,
): Promise<DeliverableStats> {
	const todayISO = formatISO(startOfDay(new Date()), {
		representation: "date",
	});

	// All stats can be calculated in a single, efficient query from the deliverables table
	const deliverableCounts = await db
		.select({
			// Total count of all deliverables
			total: sql<number>`count(*)`.mapWith(Number),

			// Count of deliverables that are not in a final state
			active:
				sql<number>`sum(case when ${deliverables.status} not in ('completed', 'delivered', 'cancelled') then 1 else 0 end)`.mapWith(
					Number,
				),

			// Count of deliverables that are new and waiting to be started
			pending:
				sql<number>`sum(case when ${deliverables.status} = 'pending' then 1 else 0 end)`.mapWith(
					Number,
				),

			// Count of active deliverables that are past their due date
			overdue:
				sql<number>`sum(case when ${deliverables.dueDate} < ${todayISO} and ${deliverables.status} not in ('completed', 'delivered', 'cancelled') then 1 else 0 end)`.mapWith(
					Number,
				),
		})
		.from(deliverables)
		.where(eq(deliverables.organizationId, userOrganizationId));

	const stats = deliverableCounts[0];

	return {
		totalDeliverables: stats?.total || 0,
		activeDeliverables: stats?.active || 0,
		pendingDeliverables: stats?.pending || 0,
		overdueDeliverables: stats?.overdue || 0,
	};
}

export interface ExpenseStats {
	foodAndDrink: number;
	travelAndAccommodation: number;
	equipment: number;
	miscellaneous: number;
}

/**
 * Returns all‐time expense totals for each major bucket,
 * counting only expenses billed to the Studio.
 */
export async function getExpenseStats(
	userOrganizationId: string,
): Promise<ExpenseStats> {
	// Single SELECT with four SUM(CASE...)s
	const row = (
		await db
			.select({
				foodAndDrink: sql<number>`
		  COALESCE(
			SUM(
			  CASE
				WHEN ${expenses.category} IN ('food','drink')
				  THEN ${expenses.amount}
				ELSE 0
			  END
			), 0
		  )
		`.mapWith(Number),

				travelAndAccommodation: sql<number>`
		  COALESCE(
			SUM(
			  CASE
				WHEN ${expenses.category}
					 IN ('travel','accommodation')
				  THEN ${expenses.amount}
				ELSE 0
			  END
			), 0
		  )
		`.mapWith(Number),

				equipment: sql<number>`
		  COALESCE(
			SUM(
			  CASE
				WHEN ${expenses.category} = 'equipment'
				  THEN ${expenses.amount}
				ELSE 0
			  END
			), 0
		  )
		`.mapWith(Number),

				miscellaneous: sql<number>`
		  COALESCE(
			SUM(
			  CASE
				WHEN ${expenses.category} NOT IN (
				  'food','drink','travel','accommodation','equipment'
				)
				THEN ${expenses.amount}
				ELSE 0
			  END
			), 0
		  )
		`.mapWith(Number),
			})
			.from(expenses)
			.where(
				and(
					eq(expenses.organizationId, userOrganizationId),
					eq(expenses.billTo, "Studio"), // <— only Studio-billed expenses
				),
			)
	)[0] || {
		foodAndDrink: 0,
		travelAndAccommodation: 0,
		equipment: 0,
		miscellaneous: 0,
	};

	return {
		foodAndDrink: row.foodAndDrink,
		travelAndAccommodation: row.travelAndAccommodation,
		equipment: row.equipment,
		miscellaneous: row.miscellaneous,
	};
}

export async function getOnboardingStatus(userOrganizationId: string): Promise<{
	onboarded: boolean;
	organizationCreated: boolean;
	packageCreated: boolean;
	bookingCreated: boolean;
	membersInvited: boolean;
}> {
	const [packagesCount, bookingsCount, invitationsCount] = await Promise.all([
		db.$count(
			configurations,
			and(
				eq(configurations.type, "package_type"),
				or(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.isSystem, true),
				),
			),
		),
		db.$count(bookings, eq(bookings.organizationId, userOrganizationId)),
		db.$count(invitations, eq(invitations.organizationId, userOrganizationId)),
	]);

	return {
		onboarded:
			packagesCount > 0 &&
			bookingsCount > 0 &&
			userOrganizationId !== null &&
			invitationsCount > 0,
		organizationCreated: !!userOrganizationId,
		packageCreated: packagesCount > 0,
		bookingCreated: bookingsCount > 0,
		membersInvited: invitationsCount > 0,
	};
}

// (You can add this to your existing queries.ts file)

interface GetUserAssignmentsParams {
	organizationId: string;
	userId: string;
	types?: string[];
	status?: string;
	startDate?: string;
	endDate?: string;
	page: number;
	pageSize: number;
}

export async function getUserAssignments(params: GetUserAssignmentsParams) {
	const {
		organizationId,
		userId,
		types = [],
		status,
		startDate,
		endDate,
		page,
		pageSize,
	} = params;

	console.log(userId, organizationId, types, status, startDate, endDate);

	const inactiveTaskStatuses = ["completed"];

	const inactiveDeliverableStatuses = ["delivered", "cancelled"];

	const defaultShootStartDate = formatISO(subDays(new Date(), 7), {
		representation: "date",
	});

	const crewMember = await db
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

	if (crewMember.length === 0) {
		return null;
	}

	const crewId = crewMember[0].id;
	const offset = (page - 1) * pageSize;

	const results: Record<string, any> = {};
	const pagination: Record<string, any> = {};

	const shouldFetch = (type: string) =>
		types.length === 0 || types.includes(type);

	// Step 2: Fetch each assignment type conditionally
	const fetchPromises = [];

	// --- Fetch Shoots ---
	if (shouldFetch("shoot")) {
		const shootConditions = [
			eq(shootsAssignments.crewId, crewId),
			eq(shootsAssignments.organizationId, organizationId),
			startDate ? gte(shoots.date, startDate) : undefined,
			endDate ? lte(shoots.date, endDate) : undefined,
		].filter((c): c is SQL => c !== undefined);

		if (!startDate && !endDate) {
			shootConditions.push(gte(shoots.date, defaultShootStartDate));
		}

		fetchPromises.push(
			db
				.select({
					assignment: shootsAssignments,
					shoot: shoots,
					booking: { id: bookings.id, name: bookings.name },
				})
				.from(shootsAssignments)
				.leftJoin(shoots, eq(shootsAssignments.shootId, shoots.id))
				.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
				.where(and(...shootConditions))
				.orderBy(desc(shootsAssignments.assignedAt))
				.limit(pageSize)
				.offset(offset)
				.then((flatData) => {
					const nestedData = flatData.map((row) => ({
						...row.assignment,
						shoot: {
							...row.shoot,
							booking: row.booking,
						},
					}));
					results.shoots = nestedData;
				}),
			// db.query.shootsAssignments
			// 	.findMany({
			// 		where: and(...shootConditions),
			// 		with: {
			// 			shoot: { with: { booking: { columns: { id: true, name: true } } } },
			// 		},
			// 		limit: pageSize,
			// 		offset,
			// 		orderBy: (t, { desc }) => [desc(t.assignedAt)],
			// 	})
			// 	.then((data) => {
			// 		results.shoots = data;
			// 		return data;
			// 	}),
			db
				.select({ value: count() })
				.from(shootsAssignments)
				.leftJoin(shoots, eq(shootsAssignments.shootId, shoots.id))
				.where(and(...shootConditions))
				.then((total) => {
					pagination.shoots = {
						total: total[0].value,
						page,
						pageSize,
					};
				}),
		);
	}

	// --- Fetch Tasks ---
	if (shouldFetch("task")) {
		const taskConditions = [
			eq(tasksAssignments.crewId, crewId),
			eq(tasksAssignments.organizationId, organizationId),
			status
				? eq(
						tasks.status,
						status as
							| "completed"
							| "in_progress"
							| "in_revision"
							| "todo"
							| "in_review",
					)
				: undefined,
			startDate ? gte(tasks.dueDate, startDate) : undefined,
			endDate ? lte(tasks.dueDate, endDate) : undefined,
		].filter((c): c is SQL => c !== undefined);

		if (!status) {
			taskConditions.push(
				notInArray(
					tasks.status,
					inactiveTaskStatuses as (
						| "completed"
						| "in_progress"
						| "in_revision"
						| "todo"
						| "in_review"
					)[],
				),
			);
		}

		fetchPromises.push(
			db
				.select({
					assignment: tasksAssignments,
					task: tasks,
					booking: { id: bookings.id, name: bookings.name },
					deliverable: { id: deliverables.id, title: deliverables.title },
				})
				.from(tasksAssignments)
				.leftJoin(tasks, eq(tasksAssignments.taskId, tasks.id))
				.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
				.leftJoin(deliverables, eq(tasks.deliverableId, deliverables.id))
				.where(and(...taskConditions))
				.orderBy(desc(tasksAssignments.assignedAt))
				.limit(pageSize)
				.offset(offset)
				.then((flatData) => {
					results.tasks = flatData.map((row) => ({
						...row.assignment,
						task: {
							...row.task,
							booking: row.booking,
							deliverable: row.deliverable,
						},
					}));
				}),
			// db.query.tasksAssignments
			// 	.findMany({
			// 		where: and(...taskConditions),
			// 		with: {
			// 			task: {
			// 				with: {
			// 					booking: { columns: { id: true, name: true } },
			// 					deliverable: { columns: { id: true, title: true } },
			// 				},
			// 			},
			// 		},
			// 		limit: pageSize,
			// 		offset,
			// 		orderBy: (t, { desc }) => [desc(t.assignedAt)],
			// 	})
			// 	.then((data) => {
			// 		results.tasks = data;
			// 		return data;
			// 	}),
			db
				.select({ value: count() })
				.from(tasksAssignments)
				.leftJoin(tasks, eq(tasksAssignments.taskId, tasks.id))
				.where(and(...taskConditions))
				.then((total) => {
					pagination.tasks = { total: total[0].value, page, pageSize };
				}),
		);
	}

	// --- Fetch Deliverables ---
	if (shouldFetch("deliverable")) {
		const deliverableConditions = [
			eq(deliverablesAssignments.crewId, crewId),
			eq(deliverablesAssignments.organizationId, organizationId),
			status
				? eq(
						deliverables.status,
						status as
							| "completed"
							| "cancelled"
							| "pending"
							| "in_progress"
							| "in_revision"
							| "delivered",
					)
				: undefined,
			startDate ? gte(deliverables.dueDate, startDate) : undefined,
			endDate ? lte(deliverables.dueDate, endDate) : undefined,
		].filter((c): c is SQL => c !== undefined);

		if (!status) {
			deliverableConditions.push(
				notInArray(
					deliverables.status,
					inactiveDeliverableStatuses as (
						| "completed"
						| "cancelled"
						| "pending"
						| "in_progress"
						| "in_revision"
						| "delivered"
					)[],
				),
			);
		}

		fetchPromises.push(
			db
				.select({
					assignment: deliverablesAssignments,
					deliverable: deliverables,
					booking: { id: bookings.id, name: bookings.name },
				})
				.from(deliverablesAssignments)
				.leftJoin(
					deliverables,
					eq(deliverablesAssignments.deliverableId, deliverables.id),
				)
				.leftJoin(bookings, eq(deliverables.bookingId, bookings.id))
				.where(and(...deliverableConditions))
				.orderBy(desc(deliverablesAssignments.assignedAt))
				.limit(pageSize)
				.offset(offset)
				.then((flatData) => {
					results.deliverables = flatData.map((row) => ({
						...row.assignment,
						deliverable: {
							...row.deliverable,
							booking: row.booking,
						},
					}));
				}),
			// db.query.deliverablesAssignments
			// 	.findMany({
			// 		where: and(...deliverableConditions),
			// 		with: {
			// 			deliverable: {
			// 				with: { booking: { columns: { id: true, name: true } } },
			// 			},
			// 		},
			// 		limit: pageSize,
			// 		offset,
			// 		orderBy: (t, { desc }) => [desc(t.assignedAt)],
			// 	})
			// 	.then((data) => {
			// 		results.deliverables = data;
			// 		return data;
			// 	}),
			db
				.select({ value: count() })
				.from(deliverablesAssignments)
				.leftJoin(
					deliverables,
					eq(deliverablesAssignments.deliverableId, deliverables.id),
				)
				.where(and(...deliverableConditions))
				.then((total) => {
					pagination.deliverables = {
						total: total[0].value,
						page,
						pageSize,
					};
				}),
		);
	}

	// // --- Fetch Expenses ---
	// if (shouldFetch("expense")) {
	// 	const expenseConditions = [
	// 		eq(expensesAssignments.crewId, crewId),
	// 		eq(expensesAssignments.organizationId, organizationId),
	// 		startDate ? gte(expenses.date, startDate) : undefined,
	// 		endDate ? lte(expenses.date, endDate) : undefined,
	// 	].filter((c): c is SQL => c !== undefined);

	// 	fetchPromises.push(
	// 		db.query.expensesAssignments
	// 			.findMany({
	// 				where: and(...expenseConditions),
	// 				with: {
	// 					expense: {
	// 						with: { booking: { columns: { id: true, name: true } } },
	// 					},
	// 				},
	// 				limit: pageSize,
	// 				offset,
	// 				orderBy: (t, { desc }) => [desc(t.assignedAt)],
	// 			})
	// 			.then((data) => {
	// 				results.expenses = data;
	// 				return data;
	// 			}),
	// 		db
	// 			.select({ value: count() })
	// 			.from(expensesAssignments)
	// 			.leftJoin(expenses, eq(expensesAssignments.expenseId, expenses.id))
	// 			.where(and(...expenseConditions))
	// 			.then((total) => {
	// 				pagination.expenses = {
	// 					total: total[0].value,
	// 					page,
	// 					pageSize,
	// 				};
	// 			}),
	// 	);
	// }

	await Promise.all(fetchPromises);

	return {
		data: results,
		pagination,
	};
}

interface GetAllUserAssignmentsParams {
	userId: string;
	organizationId: string;
	page: number;
	pageSize: number;
}

export async function getAllUserShootAssignments(
	params: GetAllUserAssignmentsParams,
) {
	const { userId, organizationId, page, pageSize } = params;

	const crewMember = await db
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

	if (crewMember.length === 0) {
		return { data: [], pagination: { total: 0, page, pageSize } };
	}

	const crewId = crewMember[0].id;
	const offset = (page - 1) * pageSize;

	const conditions = [
		eq(shootsAssignments.crewId, crewId),
		eq(shootsAssignments.organizationId, organizationId),
	];

	// Fetch data and total count in parallel
	const [data, total] = await Promise.all([
		db
			.select({
				assignment: shootsAssignments,
				shoot: shoots,
				booking: { id: bookings.id, name: bookings.name },
			})
			.from(shootsAssignments)
			.leftJoin(shoots, eq(shootsAssignments.shootId, shoots.id))
			.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
			.where(and(...conditions))
			.orderBy(desc(shoots.date))
			.limit(pageSize)
			.offset(offset),
		db
			.select({ value: count() })
			.from(shootsAssignments)
			.where(and(...conditions)),
	]);

	// Reconstruct the nested object shape
	const nestedData = data.map((row) => ({
		...row.assignment,
		shoot: {
			...row.shoot,
			booking: row.booking,
		},
	}));

	return {
		data: nestedData,
		pagination: {
			total: total[0].value,
			page,
			pageSize,
		},
	};
}

export async function getAllUserTaskAssignments(
	params: GetAllUserAssignmentsParams,
) {
	const { userId, organizationId, page, pageSize } = params;

	const crewMember = await db
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

	if (crewMember.length === 0) {
		return { data: [], pagination: { total: 0, page, pageSize } };
	}

	const crewId = crewMember[0].id;
	const offset = (page - 1) * pageSize;

	const conditions = [
		eq(tasksAssignments.crewId, crewId),
		eq(tasksAssignments.organizationId, organizationId),
	];

	const [data, total] = await Promise.all([
		db
			.select({
				assignment: tasksAssignments,
				task: tasks,
				booking: { id: bookings.id, name: bookings.name },
				deliverable: { id: deliverables.id, title: deliverables.title },
			})
			.from(tasksAssignments)
			.leftJoin(tasks, eq(tasksAssignments.taskId, tasks.id))
			.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
			.leftJoin(deliverables, eq(tasks.deliverableId, deliverables.id))
			.where(and(...conditions))
			.orderBy(desc(tasks.dueDate)) // Order by due date for history
			.limit(pageSize)
			.offset(offset),
		db
			.select({ value: count() })
			.from(tasksAssignments)
			.where(and(...conditions)),
	]);

	const nestedData = data.map((row) => ({
		...row.assignment,
		task: {
			...row.task,
			booking: row.booking,
			deliverable: row.deliverable,
		},
	}));

	return {
		data: nestedData,
		pagination: {
			total: total[0].value,
			page,
			pageSize,
		},
	};
}

export async function getAllUserDeliverableAssignments(
	params: GetAllUserAssignmentsParams,
) {
	const { userId, organizationId, page, pageSize } = params;

	const crewMember = await db
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

	if (crewMember.length === 0) {
		return { data: [], pagination: { total: 0, page, pageSize } };
	}

	const crewId = crewMember[0].id;
	const offset = (page - 1) * pageSize;

	const conditions = [
		eq(deliverablesAssignments.crewId, crewId),
		eq(deliverablesAssignments.organizationId, organizationId),
	];

	const [data, total] = await Promise.all([
		db
			.select({
				assignment: deliverablesAssignments,
				deliverable: deliverables,
				booking: { id: bookings.id, name: bookings.name },
			})
			.from(deliverablesAssignments)
			.leftJoin(
				deliverables,
				eq(deliverablesAssignments.deliverableId, deliverables.id),
			)
			.leftJoin(bookings, eq(deliverables.bookingId, bookings.id))
			.where(and(...conditions))
			.orderBy(desc(deliverables.dueDate)) // Order by due date for history
			.limit(pageSize)
			.offset(offset),
		db
			.select({ value: count() })
			.from(deliverablesAssignments)
			.where(and(...conditions)),
	]);

	const nestedData = data.map((row) => ({
		...row.assignment,
		deliverable: {
			...row.deliverable,
			booking: row.booking,
		},
	}));

	return {
		data: nestedData,
		pagination: {
			total: total[0].value,
			page,
			pageSize,
		},
	};
}

function getDateRangeFromInterval(interval: string): {
	startDate: Date;
	endDate: Date;
} {
	const now = new Date();
	const endDate = startOfDay(now); // Use start of today for consistency
	let startDate: Date;

	switch (interval) {
		case "7d":
			startDate = subDays(endDate, 7);
			break;
		case "90d":
			startDate = subDays(endDate, 90);
			break;
		case "1y":
			startDate = subDays(endDate, 365);
			break;

		default:
			startDate = subDays(endDate, 30);
			break;
	}
	return { startDate, endDate };
}

// Drop-in replacement for getBookingAnalytics

async function getBookingAnalytics(organizationId: string, interval: string) {
	const dateRange =
		interval === "all" ? null : getDateRangeFromInterval(interval);

	const buildConditions = (): SQL[] => {
		const conditions: SQL[] = [eq(bookings.organizationId, organizationId)];
		if (dateRange) {
			conditions.push(gte(bookings.createdAt, dateRange.startDate));
			conditions.push(lte(bookings.createdAt, dateRange.endDate));
		}
		return conditions;
	};
	const conditions = buildConditions();

	const [
		bookingCounts,
		recentNewBookings,
		recentClients,
		recentPayments,
		bookingTypeDistribution,
		packageTypeDistribution,
		bookingsOverTime,
	] = await Promise.all([
		// This query was correct
		db
			.select({
				total: count(),
				active: count(
					sql`CASE WHEN ${bookings.status} NOT IN ('completed', 'cancelled') THEN 1 END`,
				),
				new: count(sql`CASE WHEN ${bookings.status} = 'new' THEN 1 END`),
			})
			.from(bookings)
			.where(and(...conditions)),

		// --- THIS QUERY IS NOW FIXED ---
		// It now joins through the bookingParticipants table to get the client name.
		// In your Promise.all array inside getBookingAnalytics:

		db
			.select({
				id: bookings.id,
				name: bookings.name,
				// Use string_agg to combine names from multiple clients into one string
				clientName: sql<string>`string_agg(${clients.name}, ', ')`,
				createdAt: bookings.createdAt,
			})
			.from(bookings)
			.leftJoin(
				bookingParticipants,
				eq(bookings.id, bookingParticipants.bookingId),
			)
			.leftJoin(clients, eq(bookingParticipants.clientId, clients.id))
			.where(
				and(
					eq(bookings.organizationId, organizationId),
					eq(bookings.status, "new"),
				),
			)
			.orderBy(desc(bookings.createdAt))
			// IMPORTANT: Group only by the booking's unique ID
			.groupBy(bookings.id)
			.limit(10),

		// This query was correct
		db
			.select()
			.from(clients)
			.where(eq(clients.organizationId, organizationId))
			.orderBy(desc(clients.createdAt))
			.limit(3),

		// This query was correct
		db
			.select({
				id: receivedAmounts.id,
				amount: receivedAmounts.amount,
				paidOn: receivedAmounts.paidOn,
				bookingName: bookings.name,
			})
			.from(receivedAmounts)
			.leftJoin(bookings, eq(receivedAmounts.bookingId, bookings.id))
			.where(eq(bookings.organizationId, organizationId))
			.orderBy(desc(receivedAmounts.paidOn))
			.limit(5),

		// ... The rest of the Promise.all queries were correct and remain unchanged ...
		db
			.select({
				type: bookings.bookingType,
				count: count(),
				totalRevenue: sum(bookings.packageCost),
			})
			.from(bookings)
			.where(and(...conditions, notInArray(bookings.status, ["cancelled"])))
			.groupBy(bookings.bookingType)
			.orderBy(desc(count())),
		db
			.select({
				type: bookings.packageType,
				count: count(),
				totalRevenue: sum(bookings.packageCost),
			})
			.from(bookings)
			.where(and(...conditions, notInArray(bookings.status, ["cancelled"])))
			.groupBy(bookings.packageType)
			.orderBy(desc(count())),
		db
			.select({
				date: sql<string>`DATE_TRUNC('day', ${bookings.createdAt})`,
				count: count(),
			})
			.from(bookings)
			.where(and(...conditions))
			.groupBy(sql`DATE_TRUNC('day', ${bookings.createdAt})`)
			.orderBy(sql`DATE_TRUNC('day', ${bookings.createdAt})`),
	]);

	return {
		summary: {
			totalBookings: bookingCounts[0]?.total || 0,
			activeBookings: bookingCounts[0]?.active || 0,
			newBookings: bookingCounts[0]?.new || 0,
		},
		recentNewBookings,
		recentClients,
		recentPayments,
		bookingTypeDistribution: bookingTypeDistribution.map((item) => ({
			...item,
			totalRevenue: item.totalRevenue || "0.00",
		})),
		packageTypeDistribution: packageTypeDistribution.map((item) => ({
			...item,
			totalRevenue: item.totalRevenue || "0.00",
		})),
		bookingsOverTime,
	};
}

// async function getBookingAnalytics(organizationId: string, interval: string) {
// 	const dateRange =
// 		interval === "all" ? null : getDateRangeFromInterval(interval);

// 	const buildConditions = (): SQL[] => {
// 		const conditions: SQL[] = [eq(bookings.organizationId, organizationId)];
// 		if (dateRange) {
// 			conditions.push(gte(bookings.createdAt, dateRange.startDate));
// 			conditions.push(lte(bookings.createdAt, dateRange.endDate));
// 		}
// 		return conditions;
// 	};
// 	const conditions = buildConditions();

// 	const [
// 		bookingCounts,
// 		recentNewBookings,
// 		recentClients,
// 		recentPayments,
// 		bookingTypeDistribution,
// 		packageTypeDistribution,
// 		bookingsOverTime,
// 	] = await Promise.all([
// 		db
// 			.select({
// 				total: count(),
// 				active: count(
// 					sql`CASE WHEN ${bookings.status} NOT IN ('completed', 'cancelled') THEN 1 END`,
// 				),
// 				new: count(sql`CASE WHEN ${bookings.status} = 'new' THEN 1 END`),
// 			})
// 			.from(bookings)
// 			.where(and(...conditions)),
// 		db
// 			.select({
// 				id: bookings.id,
// 				name: bookings.name,
// 				clientName: clients.name,
// 				createdAt: bookings.createdAt,
// 			})
// 			.from(bookings)
// 			.leftJoin(clients, eq(bookings.clientId, clients.id))
// 			.where(
// 				and(
// 					eq(bookings.organizationId, organizationId),
// 					eq(bookings.status, "new"),
// 				),
// 			)
// 			.orderBy(desc(bookings.createdAt))
// 			.limit(10),
// 		db
// 			.select()
// 			.from(clients)
// 			.where(eq(clients.organizationId, organizationId))
// 			.orderBy(desc(clients.createdAt))
// 			.limit(3),
// 		db
// 			.select({
// 				id: receivedAmounts.id,
// 				amount: receivedAmounts.amount,
// 				paidOn: receivedAmounts.paidOn,
// 				bookingName: bookings.name,
// 			})
// 			.from(receivedAmounts)
// 			.leftJoin(bookings, eq(receivedAmounts.bookingId, bookings.id))
// 			.where(eq(bookings.organizationId, organizationId))
// 			.orderBy(desc(receivedAmounts.paidOn))
// 			.limit(5),
// 		db
// 			.select({
// 				type: bookings.bookingType,
// 				count: count(),
// 				totalRevenue: sum(bookings.packageCost),
// 			})
// 			.from(bookings)
// 			.where(and(...conditions, notInArray(bookings.status, ["cancelled"])))
// 			.groupBy(bookings.bookingType)
// 			.orderBy(desc(count())),
// 		db
// 			.select({
// 				type: bookings.packageType,
// 				count: count(),
// 				totalRevenue: sum(bookings.packageCost),
// 			})
// 			.from(bookings)
// 			.where(and(...conditions, notInArray(bookings.status, ["cancelled"])))
// 			.groupBy(bookings.packageType)
// 			.orderBy(desc(count())),
// 		db
// 			.select({
// 				date: sql<string>`DATE_TRUNC('day', ${bookings.createdAt})`,
// 				count: count(),
// 			})
// 			.from(bookings)
// 			.where(and(...conditions))
// 			.groupBy(sql`DATE_TRUNC('day', ${bookings.createdAt})`)
// 			.orderBy(sql`DATE_TRUNC('day', ${bookings.createdAt})`),
// 	]);

// 	// const totalBookingsForRate =
// 	// 	(bookingCounts[0]?.total || 0) + (bookingCounts[0]?.cancelled || 0);

// 	// const cancellationRate =
// 	// 	totalBookingsForRate > 0
// 	// 		? (bookingCounts[0]?.cancelled || 0) / totalBookingsForRate
// 	// 		: 0;

// 	return {
// 		summary: {
// 			totalBookings: bookingCounts[0]?.total || 0,
// 			activeBookings: bookingCounts[0]?.active || 0,
// 			newBookings: bookingCounts[0]?.new || 0,
// 		},
// 		recentNewBookings,
// 		recentClients,
// 		recentPayments,

// 		bookingTypeDistribution: bookingTypeDistribution.map((item) => ({
// 			...item,
// 			totalRevenue: item.totalRevenue || "0.00",
// 		})),
// 		packageTypeDistribution: packageTypeDistribution.map((item) => ({
// 			...item,
// 			totalRevenue: item.totalRevenue || "0.00",
// 		})),
// 		bookingsOverTime,
// 	};
// }

async function getFinancialsKpis(organizationId: string, interval: string) {
	const dateRange =
		interval === "all" ? null : getDateRangeFromInterval(interval);

	// console.log("dateRange", dateRange);

	const todayISO = formatISO(new Date(), { representation: "date" });

	const [revenueResult, cashResult, expenseResult, overdueResult] =
		await Promise.all([
			db
				.select({ value: sum(bookings.packageCost) })
				.from(bookings)
				.where(
					and(
						eq(bookings.organizationId, organizationId),
						notInArray(bookings.status, ["cancelled"]),
						dateRange
							? gte(bookings.createdAt, dateRange.startDate)
							: undefined,
						dateRange ? lte(bookings.createdAt, dateRange.endDate) : undefined,
					),
				),
			db
				.select({ value: sum(receivedAmounts.amount) })
				.from(bookings)
				.innerJoin(receivedAmounts, eq(bookings.id, receivedAmounts.bookingId))
				.where(
					and(
						eq(bookings.organizationId, organizationId),
						dateRange
							? gte(
									receivedAmounts.paidOn,
									formatISO(dateRange.startDate, { representation: "date" }),
								)
							: undefined,
						dateRange
							? lte(
									receivedAmounts.paidOn,
									formatISO(dateRange.endDate, { representation: "date" }),
								)
							: undefined,
					),
				),
			db
				.select({ value: sum(expenses.amount) })
				.from(expenses)
				.where(
					and(
						eq(expenses.organizationId, organizationId),
						dateRange
							? gte(
									expenses.date,
									formatISO(dateRange.startDate, { representation: "date" }),
								)
							: undefined,
						dateRange
							? lte(
									expenses.date,
									formatISO(dateRange.endDate, { representation: "date" }),
								)
							: undefined,
					),
				),
			db
				.select({ value: sum(paymentSchedules.amount) })
				.from(paymentSchedules)
				.leftJoin(bookings, eq(paymentSchedules.bookingId, bookings.id))
				.where(
					and(
						eq(bookings.organizationId, organizationId),
						lt(paymentSchedules.dueDate, todayISO),
						// notInArray(paymentSchedules.status, ["paid", "cancelled"]),
					),
				),
		]);

	return {
		projectedRevenue: revenueResult[0]?.value || "0.00",
		collectedCash: cashResult[0]?.value || "0.00",
		totalExpenses: expenseResult[0]?.value || "0.00",
		overdueInvoicesValue: overdueResult[0]?.value || "0.00",
	};
}

// async function getActionItems(organizationId: string) {
// 	const today = startOfDay(new Date());
// 	const nextWeek = addDays(today, 7);

// 	const [overdueTasks, overdueDeliverables, unstaffedShoots] =
// 		await Promise.all([
// 			db
// 				.select({
// 					id: tasks.id,
// 					description: tasks.description,
// 					bookingName: bookings.name,
// 					dueDate: tasks.dueDate,
// 				})
// 				.from(tasks)
// 				.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
// 				.where(
// 					and(
// 						eq(tasks.organizationId, organizationId),
// 						lte(tasks.dueDate, formatISO(today, { representation: "date" })),
// 						notInArray(tasks.status, [taskStatusEnum.enumValues[4]]),
// 					),
// 				)
// 				.limit(5),
// 			db
// 				.select({
// 					id: deliverables.id,
// 					title: deliverables.title,
// 					bookingName: bookings.name,
// 					dueDate: deliverables.dueDate,
// 				})
// 				.from(deliverables)
// 				.leftJoin(bookings, eq(deliverables.bookingId, bookings.id))
// 				.where(
// 					and(
// 						eq(deliverables.organizationId, organizationId),
// 						lte(
// 							deliverables.dueDate,
// 							formatISO(today, { representation: "date" }),
// 						),
// 						notInArray(deliverables.status, ["cancelled"]),
// 					),
// 				)
// 				.limit(5),
// 			db
// 				.select({
// 					id: shoots.id,
// 					title: shoots.title,
// 					bookingName: bookings.name,
// 					shootDate: shoots.date,
// 				})
// 				.from(shoots)
// 				.leftJoin(shootsAssignments, eq(shoots.id, shootsAssignments.shootId))
// 				.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
// 				.where(
// 					and(
// 						eq(shoots.organizationId, organizationId),
// 						gte(shoots.date, formatISO(today, { representation: "date" })),
// 						lte(shoots.date, formatISO(nextWeek, { representation: "date" })),
// 						isNull(shootsAssignments.id),
// 					),
// 				)
// 				.groupBy(shoots.id, bookings.name)
// 				.limit(5),
// 		]);

// 	return { overdueTasks, overdueDeliverables, unstaffedShoots };
// }

// Drop-in replacement for getActionItems

async function getActionItems(organizationId: string) {
	const today = startOfDay(new Date());
	const nextWeek = addDays(today, 7);

	const [overdueTasks, overdueDeliverables, unstaffedShoots] =
		await Promise.all([
			// --- THIS QUERY IS NOW FIXED ---
			// It now checks for status 'completed' as a string, not an enum.
			db
				.select({
					id: tasks.id,
					description: tasks.description,
					bookingName: bookings.name,
					dueDate: tasks.dueDate,
				})
				.from(tasks)
				.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
				.where(
					and(
						eq(tasks.organizationId, organizationId),
						lte(tasks.dueDate, formatISO(today, { representation: "date" })),
						// Corrected line:
						notInArray(tasks.status, ["completed"]),
					),
				)
				.limit(5),

			// This query was correct
			db
				.select({
					id: deliverables.id,
					title: deliverables.title,
					bookingName: bookings.name,
					dueDate: deliverables.dueDate,
				})
				.from(deliverables)
				.leftJoin(bookings, eq(deliverables.bookingId, bookings.id))
				.where(
					and(
						eq(deliverables.organizationId, organizationId),
						lte(
							deliverables.dueDate,
							formatISO(today, { representation: "date" }),
						),
						notInArray(deliverables.status, ["cancelled"]),
					),
				)
				.limit(5),

			// This query was correct
			db
				.select({
					id: shoots.id,
					title: shoots.title,
					bookingName: bookings.name,
					shootDate: shoots.date,
				})
				.from(shoots)
				.leftJoin(shootsAssignments, eq(shoots.id, shootsAssignments.shootId))
				.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
				.where(
					and(
						eq(shoots.organizationId, organizationId),
						gte(shoots.date, formatISO(today, { representation: "date" })),
						lte(shoots.date, formatISO(nextWeek, { representation: "date" })),
						isNull(shootsAssignments.id),
					),
				)
				.groupBy(shoots.id, bookings.name)
				.limit(5),
		]);

	return { overdueTasks, overdueDeliverables, unstaffedShoots };
}

async function getOperationsData(organizationId: string, interval: string) {
	const today = startOfDay(new Date());
	const todayISO = formatISO(today, { representation: "date" });

	// Calculate the end date for the list filter based on the interval
	let futureEndDate: Date;
	switch (interval) {
		case "30d":
			futureEndDate = addDays(today, 30);
			break;
		case "90d":
			futureEndDate = addDays(today, 90);
			break;

		default: // Default to "7d"
			futureEndDate = addDays(today, 7);
			break;
	}
	const futureEndDateISO = formatISO(futureEndDate, {
		representation: "date",
	});

	const [
		shootsList,
		shootsCount,
		deliverablesList,
		deliverablesCount,
		tasksList,
		tasksCount,
	] = await Promise.all([
		db
			.select({
				id: shoots.id,
				title: shoots.title,
				date: shoots.date,
				bookingName: bookings.name,
			})
			.from(shoots)
			.leftJoin(bookings, eq(shoots.bookingId, bookings.id))
			.where(
				and(
					eq(shoots.organizationId, organizationId),
					gte(shoots.date, todayISO),
					lte(shoots.date, futureEndDateISO), // Apply the interval filter here
				),
			)
			.orderBy(asc(shoots.date)),
		db
			.select({ count: count() })
			.from(shoots)
			.where(
				and(
					eq(shoots.organizationId, organizationId),
					gte(shoots.date, todayISO),
				),
			),

		db
			.select({
				id: deliverables.id,
				title: deliverables.title,
				dueDate: deliverables.dueDate,
				bookingName: bookings.name,
			})
			.from(deliverables)
			.leftJoin(bookings, eq(deliverables.bookingId, bookings.id))
			.where(
				and(
					eq(deliverables.organizationId, organizationId),
					gte(deliverables.dueDate, todayISO),
					lte(deliverables.dueDate, futureEndDateISO), // Apply filter
					notInArray(deliverables.status, [
						// "completed",
						// "delivered",
						"cancelled",
					]),
				),
			)
			.orderBy(asc(deliverables.dueDate)),
		// Get the TOTAL UNFILTERED COUNT of all upcoming deliverables
		db
			.select({ count: count() })
			.from(deliverables)
			.where(
				and(
					eq(deliverables.organizationId, organizationId),
					gte(deliverables.dueDate, todayISO),
					notInArray(deliverables.status, [
						// "completed",
						// "delivered",
						"cancelled",
					]),
				),
			),

		// Get a FILTERED LIST of upcoming tasks
		db
			.select({
				id: tasks.id,
				description: tasks.description,
				dueDate: tasks.dueDate,
				bookingName: bookings.name,
			})
			.from(tasks)
			.leftJoin(bookings, eq(tasks.bookingId, bookings.id))
			.where(
				and(
					eq(tasks.organizationId, organizationId),
					gte(tasks.dueDate, todayISO),
					lte(tasks.dueDate, futureEndDateISO), // Apply filter
					// notInArray(tasks.status, ["completed"]),
				),
			)
			.orderBy(asc(tasks.dueDate)),
		// Get the TOTAL UNFILTERED COUNT of all upcoming tasks
		db
			.select({ count: count() })
			.from(tasks)
			.where(
				and(
					eq(tasks.organizationId, organizationId),
					gte(tasks.dueDate, todayISO),
					// notInArray(tasks.status, ["completed"]),
				),
			),
	]);

	return {
		upcomingShoots: { list: shootsList, total: shootsCount[0]?.count || 0 },
		upcomingDeliverables: {
			list: deliverablesList,
			total: deliverablesCount[0]?.count || 0,
		},
		upcomingTasks: { list: tasksList, total: tasksCount[0]?.count || 0 },
	};
}

// async function getExpenseAnalytics(organizationId: string, interval: string) {
// 	const dateRange =
// 		interval === "all" ? null : getDateRangeFromInterval(interval);

// 	const expensesByCategory = await db
// 		.select({
// 			category: expenses.category,
// 			total: sum(expenses.amount).mapWith(Number),
// 		})
// 		.from(expenses)
// 		.where(
// 			and(
// 				eq(expenses.organizationId, organizationId),
// 				dateRange
// 					? gte(
// 							expenses.date,
// 							formatISO(dateRange.startDate, { representation: "date" }),
// 						)
// 					: undefined,
// 				dateRange
// 					? lte(
// 							expenses.date,
// 							formatISO(dateRange.endDate, { representation: "date" }),
// 						)
// 					: undefined,
// 			),
// 		)
// 		.groupBy(expenses.category)
// 		.orderBy(desc(sum(expenses.amount)));

// 	return expensesByCategory;
// }

// This function should replace your existing getExpenseAnalytics.
// It is designed to work directly with your ExpenseBreakdown component.

// The return type matches the component's expected `ExpenseData[]` prop.
type ExpenseBreakdownData = {
	category: string;
	total: number;
};

export async function getExpenseAnalytics(
	organizationId: string,
	interval: string,
): Promise<ExpenseBreakdownData[]> {
	const dateRange =
		interval === "all" ? null : getDateRangeFromInterval(interval);

	const whereConditions: (SQL | undefined)[] = [
		eq(expenses.organizationId, organizationId),
		eq(expenses.billTo, "Studio"),
	];
	if (dateRange) {
		whereConditions.push(
			gte(expenses.date, dateRange.startDate.toISOString().slice(0, 10)),
		);
		whereConditions.push(
			lte(expenses.date, dateRange.endDate.toISOString().slice(0, 10)),
		);
	}

	// --- Run the single, efficient query from getExpenseStats ---
	const [stats] = await db
		.select({
			foodAndDrink: sql<number>`
        COALESCE(SUM(CASE WHEN ${expenses.category} IN ('food','drink') THEN ${expenses.amount} ELSE 0 END), 0)
      `.mapWith(Number),
			travelAndAccommodation: sql<number>`
        COALESCE(SUM(CASE WHEN ${expenses.category} IN ('travel','accommodation') THEN ${expenses.amount} ELSE 0 END), 0)
      `.mapWith(Number),
			equipment: sql<number>`
        COALESCE(SUM(CASE WHEN ${expenses.category} = 'equipment' THEN ${expenses.amount} ELSE 0 END), 0)
      `.mapWith(Number),
			miscellaneous: sql<number>`
        COALESCE(SUM(CASE WHEN ${expenses.category} NOT IN ('food','drink','travel','accommodation','equipment') THEN ${expenses.amount} ELSE 0 END), 0)
      `.mapWith(Number),
		})
		.from(expenses)
		.where(and(...whereConditions));

	// --- Transform the result into the EXACT shape the component needs ---
	const expenseBreakdown: ExpenseBreakdownData[] = [
		{
			category: "Food & Drink",
			total: stats?.foodAndDrink || 0,
		},
		{
			category: "Travel & Stay",
			total: stats?.travelAndAccommodation || 0,
		},
		{
			category: "Equipment",
			total: stats?.equipment || 0,
		},
		{
			category: "Miscellaneous",
			total: stats?.miscellaneous || 0,
		},
	];

	// Filter out any categories with a zero total to keep the chart clean.
	// This returns the final array in the perfect format.
	return expenseBreakdown.filter((item) => item.total > 0);
}
interface DashboardParams {
	organizationId: string;
	interval: string;
	operationsInterval: string;
}

// MODIFIED: getDashboardData now uses the central filter
export async function getDashboardData(params: DashboardParams) {
	const { organizationId, interval, operationsInterval } = params;

	console.log({ operationsInterval });

	console.log({ organizationId, interval });

	const [kpis, bookingAnalytics, expenseAnalytics, actionItems, operations] =
		await Promise.all([
			getFinancialsKpis(organizationId, interval),
			getBookingAnalytics(organizationId, "all"),
			// getBookingAnalytics(organizationId),
			getExpenseAnalytics(organizationId, interval),
			getActionItems(organizationId),
			getOperationsData(organizationId, operationsInterval),
		]);

	return {
		kpis,
		bookingAnalytics,
		expenseAnalytics,
		actionItems,
		operations,
	};
}

// ====================================================================
// Function for Received Payments
// ====================================================================

export type ReceivedPaymentFilters = {
	description?: string;
	paidOn?: string; // For date range filtering
	bookingId?: string;
	invoiceId?: string;
};

type AllowedReceivedPaymentSortFields = "amount" | "paidOn" | "createdAt";
type ReceivedPaymentSortOption = {
	id: AllowedReceivedPaymentSortFields;
	desc: boolean;
};

export async function getReceivedPayments(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: ReceivedPaymentSortOption[] | undefined = undefined,
	filters: ReceivedPaymentFilters = {},
) {
	const offset = (page - 1) * limit;

	const whereConditions = [
		eq(receivedAmounts.organizationId, userOrganizationId),
	];

	// --- Dynamic Filtering ---
	if (filters.description) {
		whereConditions.push(
			ilike(receivedAmounts.description, `%${filters.description}%`),
		);
	}
	if (filters.bookingId) {
		const bookingIds = filters.bookingId.split(",").map(Number).filter(Boolean);
		if (bookingIds.length > 0) {
			whereConditions.push(inArray(receivedAmounts.bookingId, bookingIds));
		}
	}
	if (filters.invoiceId) {
		const invoiceIds = filters.invoiceId.split(",").map(Number).filter(Boolean);
		if (invoiceIds.length > 0) {
			whereConditions.push(inArray(receivedAmounts.invoiceId, invoiceIds));
		}
	}
	if (filters.paidOn) {
		const dates = filters.paidOn
			.split(",")
			.map((d) => d.trim())
			.filter(Boolean);
		if (dates.length === 2) {
			whereConditions.push(
				gte(
					receivedAmounts.paidOn,
					new Date(dates[0]).toISOString().slice(0, 10),
				),
			);
			whereConditions.push(
				lte(
					receivedAmounts.paidOn,
					new Date(dates[1]).toISOString().slice(0, 10),
				),
			);
		}
	}

	// --- Dynamic Sorting ---
	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc
						? desc(receivedAmounts[item.id])
						: asc(receivedAmounts[item.id]),
				)
			: [desc(receivedAmounts.paidOn)];

	// --- Main Data Query ---
	const data = await db.query.receivedAmounts.findMany({
		where: and(...whereConditions),
		with: {
			booking: { columns: { name: true } },
			invoice: { columns: { invoiceNumber: true } },
		},
		orderBy,
		limit,
		offset,
	});

	// --- Total Count Query ---
	const totalResult = await db
		.select({ count: count() })
		.from(receivedAmounts)
		.where(and(...whereConditions));
	const total = totalResult[0]?.count ?? 0;

	return {
		data,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
	};
}

// ====================================================================
// Function for Payment Schedules
// ====================================================================

export type ScheduledPaymentFilters = {
	description?: string;
	dueDate?: string; // For date range filtering
	bookingId?: string;
};

type AllowedScheduledPaymentSortFields = "amount" | "dueDate" | "createdAt";
type ScheduledPaymentSortOption = {
	id: AllowedScheduledPaymentSortFields;
	desc: boolean;
};

export async function getPaymentSchedules(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: ScheduledPaymentSortOption[] | undefined = undefined,
	filters: ScheduledPaymentFilters = {},
) {
	const offset = (page - 1) * limit;

	const whereConditions = [
		eq(paymentSchedules.organizationId, userOrganizationId),
	];

	// --- Dynamic Filtering ---
	if (filters.description) {
		whereConditions.push(
			ilike(paymentSchedules.description, `%${filters.description}%`),
		);
	}
	if (filters.bookingId) {
		const bookingIds = filters.bookingId.split(",").map(Number).filter(Boolean);
		if (bookingIds.length > 0) {
			whereConditions.push(inArray(paymentSchedules.bookingId, bookingIds));
		}
	}
	if (filters.dueDate) {
		const dates = filters.dueDate
			.split(",")
			.map((d) => d.trim())
			.filter(Boolean);
		if (dates.length === 2) {
			whereConditions.push(
				gte(
					paymentSchedules.dueDate,
					new Date(dates[0]).toISOString().slice(0, 10),
				),
			);
			whereConditions.push(
				lte(
					paymentSchedules.dueDate,
					new Date(dates[1]).toISOString().slice(0, 10),
				),
			);
		}
	}

	// --- Dynamic Sorting ---
	const orderBy =
		sortOptions && sortOptions.length > 0
			? sortOptions.map((item) =>
					item.desc
						? desc(paymentSchedules[item.id])
						: asc(paymentSchedules[item.id]),
				)
			: [desc(paymentSchedules.dueDate)];

	// --- Main Data Query ---
	const data = await db.query.paymentSchedules.findMany({
		where: and(...whereConditions),
		with: {
			booking: { columns: { name: true } },
		},
		orderBy,
		limit,
		offset,
	});

	// --- Total Count Query ---
	const totalResult = await db
		.select({ count: count() })
		.from(paymentSchedules)
		.where(and(...whereConditions));
	const total = totalResult[0]?.count ?? 0;

	return {
		data,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
	};
}
