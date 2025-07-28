ALTER TABLE "deliverables" ALTER COLUMN "due_date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "start_date" text;