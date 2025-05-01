CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"crew_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "package_configs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "package_configs" CASCADE;--> statement-breakpoint
ALTER TABLE "crews" DROP CONSTRAINT "crews_booking_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "crews" DROP CONSTRAINT "crews_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "crews" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "member_id" text;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "equipment" text[];--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "specialization" text;--> statement-breakpoint
ALTER TABLE "crews" ADD COLUMN "status" text DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_unique_idx" ON "assignments" USING btree ("crew_id","entity_type","entity_id");--> statement-breakpoint
ALTER TABLE "crews" ADD CONSTRAINT "crews_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crews" DROP COLUMN "booking_id";--> statement-breakpoint
ALTER TABLE "crews" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "crews" DROP COLUMN "freelancer_name";--> statement-breakpoint
ALTER TABLE "crews" DROP COLUMN "is_lead";