import {
	and,
	asc,
	count,
	desc,
	eq,
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
	type Shoot,
	crews,
	invitations,
	shootsAssignments,
	tasksAssignments,
	expensesAssignments,
	deliverablesAssignments,
	taskStatusEnum,
	receivedAmounts,
	paymentSchedules,
} from "./schema";
import { alias } from "drizzle-orm/pg-core";
import type { BookingDetail } from "@/types/booking";
import { addDays, formatISO, startOfDay, subDays } from "date-fns";
import { date } from "drizzle-orm/mysql-core";

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
		orderBy: (deliverables, { desc }) => [
			desc(deliverables.updatedAt),
			desc(deliverables.createdAt),
		],
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

export async function getBookings(
	userOrganizationId: string,
	page = 1,
	limit = 10,
	sortOptions: SortOption[] | undefined = undefined,
	filters: BookingFilters = {},
) {
	const offset = (page - 1) * limit;

	const bookingConfigData = await db
		.select({
			key: bookingConfigs.key,
			value: bookingConfigs.value,
		})
		.from(bookingConfigs)
		.where(
			and(
				eq(bookingConfigs.type, "booking_type"),
				eq(bookingConfigs.organizationId, userOrganizationId),
			),
		);

	const packageConfigData = await db
		.select({
			key: packageConfigs.key,
			value: packageConfigs.value,
		})
		.from(packageConfigs)
		.where(
			and(
				eq(packageConfigs.type, "package_type"),
				eq(packageConfigs.organizationId, userOrganizationId),
			),
		);

	const bookingTypeMap = new Map(
		bookingConfigData.map((config) => [config.key, config.value]),
	);
	const packageTypeMap = new Map(
		packageConfigData.map((config) => [config.key, config.value]),
	);

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
		const dates = filters.createdAt
			.split(",")
			.map((date) => date.trim())
			.filter((date) => date);

		if (dates.length === 1) {
			// Single date
			const date = new Date(dates[0]);
			date.setUTCHours(0, 0, 0, 0);
			whereConditions.push(gte(bookings.createdAt, date));
			// date.setUTCHours(23, 59, 59, 999);
			// whereConditions.push(lte(bookings.createdAt, date));
		} else if (dates.length === 2) {
			// Date range
			const startDate = new Date(dates[0]);
			startDate.setUTCHours(0, 0, 0, 0);
			const endDate = new Date(dates[1]);
			endDate.setUTCHours(23, 59, 59, 999);
			whereConditions.push(gte(bookings.createdAt, startDate));
			whereConditions.push(lte(bookings.createdAt, endDate));
		}
	}

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

	// Fetch bookings with related data
	const bookingsData = await db.query.bookings.findMany({
		where: and(...whereConditions),
		with: {
			clients: true,
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
		},
		orderBy,
		limit,
		offset,
	});

	const formattedBookings = bookingsData.map((booking) => ({
		...booking,
		bookingType: bookingTypeMap.get(booking.bookingType) ?? booking.bookingType,
		packageType: packageTypeMap.get(booking.packageType) ?? booking.packageType,
	}));

	const total = await db.$count(bookings, and(...whereConditions));

	return {
		data: formattedBookings,
		total,
		page,
		pageCount: Math.ceil(total / limit),
		limit,
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
		orderBy: (tasks, { desc }) => [
			desc(tasks.updatedAt),
			desc(tasks.createdAt),
		],
	});

	const transformedData = tasksData.map((task) => ({
		...task,
		crewMembers: task.tasksAssignments.map((assignment) =>
			assignment.crewId.toString(),
		),
	}));

	const total = await db.$count(
		tasks,
		eq(tasks.organizationId, userOrganizationId),
	);

	return {
		data: transformedData,
		total,
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
	const bookingConfigData = await db
		.select({
			key: bookingConfigs.key,
			value: bookingConfigs.value,
		})
		.from(bookingConfigs)
		.where(
			and(
				eq(bookingConfigs.type, "booking_type"),
				eq(bookingConfigs.organizationId, userOrganizationId),
			),
		);

	const packageConfigData = await db
		.select({
			key: packageConfigs.key,
			value: packageConfigs.value,
		})
		.from(packageConfigs)
		.where(
			and(
				eq(packageConfigs.type, "package_type"),
				eq(packageConfigs.organizationId, userOrganizationId),
			),
		);

	const bookingTypeMap = new Map(
		bookingConfigData.map((config) => [config.key, config.value]),
	);
	const packageTypeMap = new Map(
		packageConfigData.map((config) => [config.key, config.value]),
	);

	const booking = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, bookingId),
			eq(bookings.organizationId, userOrganizationId),
		),
		with: {
			clients: true,
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

	// Map bookingType and packageType to human-readable values
	// remove crews from booking details types since crews are not directly assigned to booking
	return {
		...booking,
		bookingTypeValue:
			bookingTypeMap.get(booking.bookingType) ?? booking.bookingType,
		packageTypeValue:
			packageTypeMap.get(booking.packageType) ?? booking.packageType,
	};
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

export type BookingStats = {
	totalBookings: number;
	activeBookings: number;
	totalExpenses: number;
	totalRevenue: number;
};

export async function getBookingsStats(
	userOrganizationId: string,
): Promise<BookingStats> {
	// 1. Total Bookings and Active Bookings
	const bookingsStats = await db
		.select({
			total: sql<number>`COUNT(*)`,
			active: sql<number>`SUM(CASE WHEN ${bookings.status} NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END)`,
		})
		.from(bookings)
		.where(eq(bookings.organizationId, userOrganizationId));

	const totalBookings = bookingsStats[0]?.total || 0;
	const activeBookings = bookingsStats[0]?.active || 0;

	// 2. Total Expenses (across all bookings)
	const expensesStats = await db
		.select({
			totalExpenses: sql<number>`SUM(${expenses.amount})`,
		})
		.from(expenses)
		.innerJoin(bookings, eq(expenses.bookingId, bookings.id))
		.where(eq(bookings.organizationId, userOrganizationId));

	const totalExpenses = expensesStats[0]?.totalExpenses || 0;

	// 3. Total Revenue (across all bookings)
	const revenueStats = await db
		.select({
			totalRevenue: sql<number>`SUM(${bookings.packageCost})`,
		})
		.from(bookings)
		.where(eq(bookings.organizationId, userOrganizationId));

	const totalRevenue = revenueStats[0]?.totalRevenue || 0;

	return {
		totalBookings,
		activeBookings,
		totalExpenses,
		totalRevenue,
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
		// bookingTypeDistribution,
		packageTypeDistribution,
		bookingsOverTime,
	] = await Promise.all([
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
		db
			.select({
				id: bookings.id,
				name: bookings.name,
				clientName: clients.name,
				packageType: bookings.packageType,
				createdAt: bookings.createdAt,
			})
			.from(bookings)
			.leftJoin(clients, eq(bookings.clientId, clients.id))
			.where(
				and(
					eq(bookings.organizationId, organizationId),
					eq(bookings.status, "new"),
				),
			)
			.orderBy(desc(bookings.createdAt))
			.limit(5),
		// db
		// 	.select({
		// 		type: bookings.bookingType,
		// 		count: count(),
		// 		totalRevenue: sum(bookings.packageCost),
		// 	})
		// 	.from(bookings)
		// 	.where(and(...conditions, notInArray(bookings.status, ["cancelled"])))
		// 	.groupBy(bookings.bookingType)
		// 	.orderBy(desc(count())),
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

	// const totalBookingsForRate =
	// 	(bookingCounts[0]?.total || 0) + (bookingCounts[0]?.cancelled || 0);

	// const cancellationRate =
	// 	totalBookingsForRate > 0
	// 		? (bookingCounts[0]?.cancelled || 0) / totalBookingsForRate
	// 		: 0;

	return {
		summary: {
			totalBookings: bookingCounts[0]?.total || 0,
			activeBookings: bookingCounts[0]?.active || 0,
			newBookings: bookingCounts[0]?.new || 0,
		},
		recentNewBookings,
		// bookingTypeDistribution: bookingTypeDistribution.map((item) => ({
		// 	...item,
		// 	totalRevenue: item.totalRevenue || "0.00",
		// })),
		packageTypeDistribution: packageTypeDistribution.map((item) => ({
			...item,
			totalRevenue: item.totalRevenue || "0.00",
		})),
		bookingsOverTime,
	};
}

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

async function getActionItems(organizationId: string) {
	const today = startOfDay(new Date());
	const nextWeek = addDays(today, 7);

	const [overdueTasks, overdueDeliverables, unstaffedShoots] =
		await Promise.all([
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
						notInArray(tasks.status, [taskStatusEnum.enumValues[4]]),
					),
				)
				.limit(5),
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
		// Get a FILTERED LIST of upcoming shoots
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
		// Get the TOTAL UNFILTERED COUNT of all upcoming shoots
		db
			.select({ count: count() })
			.from(shoots)
			.where(
				and(
					eq(shoots.organizationId, organizationId),
					gte(shoots.date, todayISO),
				),
			),

		// Get a FILTERED LIST of upcoming deliverables
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

	const [kpis, bookingAnalytics, actionItems, operations] = await Promise.all([
		// The central interval affects financials
		getFinancialsKpis(organizationId, interval),
		// Booking analytics is NOT affected by the central filter, defaults to "all"
		getBookingAnalytics(organizationId, "all"),
		// Action items are not time-based, so no interval is needed
		getActionItems(organizationId),
		// The central interval affects operations
		getOperationsData(organizationId, operationsInterval),
	]);

	return {
		kpis,
		bookingAnalytics,
		actionItems,
		operations,
	};
}
