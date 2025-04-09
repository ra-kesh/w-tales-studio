-- Drop the existing foreign key constraint to allow modifications
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_client_id_clients_id_fk";

-- Update NULL values in bride_name and groom_name to a default value (e.g., empty string)
UPDATE "clients" SET "bride_name" = '' WHERE "bride_name" IS NULL;
UPDATE "clients" SET "groom_name" = '' WHERE "groom_name" IS NULL;

-- Set bride_name and groom_name to NOT NULL
ALTER TABLE "clients" ALTER COLUMN "bride_name" SET NOT NULL;
ALTER TABLE "clients" ALTER COLUMN "groom_name" SET NOT NULL;

-- Set date and time in shoots to NOT NULL (assuming existing rows have values or can be defaulted)
ALTER TABLE "shoots" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "shoots" ALTER COLUMN "time" SET NOT NULL;

-- Add address column with a default value to handle existing rows, then set NOT NULL
ALTER TABLE "clients" ADD COLUMN "address" text NOT NULL DEFAULT '';
-- Optionally update address with meaningful data later if needed

-- Add location column to shoots (can be NULL initially)
ALTER TABLE "shoots" ADD COLUMN "location" jsonb;

-- Re-add the foreign key constraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;

-- Drop unnecessary columns
ALTER TABLE "clients" DROP COLUMN "locations";
ALTER TABLE "shoots" DROP COLUMN "city";
ALTER TABLE "shoots" DROP COLUMN "venue";