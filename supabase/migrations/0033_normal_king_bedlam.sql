-- Add the organization_id column to invoices, allowing nulls for now
ALTER TABLE "invoices" ADD COLUMN "organization_id" text;
--> statement-breakpoint
-- Populate the new organization_id column from the corresponding booking
UPDATE "invoices" i
SET "organization_id" = b."organization_id"
FROM "bookings" b
WHERE i."booking_id" = b.id;
--> statement-breakpoint
-- Now that all rows have a value, enforce the NOT NULL constraint
ALTER TABLE "invoices" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
-- Add the foreign key constraint for invoices
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
-- Add the organization_id column to received_amounts, allowing nulls for now
ALTER TABLE "received_amounts" ADD COLUMN "organization_id" text;
--> statement-breakpoint
-- Populate the new organization_id column from the corresponding booking
UPDATE "received_amounts" ra
SET "organization_id" = b."organization_id"
FROM "bookings" b
WHERE ra."booking_id" = b.id;
--> statement-breakpoint
-- Now that all rows have a value, enforce the NOT NULL constraint
ALTER TABLE "received_amounts" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
-- Add the foreign key constraint for received_amounts
ALTER TABLE "received_amounts" ADD CONSTRAINT "received_amounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;