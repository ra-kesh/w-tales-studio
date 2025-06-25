ALTER TABLE "deliverables" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
-- 1) Drop defaults so columns no longer depend on the ENUM
ALTER TABLE "tasks"
  ALTER COLUMN "status"   DROP DEFAULT,
  ALTER COLUMN "priority" DROP DEFAULT;

-- 2) Alter columns to TEXT (casting existing values)
ALTER TABLE "tasks"
  ALTER COLUMN "status"   TYPE text USING status::text,
  ALTER COLUMN "priority" TYPE text USING priority::text;

-- 3) Drop the old ENUM types
DROP TYPE IF EXISTS "task_status";
DROP TYPE IF EXISTS "task_priority";

-- 4) Ensure uniqueness so ON CONFLICT works
CREATE UNIQUE INDEX IF NOT EXISTS
  configurations_type_key_org_idx
ON configurations(type, key, organization_id);

-- 5) Seed default TASK STATUS values
INSERT INTO configurations
  (type, key,           value,        is_system, created_at, updated_at)
VALUES
  ('task_status','todo',         'Todo',        true, NOW(), NOW()),
  ('task_status','in_progress',  'In Progress', true, NOW(), NOW()),
  ('task_status','in_review',    'In Review',   true, NOW(), NOW()),
  ('task_status','in_revision',  'In Revision', true, NOW(), NOW()),
  ('task_status','completed',    'Completed',   true, NOW(), NOW())
ON CONFLICT (type, key, organization_id) DO NOTHING;

-- 6) Seed default TASK PRIORITY values
INSERT INTO configurations
  (type,            key,     value,      is_system, created_at, updated_at)
VALUES
  ('task_priority','low',    'Low',      true, NOW(), NOW()),
  ('task_priority','medium', 'Medium',   true, NOW(), NOW()),
  ('task_priority','high',   'High',     true, NOW(), NOW()),
  ('task_priority','critical','Critical',true, NOW(), NOW())
ON CONFLICT (type, key, organization_id) DO NOTHING;