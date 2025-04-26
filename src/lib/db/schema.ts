import { relations } from "drizzle-orm";
import {
	varchar,
	pgTable,
	text,
	integer,
	timestamp,
	boolean,
	serial,
	jsonb,
	decimal,
	date,
	time,
	pgEnum,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	username: text("username").unique(),
	displayUsername: text("display_username"),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
	activeOrganizationId: text("active_organization_id"),
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const organizations = pgTable("organizations", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
});

export const members = pgTable("members", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const invitations = pgTable("invitations", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: text("inviter_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const activityLogs = pgTable("activity_logs", {
	id: serial("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id),
	userId: text("user_id").references(() => users.id),
	action: text("action").notNull(),
	timestamp: timestamp("timestamp").notNull().defaultNow(),
	ipAddress: varchar("ip_address", { length: 45 }),
});

export enum BookingType {
	WEDDING = "Wedding",
	COMMERCIAL = "Commercial",
}

export enum PackageType {
	BASIC_SINGLE = "Basic - Single",
	BASIC_DOUBLE = "Basic - Double",
	PREMIUM_SINGLE = "Premium - Single",
	PREMIUM_DOUBLE = "Premium - Double",
	ELITE_SINGLE = "Elite - Single",
	ELITE_DOUBLE = "Elite - Double",
	CUSTOM = "Custom",
}

export enum ShootTime {
	MORNING = "Morning",
	NOON = "Noon",
	AFTERNOON = "Afternoon",
	EVENING = "Evening",
	NIGHT = "Night",
}

export enum BillTo {
	STUDIO = "Studio",
	CLIENT = "Client",
}

export enum ExpenseCategory {
	FOOD = "Food",
	DRINK = "Drink",
	TRAVEL = "Travel",
	EQUIPMENT = "Equipment",
	ACCOMMODATION = "Accommodation",
	CUSTOM = "Custom",
}

// export enum TaskPriority {
// 	// CRITICAL = "Critical",
// 	HIGH = "High",
// 	MEDIUM = "Medium",
// 	LOW = "Low",
// }
// export enum TaskStatus {
// 	INPROGRESS = "In-Progress",
// 	DONE = "Done",
// 	TODO = "Todo",
// 	CANCELED = "Canceled",
// 	BACKLOG = "Backlog",
// }

export const RelationType = pgEnum("relation_type", [
	"bride",
	"groom",
	"family",
	"",
]);

export const ConfigType = pgEnum("config_type", [
	"task_status",
	"task_priority",
	"relation_type",
	"package_type",
	"booking_type",
	"shoot_time",
	"bill_to",
	"expense_category",
]);

export const configurations = pgTable("configurations", {
	id: serial("id").primaryKey(),
	type: ConfigType("type").notNull(),
	key: text("key").notNull(),
	value: text("value").notNull(),
	organizationId: text("organization_id").references(() => organizations.id, {
		onDelete: "cascade",
	}),
	isSystem: boolean("is_system").default(false),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const relationsTable = pgTable("relations", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
});

export const clients = pgTable("clients", {
	id: serial("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	brideName: text("bride_name").notNull(),
	groomName: text("groom_name").notNull(),
	relation: RelationType("relation").notNull(),
	phoneNumber: text("phone_number").notNull(),
	email: text("email"),
	address: text("address").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
	id: serial("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	bookingType: text("booking_type", {
		enum: Object.values(BookingType) as [string, ...string[]],
	}).notNull(),
	packageType: text("package_type", {
		enum: Object.values(PackageType) as [string, ...string[]],
	}).notNull(),
	packageCost: decimal("package_cost", { precision: 10, scale: 2 }).notNull(),
	clientId: integer("client_id")
		.notNull()
		.references(() => clients.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
	note: text("note"),
});

export const shoots = pgTable("shoots", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	date: date("date").notNull(),
	time: text("time").notNull(), // Morning, Day, Night
	reportingTime: time("reporting_time"), // Exact reporting time
	duration: text("duration"),
	location: jsonb("location"), // e.g., "4 hours"
	notes: text("notes"),
	additionalServices: jsonb("additional_services"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliverables = pgTable("deliverables", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	isPackageIncluded: boolean("is_package_included").notNull().default(false),
	cost: decimal("cost", { precision: 10, scale: 2 }), // Nullable if part of package
	quantity: integer("quantity").notNull(),
	dueDate: date("due_date"),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const receivedAmounts = pgTable("received_amounts", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	paidOn: date("paid_on"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentSchedules = pgTable("payment_schedules", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	dueDate: date("due_date"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	billTo: text("bill_to", {
		enum: Object.values(BillTo) as [string, ...string[]],
	}).notNull(),
	category: text("category", {
		enum: Object.values(ExpenseCategory) as [string, ...string[]],
	}).notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	date: date("date").notNull(),
	spentBy: text("spent_by").notNull(), // "team" or user name
	spentByUserId: text("spent_by_user_id").references(() => users.id), // Nullable, for individual users
	description: text("description"),
	fileUrls: jsonb("file_urls"), // Array of file URLs
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const crews = pgTable("crews", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	userId: text("user_id").references(() => users.id), // Nullable, for team members
	freelancerName: text("freelancer_name"), // Nullable, for freelancers
	role: text("role").notNull(),
	isLead: boolean("is_lead").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	deliverableId: integer("deliverable_id").references(() => deliverables.id, {
		onDelete: "cascade",
	}),
	status: text("status").notNull().default("Todo"),
	description: text("description").notNull(),
	assignedTo: text("assigned_to").references(() => users.id),
	priority: text("priority").notNull(),
	dueDate: date("due_date"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const packageConfigs = pgTable("package_configs", {
	id: serial("id").primaryKey(),
	packageType: text("package_type", {
		enum: Object.values(PackageType) as [string, ...string[]],
	})
		.notNull()
		.unique(),
	defaultCost: decimal("default_cost", { precision: 10, scale: 2 }).notNull(),
	defaultDeliverables: jsonb("default_deliverables").notNull(), // Array of deliverables, e.g., [{ title: "Raw Photos", quantity: 100, is_package_included: true }]
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [clients.organizationId],
		references: [organizations.id],
	}),
	bookings: many(bookings),
}));
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [bookings.organizationId],
		references: [organizations.id],
	}),
	clients: one(clients, {
		fields: [bookings.clientId],
		references: [clients.id],
	}),
	shoots: many(shoots),
	deliverables: many(deliverables),
	receivedAmounts: many(receivedAmounts),
	paymentSchedules: many(paymentSchedules),
	expenses: many(expenses),
	crews: many(crews),
	tasks: many(tasks),
}));

export const shootsRelations = relations(shoots, ({ one }) => ({
	booking: one(bookings, {
		fields: [shoots.bookingId],
		references: [bookings.id],
	}),
	organization: one(organizations, {
		fields: [shoots.organizationId],
		references: [organizations.id],
	}),
}));

export const deliverablesRelations = relations(
	deliverables,
	({ one, many }) => ({
		booking: one(bookings, {
			fields: [deliverables.bookingId],
			references: [bookings.id],
		}),
		organization: one(organizations, {
			fields: [deliverables.organizationId],
			references: [organizations.id],
		}),
		tasks: many(tasks),
	}),
);

export const receivedAmountsRelations = relations(
	receivedAmounts,
	({ one }) => ({
		booking: one(bookings, {
			fields: [receivedAmounts.bookingId],
			references: [bookings.id],
		}),
	}),
);

export const paymentSchedulesRelations = relations(
	paymentSchedules,
	({ one }) => ({
		booking: one(bookings, {
			fields: [paymentSchedules.bookingId],
			references: [bookings.id],
		}),
	}),
);

export const expensesRelations = relations(expenses, ({ one }) => ({
	booking: one(bookings, {
		fields: [expenses.bookingId],
		references: [bookings.id],
	}),
	organization: one(organizations, {
		fields: [expenses.organizationId],
		references: [organizations.id],
	}),
	spentByUser: one(users, {
		fields: [expenses.spentByUserId],
		references: [users.id],
	}),
}));

export const crewRelations = relations(crews, ({ one }) => ({
	booking: one(bookings, {
		fields: [crews.bookingId],
		references: [bookings.id],
	}),
	user: one(users, {
		fields: [crews.userId],
		references: [users.id],
	}),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	booking: one(bookings, {
		fields: [tasks.bookingId],
		references: [bookings.id],
	}),
	organization: one(organizations, {
		fields: [tasks.organizationId],
		references: [organizations.id],
	}),
	deliverable: one(deliverables, {
		fields: [tasks.deliverableId],
		references: [deliverables.id],
	}),
	assignedToUser: one(users, {
		fields: [tasks.assignedTo],
		references: [users.id],
	}),
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
	members: many(members),
	activityLogs: many(activityLogs),
	invitations: many(invitations),
	clients: many(clients),
	bookings: many(bookings),
	deliverables: many(deliverables),
	expenses: many(expenses),
	shoots: many(shoots),
	tasks: many(tasks),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
	team: one(organizations, {
		fields: [invitations.organizationId],
		references: [organizations.id],
	}),
	invitedBy: one(users, {
		fields: [invitations.inviterId],
		references: [users.id],
	}),
}));

export const teamMembersRelations = relations(members, ({ one }) => ({
	user: one(users, {
		fields: [members.userId],
		references: [users.id],
	}),
	team: one(organizations, {
		fields: [members.organizationId],
		references: [organizations.id],
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	team: one(organizations, {
		fields: [activityLogs.organizationId],
		references: [organizations.id],
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id],
	}),
}));

export const configurationsRelations = relations(configurations, ({ one }) => ({
	organization: one(organizations, {
		fields: [configurations.organizationId],
		references: [organizations.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Organization & {
	teamMembers: (Member & {
		user: Pick<User, "id" | "name" | "email">;
	})[];
};

export type Relation = typeof relationsTable.$inferSelect;
export type NewRelation = typeof relationsTable.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Shoot = typeof shoots.$inferSelect;
export type NewShoot = typeof shoots.$inferInsert;
export type Deliverable = typeof deliverables.$inferSelect;
export type NewDeliverable = typeof deliverables.$inferInsert;
export type ReceivedAmount = typeof receivedAmounts.$inferSelect;
export type NewReceivedAmount = typeof receivedAmounts.$inferInsert;
export type PaymentSchedule = typeof paymentSchedules.$inferSelect;
export type NewPaymentSchedule = typeof paymentSchedules.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Crew = typeof crews.$inferSelect;
export type NewCrew = typeof crews.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type PackageConfig = typeof packageConfigs.$inferSelect;
export type NewPackageConfig = typeof packageConfigs.$inferInsert;

export type Configuration = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;

export enum ActivityType {
	SIGN_UP = "SIGN_UP",
	SIGN_IN = "SIGN_IN",
	SIGN_OUT = "SIGN_OUT",
	UPDATE_PASSWORD = "UPDATE_PASSWORD",
	DELETE_ACCOUNT = "DELETE_ACCOUNT",
	UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
	CREATE_TEAM = "CREATE_TEAM",
	REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
	INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
	ACCEPT_INVITATION = "ACCEPT_INVITATION",
	CREATE_BOOKING = "CREATE_BOOKING",
	UPDATE_BOOKING = "UPDATE_BOOKING",
	DELETE_BOOKING = "DELETE_BOOKING",
	CREATE_CLIENT = "CREATE_CLIENT",
	UPDATE_CLIENT = "UPDATE_CLIENT",
	DELETE_CLIENT = "DELETE_CLIENT",
	CREATE_DELIVERABLE = "CREATE_DELIVERABLE",
	UPDATE_DELIVERABLE = "UPDATE_DELIVERABLE",
	DELETE_DELIVERABLE = "DELETE_DELIVERABLE",
	CREATE_EXPENSE = "CREATE_EXPENSE",
	UPDATE_EXPENSE = "UPDATE_EXPENSE",
	DELETE_EXPENSE = "DELETE_EXPENSE",
	CREATE_PAYMENT_SCHEDULE = "CREATE_PAYMENT_SCHEDULE",
	UPDATE_PAYMENT_SCHEDULE = "UPDATE_PAYMENT_SCHEDULE",
	DELETE_PAYMENT_SCHEDULE = "DELETE_PAYMENT_SCHEDULE",
	CREATE_RECEIVED_AMOUNT = "CREATE_RECEIVED_AMOUNT",
	UPDATE_RECEIVED_AMOUNT = "UPDATE_RECEIVED_AMOUNT",
	DELETE_RECEIVED_AMOUNT = "DELETE_RECEIVED_AMOUNT",
	CREATE_SHOOT = "CREATE_SHOOT",
	UPDATE_SHOOT = "UPDATE_SHOOT",
	DELETE_SHOOT = "DELETE_SHOOT",
	CREATE_TASK = "CREATE_TASK",
	UPDATE_TASK = "UPDATE_TASK",
	DELETE_TASK = "DELETE_TASK",
	CREATE_CREW = "CREATE_CREW",
	UPDATE_CREW = "UPDATE_CREW",
	DELETE_CREW = "DELETE_CREW",
}

export type BookingDetail = Booking & {
	clients: Client;
	shoots: Shoot[];
	deliverables: Deliverable[];
	receivedAmounts: ReceivedAmount[];
	paymentSchedules: PaymentSchedule[];
	expenses: Expense[];
	crews: Crew[];
	tasks: Task[];
};
