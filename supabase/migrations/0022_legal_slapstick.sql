-- Create the enum types
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'in_review', 'in_revision', 'completed');

-- Drop the foreign key constraint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_users_id_fk";

-- Step 1: Map existing status values to task_status enum values
UPDATE "tasks"
SET "status" = CASE
  WHEN LOWER(status) = 'todo' THEN 'todo'
  WHEN LOWER(status) = 'inprogress' THEN 'in_progress'
  WHEN LOWER(status) = 'inreview' THEN 'in_review'
  WHEN LOWER(status) = 'inrevision' THEN 'in_revision'
  WHEN LOWER(status) = 'completed' THEN 'completed'
  WHEN LOWER(status) = 'done' THEN 'completed'
  -- Map unexpected values to a default
  ELSE 'todo'
END;

-- Step 2: Drop the default value for status before altering the type
ALTER TABLE "tasks"
ALTER COLUMN "status"
DROP DEFAULT;

-- Step 3: Alter the status column type
ALTER TABLE "tasks"
ALTER COLUMN "status"
SET DATA TYPE task_status
USING status::task_status;

-- Step 4: Re-apply the default for status
ALTER TABLE "tasks"
ALTER COLUMN "status"
SET DEFAULT 'todo'::task_status;

-- Step 5: Map existing priority values to task_priority enum values
UPDATE "tasks"
SET "priority" = CASE
  WHEN LOWER(priority) = 'low' THEN 'low'
  WHEN LOWER(priority) = 'medium' THEN 'medium'
  WHEN LOWER(priority) = 'high' THEN 'high'
  WHEN LOWER(priority) = 'critical' THEN 'critical'
  WHEN LOWER(priority) = 'urgent' THEN 'high'
  -- Map unexpected values to a default
  ELSE 'medium'
END;

-- Step 6: Drop the default value for priority before altering the type
ALTER TABLE "tasks"
ALTER COLUMN "priority"
DROP DEFAULT;

-- Step 7: Alter the priority column type
ALTER TABLE "tasks"
ALTER COLUMN "priority"
SET DATA TYPE task_priority
USING priority::task_priority;

-- Step 8: Re-apply the default for priority
ALTER TABLE "tasks"
ALTER COLUMN "priority"
SET DEFAULT 'medium'::task_priority;

-- Add NOT NULL constraints
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "tasks_assignments" ALTER COLUMN "assigned_at" SET NOT NULL;
ALTER TABLE "tasks_assignments" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "tasks_assignments" ALTER COLUMN "updated_at" SET NOT NULL;

-- Drop obsolete columns
ALTER TABLE "tasks" DROP COLUMN "assigned_to";
ALTER TABLE "tasks_assignments" DROP COLUMN "is_lead";