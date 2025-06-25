import { relations, sql } from "drizzle-orm";
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
	uniqueIndex,
	check,
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

export const ConfigType = pgEnum("config_type", [
	"task_status",
	"task_priority",
	"relation_type",
	"package_type",
	"booking_type",
	"shoot_time",
	"bill_to",
	"expense_category",
	"deliverable_status",
	"deliverable_priority",
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
	phoneNumber: text("phone_number"),
	email: text("email"),
	address: text("address"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingPhaseEnum = pgEnum("booking_phase", [
	"new",
	"preparation",
	"shooting",
	"delivery",
	"completed",
	"cancelled",
]);

export const bookings = pgTable("bookings", {
	id: serial("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	bookingType: text("booking_type").notNull(),
	packageType: text("package_type").notNull(),
	packageCost: decimal("package_cost", { precision: 10, scale: 2 }).notNull(),
	status: bookingPhaseEnum("status").notNull().default("new"),
	note: text("note"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const bookingParticipants = pgTable(
	"booking_participants",
	{
		id: serial("id").primaryKey(),
		bookingId: integer("booking_id")
			.notNull()
			.references(() => bookings.id, { onDelete: "cascade" }),
		clientId: integer("client_id")
			.notNull()
			.references(() => clients.id, { onDelete: "cascade" }),
		role: text("role").notNull(), // e.g. "bride", "groom", "company", "contact"
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(t) => [
		uniqueIndex("booking_participants_uniq_idx").on(
			t.bookingId,
			t.clientId,
			t.role,
		),
	],
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [clients.organizationId],
		references: [organizations.id],
	}),
	bookings: many(bookingParticipants),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [bookings.organizationId],
		references: [organizations.id],
	}),
	participants: many(bookingParticipants),
	shoots: many(shoots),
	deliverables: many(deliverables),
	receivedAmounts: many(receivedAmounts),
	paymentSchedules: many(paymentSchedules),
	expenses: many(expenses),
	tasks: many(tasks),
}));

export const bookingParticipantsRelations = relations(
	bookingParticipants,
	({ one }) => ({
		booking: one(bookings, {
			fields: [bookingParticipants.bookingId],
			references: [bookings.id],
		}),
		client: one(clients, {
			fields: [bookingParticipants.clientId],
			references: [clients.id],
		}),
	}),
);

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
	time: text("time").notNull(),
	reportingTime: time("reporting_time"),
	duration: text("duration"),
	location: jsonb("location"),
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
	cost: decimal("cost", { precision: 10, scale: 2 }),
	quantity: integer("quantity").notNull(),
	dueDate: date("due_date"),
	notes: text("notes"),
	status: text("status").notNull().default("pending"),
	priority: text("priority").notNull().default("medium"),
	fileUrl: text("file_url"),
	clientFeedback: text("client_feedback"),
	revisionCount: integer("revision_count").notNull().default(0),
	deliveredAt: timestamp("delivered_at"),
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

export const BillTo = pgEnum("bill_to", ["Studio", "Client"]);

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	billTo: BillTo("bill_to").notNull(),
	category: text("category").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	date: date("date").notNull(),
	description: text("description"),
	fileUrls: jsonb("file_urls"), // Array of file URLs
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const expensesAssignments = pgTable(
	"expenses_assignments",
	{
		id: serial("id").primaryKey(),
		expenseId: integer("expense_id")
			.notNull()
			.references(() => expenses.id, { onDelete: "cascade" }),
		crewId: integer("crew_id")
			.notNull()
			.references(() => crews.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("expenses_assignments_uniq_idx").on(
			t.expenseId,
			t.crewId,
			t.organizationId,
		),
	],
);

export const expensesRelations = relations(expenses, ({ one, many }) => ({
	booking: one(bookings, {
		fields: [expenses.bookingId],
		references: [bookings.id],
	}),
	organization: one(organizations, {
		fields: [expenses.organizationId],
		references: [organizations.id],
	}),
	expensesAssignments: many(expensesAssignments),
}));

export const expensesAssignmentsRelations = relations(
	expensesAssignments,
	({ one }) => ({
		expense: one(expenses, {
			fields: [expensesAssignments.expenseId],
			references: [expenses.id],
		}),
		crew: one(crews, {
			fields: [expensesAssignments.crewId],
			references: [crews.id],
		}),
		organization: one(organizations, {
			fields: [expensesAssignments.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const crews = pgTable(
	"crews",
	{
		id: serial("id").primaryKey(),
		memberId: text("member_id").references(() => members.id, {
			onDelete: "cascade",
		}),
		name: text("name"),
		email: text("email"),
		phoneNumber: text("phone_number"),
		equipment: text("equipment").array(),
		role: text("role"),
		specialization: text("specialization"),
		status: text("status").notNull().default("available"),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(t) => [
		check(
			"name_or_member_id",
			sql`(member_id IS NOT NULL OR name IS NOT NULL)`,
		),
	],
);

export const crewRelations = relations(crews, ({ one, many }) => ({
	member: one(members, {
		fields: [crews.memberId],
		references: [members.id],
	}),
	organization: one(organizations, {
		fields: [crews.organizationId],
		references: [organizations.id],
	}),
	shootsAssignments: many(shootsAssignments),
	tasksAssignments: many(tasksAssignments),
	deliverablesAssignments: many(deliverablesAssignments),
	expensesAssignments: many(expensesAssignments),
}));

export const shootsAssignments = pgTable(
	"shoots_assignments",
	{
		id: serial("id").primaryKey(),
		shootId: integer("shoot_id")
			.notNull()
			.references(() => shoots.id, { onDelete: "cascade" }),
		crewId: integer("crew_id")
			.notNull()
			.references(() => crews.id, { onDelete: "cascade" }),
		isLead: boolean("is_lead").notNull().default(false),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").defaultNow(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(t) => [
		uniqueIndex("shoots_assignments_unique_idx").on(
			t.shootId,
			t.crewId,
			t.organizationId,
		),
	],
);

export const deliverablesAssignments = pgTable(
	"deliverables_assignments",
	{
		id: serial("id").primaryKey(),
		deliverableId: integer("deliverable_id")
			.notNull()
			.references(() => deliverables.id, { onDelete: "cascade" }),
		crewId: integer("crew_id")
			.notNull()
			.references(() => crews.id, { onDelete: "cascade" }),
		isLead: boolean("is_lead").notNull().default(false),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").defaultNow(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(t) => [
		uniqueIndex("deliverables_assignments_unique_idx").on(
			t.deliverableId,
			t.crewId,
			t.organizationId,
		),
	],
);

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
		deliverablesAssignments: many(deliverablesAssignments),
	}),
);

export const deliverablesAssignmentsRelations = relations(
	deliverablesAssignments,
	({ one }) => ({
		deliverable: one(deliverables, {
			fields: [deliverablesAssignments.deliverableId],
			references: [deliverables.id],
		}),
		crew: one(crews, {
			fields: [deliverablesAssignments.crewId],
			references: [crews.id],
		}),
		organization: one(organizations, {
			fields: [deliverablesAssignments.organizationId],
			references: [organizations.id],
		}),
	}),
);

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
	status: text("status").notNull().default("todo"),
	description: text("description").notNull(),
	priority: text("priority").notNull().default("medium"),
	dueDate: date("due_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksAssignments = pgTable(
	"tasks_assignments",
	{
		id: serial("id").primaryKey(),
		taskId: integer("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		crewId: integer("crew_id")
			.notNull()
			.references(() => crews.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [
		uniqueIndex("tasks_assignments_unique_idx").on(
			t.taskId,
			t.crewId,
			t.organizationId,
		),
	],
);
export const tasksRelations = relations(tasks, ({ one, many }) => ({
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
	tasksAssignments: many(tasksAssignments),
}));

export const tasksAssignmentsRelations = relations(
	tasksAssignments,
	({ one }) => ({
		task: one(tasks, {
			fields: [tasksAssignments.taskId],
			references: [tasks.id],
		}),
		crew: one(crews, {
			fields: [tasksAssignments.crewId],
			references: [crews.id],
		}),
		organization: one(organizations, {
			fields: [tasksAssignments.organizationId],
			references: [organizations.id],
		}),
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

export const shootsRelations = relations(shoots, ({ one, many }) => ({
	booking: one(bookings, {
		fields: [shoots.bookingId],
		references: [bookings.id],
	}),
	organization: one(organizations, {
		fields: [shoots.organizationId],
		references: [organizations.id],
	}),
	shootsAssignments: many(shootsAssignments),
}));

export const shootsAssignmentsRelations = relations(
	shootsAssignments,
	({ one }) => ({
		shoot: one(shoots, {
			fields: [shootsAssignments.shootId],
			references: [shoots.id],
		}),
		crew: one(crews, {
			fields: [shootsAssignments.crewId],
			references: [crews.id],
		}),
		organization: one(organizations, {
			fields: [shootsAssignments.organizationId],
			references: [organizations.id],
		}),
	}),
);

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
	shootsAssignments: many(shootsAssignments),
	tasksAssignments: many(tasksAssignments),
	deliverablesAssignments: many(deliverablesAssignments),
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

export type Configuration = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;

export type ShootsAssignment = typeof shootsAssignments.$inferSelect;
export type NewShootsAssignment = typeof shootsAssignments.$inferInsert;
export type TasksAssignment = typeof tasksAssignments.$inferSelect;
export type NewTasksAssignment = typeof tasksAssignments.$inferInsert;
export type DeliverablesAssignment =
	typeof deliverablesAssignments.$inferSelect;
export type NewDeliverablesAssignment =
	typeof deliverablesAssignments.$inferInsert;

export type ExpensesAssignment = typeof expensesAssignments.$inferSelect;
export type NewExpensesAssignment = typeof expensesAssignments.$inferInsert;

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
