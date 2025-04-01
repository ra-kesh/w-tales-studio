-- Step 1: Add the organization_id column as nullable
ALTER TABLE "deliverables" ADD COLUMN "organization_id" text;

-- Step 2: Populate organization_id from the related booking
UPDATE "deliverables"
SET "organization_id" = "bookings"."organization_id"
FROM "bookings"
WHERE "deliverables"."booking_id" = "bookings"."id";

-- Step 3: Handle any NULL values (assign a default organization if needed)
-- Replace 'default-org-id' with a valid organization ID from your organizations table
UPDATE "deliverables"
SET "organization_id" = 'D3DmRj81Jov2dckBGQPENXJW8RmfZdU3'
WHERE "organization_id" IS NULL;

-- Step 4: Add the NOT NULL constraint
ALTER TABLE "deliverables" ALTER COLUMN "organization_id" SET NOT NULL;

-- Step 5: Add the foreign key constraint
ALTER TABLE "deliverables"
ADD CONSTRAINT "deliverables_organization_id_organizations_id_fk"
FOREIGN KEY ("organization_id")
REFERENCES "public"."organizations"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;