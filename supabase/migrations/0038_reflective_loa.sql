CREATE TABLE "assignment_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_type" text NOT NULL,
	"assignment_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"payload" jsonb,
	"performed_by" integer NOT NULL,
	"performed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_type" text NOT NULL,
	"assignment_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text NOT NULL,
	"comment" text,
	"pow_links" jsonb,
	"submitted_by" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_by" integer,
	"review_comment" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"current_reviewer" integer
);
--> statement-breakpoint
CREATE TABLE "crew_feedback_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"crew_id" integer NOT NULL,
	"category" text NOT NULL,
	"total_feedback_count" integer DEFAULT 0,
	"positive_count" integer DEFAULT 0,
	"constructive_count" integer DEFAULT 0,
	"critical_count" integer DEFAULT 0,
	"last_feedback_date" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"crew_id" integer NOT NULL,
	"notification_type" text NOT NULL,
	"assignment_type" text NOT NULL,
	"assignment_id" integer NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submission_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"feedback_type" text NOT NULL,
	"category" text NOT NULL,
	"feedback_text" text NOT NULL,
	"is_private" boolean DEFAULT false,
	"given_by" integer NOT NULL,
	"given_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submission_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text,
	"uploaded_by" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "deliverables_assignments" DROP CONSTRAINT "deliverables_assignments_crew_id_crews_id_fk";
--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "workflow_status" text;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "approved_submission_id" integer;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "last_status_update_by" integer;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "last_status_update_at" timestamp;--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD COLUMN "assigned_by" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "workflow_status" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "approved_submission_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "last_status_update_by" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "last_status_update_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks_assignments" ADD COLUMN "assigned_by" integer;--> statement-breakpoint
ALTER TABLE "assignment_activities" ADD CONSTRAINT "assignment_activities_performed_by_crews_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_submitted_by_crews_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_reviewed_by_crews_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_review_comment_crews_id_fk" FOREIGN KEY ("review_comment") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_current_reviewer_crews_id_fk" FOREIGN KEY ("current_reviewer") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_feedback_summary" ADD CONSTRAINT "crew_feedback_summary_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_feedback" ADD CONSTRAINT "submission_feedback_submission_id_assignment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_feedback" ADD CONSTRAINT "submission_feedback_given_by_crews_id_fk" FOREIGN KEY ("given_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_assignment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_uploaded_by_crews_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_last_status_update_by_crews_id_fk" FOREIGN KEY ("last_status_update_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD CONSTRAINT "deliverables_assignments_assigned_by_crews_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD CONSTRAINT "deliverables_assignments_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_approved_submission_id_assignment_submissions_id_fk" FOREIGN KEY ("approved_submission_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_last_status_update_by_crews_id_fk" FOREIGN KEY ("last_status_update_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignments" ADD CONSTRAINT "tasks_assignments_assigned_by_crews_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."crews"("id") ON DELETE set null ON UPDATE no action;