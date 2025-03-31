CREATE TYPE "public"."config_type" AS ENUM('task_status', 'task_priority', 'relation_type', 'package_type', 'booking_type', 'shoot_time', 'bill_to', 'expense_category');--> statement-breakpoint
CREATE TABLE "configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "config_type" NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"organization_id" text,
	"is_system" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;