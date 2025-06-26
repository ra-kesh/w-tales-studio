-- Add the organization_id column, allowing nulls for now
ALTER TABLE "payment_schedules" ADD COLUMN "organization_id" text;
--> statement-breakpoint
-- Populate the new organization_id column from the corresponding booking
UPDATE "payment_schedules" ps
SET "organization_id" = b."organization_id"
FROM "bookings" b
WHERE ps."booking_id" = b.id;
--> statement-breakpoint
-- Now that all rows have a value, enforce the NOT NULL constraint
ALTER TABLE "payment_schedules" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
-- Finally, add the foreign key constraint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;