import {
	and,
	asc,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	lte,
	or,
	sql,
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
} from "./schema";
import { alias } from "drizzle-orm/pg-core";
import type { BookingDetail } from "@/types/booking";

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
	const [packagesCount, bookingsCount, membersCount] = await Promise.all([
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
		db.$count(members, eq(members.organizationId, userOrganizationId)),
	]);

	return {
		onboarded:
			packagesCount > 0 &&
			bookingsCount > 0 &&
			userOrganizationId !== null &&
			membersCount > 1,
		organizationCreated: !!userOrganizationId,
		packageCreated: packagesCount > 0,
		bookingCreated: bookingsCount > 0,
		membersInvited: membersCount > 1,
	};
}
