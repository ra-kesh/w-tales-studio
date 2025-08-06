import { relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	decimal,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	time,
	timestamp,
	uniqueIndex,
	varchar,
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

export const clients = pgTable(
	"clients",
	{
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
	},
	(table) => [index("client_organization_idx").on(table.organizationId)],
);

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
	status: bookingPhaseEnum("status")
		.notNull()
		.default(bookingPhaseEnum.enumValues[0]),
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
	date: text("date"),
	time: text("time"),
	reportingTime: time("reporting_time"),
	duration: text("duration"),
	location: jsonb("location"),
	notes: text("notes"),
	additionalDetails: jsonb("additional_details"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const receivedAmounts = pgTable("received_amounts", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	invoiceId: integer("invoice_id").references(() => invoices.id, {
		onDelete: "set null",
	}),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	paidOn: date("paid_on"),
	paymentScheduleId: integer("payment_schedule_id").references(
		() => paymentSchedules.id,
		{ onDelete: "set null" },
	),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentSchedules = pgTable("payment_schedules", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	dueDate: date("due_date"),
	status: text("status").notNull().default("pending"),
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
	feedbackSummary: many(crewFeedbackSummary),
}));

export const assignmentActivities = pgTable("assignment_activities", {
	id: serial("id").primaryKey(),
	assignmentType: text("assignment_type").notNull(),
	assignmentId: integer("assignment_id").notNull(),
	actionType: text("action_type").notNull(),
	payload: jsonb("payload"),
	performedBy: integer("performed_by")
		.notNull()
		.references(() => crews.id, { onDelete: "cascade" }),
	performedAt: timestamp("performed_at").defaultNow(),
});

export const assignmentActivitiesRelations = relations(
	assignmentActivities,
	({ one }) => ({
		performedByUser: one(crews, {
			fields: [assignmentActivities.performedBy],
			references: [crews.id],
		}),
	}),
);

export const crewFeedbackSummary = pgTable("crew_feedback_summary", {
	id: serial("id").primaryKey(),
	crewId: integer("crew_id")
		.notNull()
		.references(() => crews.id, { onDelete: "cascade" }),
	category: text("category").notNull(),
	totalFeedbackCount: integer("total_feedback_count").default(0),
	positiveCount: integer("positive_count").default(0),
	constructiveCount: integer("constructive_count").default(0),
	criticalCount: integer("critical_count").default(0),
	lastFeedbackDate: timestamp("last_feedback_date"),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const crewFeedbackSummaryRelations = relations(
	crewFeedbackSummary,
	({ one }) => ({
		crew: one(crews, {
			fields: [crewFeedbackSummary.crewId],
			references: [crews.id],
		}),
	}),
);

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	crewId: integer("crew_id")
		.notNull()
		.references(() => crews.id, { onDelete: "cascade" }),
	notificationType: text("notification_type").notNull(),
	assignmentType: text("assignment_type").notNull(),
	assignmentId: integer("assignment_id").notNull(),
	message: text("message").notNull(),
	readAt: timestamp("read_at"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(crews, {
		fields: [notifications.crewId],
		references: [crews.id],
	}),
}));

export const assignmentSubmissions = pgTable("assignment_submissions", {
	id: serial("id").primaryKey(),
	assignmentType: text("assignment_type").notNull(),
	assignmentId: integer("assignment_id").notNull(),
	version: integer("version").notNull().default(1),
	status: text("status").notNull(),
	comment: text("comment"),
	powLinks: jsonb("pow_links"),
	submittedBy: integer("submitted_by")
		.notNull()
		.references(() => crews.id, { onDelete: "set null" }),
	submittedAt: timestamp("submitted_at").defaultNow(),
	reviewedBy: integer("reviewed_by").references(() => crews.id, {
		onDelete: "set null",
	}),
	reviewComment: text("review_comment"),
	reviewedAt: timestamp("reviewed_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	currentReviewer: integer("current_reviewer").references(() => crews.id, {
		onDelete: "set null",
	}),
});

export const assignmentSubmissionsRelations = relations(
	assignmentSubmissions,
	({ one, many }) => ({
		task: one(tasks, {
			fields: [assignmentSubmissions.assignmentId],
			references: [tasks.id],
			relationName: "taskSubmissions",
		}),
		deliverable: one(deliverables, {
			fields: [assignmentSubmissions.assignmentId],
			references: [deliverables.id],
			relationName: "deliverableSubmissions",
		}),

		submittedBy: one(crews, {
			fields: [assignmentSubmissions.submittedBy],
			references: [crews.id],
			relationName: "submittedBy",
		}),
		reviewedBy: one(crews, {
			fields: [assignmentSubmissions.reviewedBy],
			references: [crews.id],
			relationName: "reviewedBy",
		}),
		currentReviewer: one(crews, {
			fields: [assignmentSubmissions.currentReviewer],
			references: [crews.id],
			relationName: "currentReviewer",
		}),
		files: many(submissionFiles),
		feedback: many(submissionFeedback),
	}),
);

export const submissionFiles = pgTable("submission_files", {
	id: serial("id").primaryKey(),
	submissionId: integer("submission_id")
		.notNull()
		.references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type"),
	uploadedBy: integer("uploaded_by")
		.notNull()
		.references(() => crews.id, { onDelete: "set null" }),
	uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const submissionFilesRelations = relations(
	submissionFiles,
	({ one }) => ({
		submission: one(assignmentSubmissions, {
			fields: [submissionFiles.submissionId],
			references: [assignmentSubmissions.id],
		}),
		uploadedByUser: one(crews, {
			fields: [submissionFiles.uploadedBy],
			references: [crews.id],
		}),
	}),
);

export const submissionFeedback = pgTable("submission_feedback", {
	id: serial("id").primaryKey(),
	submissionId: integer("submission_id")
		.notNull()
		.references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
	feedbackType: text("feedback_type").notNull(),
	category: text("category").notNull(),
	feedbackText: text("feedback_text").notNull(),
	isPrivate: boolean("is_private").default(false),
	givenBy: integer("given_by")
		.notNull()
		.references(() => crews.id, { onDelete: "set null" }),
	givenAt: timestamp("given_at").defaultNow(),
});

export const submissionFeedbackRelations = relations(
	submissionFeedback,
	({ one }) => ({
		submission: one(assignmentSubmissions, {
			fields: [submissionFeedback.submissionId],
			references: [assignmentSubmissions.id],
		}),
		givenByUser: one(crews, {
			fields: [submissionFeedback.givenBy],
			references: [crews.id],
		}),
	}),
);

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
	dueDate: text("due_date"),
	notes: text("notes"),
	status: text("status").notNull().default("pending"),
	priority: text("priority").notNull().default("medium"),
	fileUrl: text("file_url"),
	clientFeedback: text("client_feedback"),
	revisionCount: integer("revision_count").notNull().default(0),
	deliveredAt: timestamp("delivered_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	workflowStatus: text("workflow_status"),

	approvedSubmissionId: integer("approved_submission_id"),
	approvedAt: timestamp("approved_at"),

	lastStatusUpdateBy: integer("last_status_update_by").references(
		() => crews.id,
		{ onDelete: "set null" },
	),
	lastStatusUpdatedAt: timestamp("last_status_update_at"),
});

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
		approvedSubmission: one(assignmentSubmissions, {
			fields: [deliverables.approvedSubmissionId],
			references: [assignmentSubmissions.id],
		}),
		submissions: many(assignmentSubmissions, {
			relationName: "deliverableSubmissions",
		}),

		lastStatusUpdateByUser: one(crews, {
			fields: [deliverables.lastStatusUpdateBy],
			references: [crews.id],
		}),
	}),
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
			.references(() => crews.id, { onDelete: "set null" }),
		isLead: boolean("is_lead").notNull().default(false),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").defaultNow(),
		assignedBy: integer("assigned_by")
			// .notNull()
			.references(() => crews.id, { onDelete: "set null" }),
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
		assignedBy: one(crews, {
			fields: [deliverablesAssignments.assignedBy],
			references: [crews.id],
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
	startDate: text("start_date"),
	dueDate: text("due_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	workflowStatus: text("workflow_status"),

	approvedSubmissionId: integer("approved_submission_id").references(
		() => assignmentSubmissions.id,
		{ onDelete: "set null" },
	),

	approvedAt: timestamp("approved_at"),

	lastStatusUpdateBy: integer("last_status_update_by").references(
		() => crews.id,
		{ onDelete: "set null" },
	),

	lastStatusUpdatedAt: timestamp("last_status_update_at"),
});

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
	approvedSubmission: one(assignmentSubmissions, {
		fields: [tasks.approvedSubmissionId],
		references: [assignmentSubmissions.id],
	}),

	submissions: many(assignmentSubmissions),

	lastStatusUpdateByUser: one(crews, {
		fields: [tasks.lastStatusUpdateBy],
		references: [crews.id],
	}),
}));

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
		assignedBy: integer("assigned_by")
			// .notNull()
			.references(() => crews.id, { onDelete: "set null" }),
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
		assignedBy: one(crews, {
			fields: [tasksAssignments.assignedBy],
			references: [crews.id],
		}),
	}),
);

export const attachments = pgTable(
	"attachments",
	{
		id: serial("id").primaryKey(),

		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),

		resourceType: text("resource_type").notNull(), // e.g., "booking", "received_payment", "task"
		resourceId: text("resource_id").notNull(), // use text to support int/uuid across resources

		subType: text("sub_type"), // e.g., "quotation", "payment_proof"

		fileName: text("file_name").notNull(),
		filePath: text("file_path").notNull(), // storage key
		fileSize: integer("file_size"),
		mimeType: text("mime_type"),

		metadata: jsonb("metadata"), // e.g., { amount: "123.00", method: "upi", tags: ["proof"] }

		uploadedBy: text("uploaded_by").references(() => users.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),

		isDeleted: boolean("is_deleted").notNull().default(false),
		deletedAt: timestamp("deleted_at"),
	},
	(t) => [
		index("attachments_resource_idx").on(t.resourceType, t.resourceId),
		index("attachments_org_idx").on(t.organizationId),
		index("attachments_subtype_idx").on(t.subType),
	],
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
	organization: one(organizations, {
		fields: [attachments.organizationId],
		references: [organizations.id],
	}),
	uploadedByUser: one(users, {
		fields: [attachments.uploadedBy],
		references: [users.id],
	}),
}));

export const invoices = pgTable("invoices", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	invoiceNumber: text("invoice_number").notNull().unique(),
	issueDate: date("issue_date").notNull(),
	dueDate: date("due_date").notNull(),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	status: text("status").notNull().default("draft"),
	notes: text("notes"),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
	id: serial("id").primaryKey(),
	invoiceId: integer("invoice_id")
		.notNull()
		.references(() => invoices.id, { onDelete: "cascade" }),
	description: text("description").notNull(),
	quantity: integer("quantity").notNull(),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	totalPrice: decimal("total_price", {
		precision: 10,
		scale: 2,
	}).notNull(),
});

export const receivedAmountsRelations = relations(
	receivedAmounts,
	({ one }) => ({
		booking: one(bookings, {
			fields: [receivedAmounts.bookingId],
			references: [bookings.id],
		}),
		invoice: one(invoices, {
			fields: [receivedAmounts.invoiceId],
			references: [invoices.id],
		}),
		organization: one(organizations, {
			fields: [receivedAmounts.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	booking: one(bookings, {
		fields: [invoices.bookingId],
		references: [bookings.id],
	}),
	lineItems: many(invoiceLineItems),
	receivedAmounts: many(receivedAmounts),
	organization: one(organizations, {
		fields: [invoices.organizationId],
		references: [organizations.id],
	}),
}));

export const invoiceLineItemsRelations = relations(
	invoiceLineItems,
	({ one }) => ({
		invoice: one(invoices, {
			fields: [invoiceLineItems.invoiceId],
			references: [invoices.id],
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
		organization: one(organizations, {
			fields: [paymentSchedules.organizationId],
			references: [organizations.id],
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

// export type Relation = typeof relationsTable.$inferSelect;
// export type NewRelation = typeof relationsTable.$inferInsert;
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
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

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

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

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
