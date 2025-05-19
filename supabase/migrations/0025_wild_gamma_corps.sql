-- Step 1: Check what objects depend on the enum types
-- Run these queries first to see what's blocking the drop:
-- SELECT * FROM pg_depend WHERE refobjid = (SELECT oid FROM pg_type WHERE typname = 'relation_type');
-- SELECT * FROM pg_depend WHERE refobjid = (SELECT oid FROM pg_type WHERE typname = 'booking_phase');

-- Step 2: Convert columns to text with explicit casting to break dependencies
ALTER TABLE "public"."clients" ALTER COLUMN "relation" SET DATA TYPE text USING "relation"::text;
--> statement-breakpoint

-- Step 3: Check if there are any other columns using relation_type
-- If there are, convert them to text as well:
-- ALTER TABLE "other_table" ALTER COLUMN "other_column" SET DATA TYPE text USING "other_column"::text;

-- Step 4: Drop any indexes that might reference the enum
-- DROP INDEX IF EXISTS idx_clients_relation; -- Replace with actual index names if they exist

-- Step 5: Now try to drop the enum type
DROP TYPE IF EXISTS "public"."relation_type" CASCADE;
--> statement-breakpoint

-- Step 6: Create the new enum type
CREATE TYPE "public"."relation_type" AS ENUM('bride', 'groom', 'family', 'unknown');
--> statement-breakpoint

-- Step 7: Convert the column back to the new enum type
ALTER TABLE "public"."clients" ALTER COLUMN "relation" SET DATA TYPE "public"."relation_type" USING 
  CASE 
    WHEN "relation" IN ('bride', 'groom', 'family', 'unknown') THEN "relation"::"public"."relation_type"
    ELSE 'unknown'::"public"."relation_type"
  END;
--> statement-breakpoint

-- Repeat the same process for booking_phase
ALTER TABLE "public"."bookings" ALTER COLUMN "status" SET DATA TYPE text USING "status"::text;
--> statement-breakpoint

-- Drop any indexes on the status column if they exist
-- DROP INDEX IF EXISTS idx_bookings_status; -- Replace with actual index names if they exist

DROP TYPE IF EXISTS "public"."booking_phase" CASCADE;
--> statement-breakpoint

CREATE TYPE "public"."booking_phase" AS ENUM('new', 'preparation', 'shooting', 'delivery', 'completed', 'cancelled');
--> statement-breakpoint

ALTER TABLE "public"."bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_phase" USING 
  CASE 
    WHEN "status" IN ('new', 'preparation', 'shooting', 'delivery', 'completed', 'cancelled') THEN "status"::"public"."booking_phase"
    ELSE 'new'::"public"."booking_phase"
  END;