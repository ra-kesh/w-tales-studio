-- Step 1: Add the organization_id column as nullable
ALTER TABLE "expenses" ADD COLUMN "organization_id" text;

-- Step 2: Populate organization_id from the related booking
UPDATE "expenses"
SET "organization_id" = "bookings"."organization_id"
FROM "bookings"
WHERE "expenses"."booking_id" = "bookings"."id";

-- Step 3: Handle any NULL values (assign a default organization if needed)
-- Replace 'default-org-id' with a valid organization ID from your organizations table
UPDATE "expenses"
SET "organization_id" = 'D3DmRj81Jov2dckBGQPENXJW8RmfZdU3'
WHERE "organization_id" IS NULL;

-- Step 4: Add the NOT NULL constraint
ALTER TABLE "expenses" ALTER COLUMN "organization_id" SET NOT NULL;

-- Step 5: Add the foreign key constraint
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_organization_id_organizations_id_fk"
FOREIGN KEY ("organization_id")
REFERENCES "public"."organizations"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- Step 6: Add an index for better query performance
CREATE INDEX idx_expenses_organization_id ON "expenses" ("organization_id");