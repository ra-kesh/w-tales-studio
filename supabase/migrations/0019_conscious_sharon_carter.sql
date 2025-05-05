CREATE TABLE "deliverables_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"deliverable_id" integer NOT NULL,
	"crew_id" integer NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	"organization_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shoots_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"shoot_id" integer NOT NULL,
	"crew_id" integer NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	"organization_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"crew_id" integer NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	"organization_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD CONSTRAINT "deliverables_assignments_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD CONSTRAINT "deliverables_assignments_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables_assignments" ADD CONSTRAINT "deliverables_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoots_assignments" ADD CONSTRAINT "shoots_assignments_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoots_assignments" ADD CONSTRAINT "shoots_assignments_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoots_assignments" ADD CONSTRAINT "shoots_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignments" ADD CONSTRAINT "tasks_assignments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignments" ADD CONSTRAINT "tasks_assignments_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignments" ADD CONSTRAINT "tasks_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deliverables_assignments_unique_idx" ON "deliverables_assignments" USING btree ("deliverable_id","crew_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shoots_assignments_unique_idx" ON "shoots_assignments" USING btree ("shoot_id","crew_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tasks_assignments_unique_idx" ON "tasks_assignments" USING btree ("task_id","crew_id","organization_id");

INSERT INTO shoots_assignments (shoot_id, crew_id, is_lead, organization_id, assigned_at, created_at, updated_at)
SELECT entity_id, crew_id, is_lead, organization_id, assigned_at, created_at, updated_at
FROM assignments
WHERE entity_type = 'shoot';