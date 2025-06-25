ALTER TABLE "deliverables" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deliverables" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "deliverables" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deliverables" ALTER COLUMN "priority" DROP DEFAULT;



-- 2) Seed default deliverable_status values
INSERT INTO "configurations"
  ("type", "key",          "value",         "is_system", "created_at",          "updated_at")
VALUES
  ('deliverable_status','pending',     'Pending',     true, NOW(), NOW()),
  ('deliverable_status','in_progress','In Progress', true, NOW(), NOW()),
  ('deliverable_status','in_revision','In Revision', true, NOW(), NOW()),
  ('deliverable_status','completed',  'Completed',   true, NOW(), NOW()),
  ('deliverable_status','delivered',  'Delivered',   true, NOW(), NOW()),
  ('deliverable_status','cancelled',  'Cancelled',   true, NOW(), NOW());

-- 3) Seed default deliverable_priority values
INSERT INTO "configurations"
  ("type",           "key",    "value",      "is_system", "created_at",          "updated_at")
VALUES
  ('deliverable_priority','low',   'Low',      true, NOW(), NOW()),
  ('deliverable_priority','medium','Medium',   true, NOW(), NOW()),
  ('deliverable_priority','high',  'High',     true, NOW(), NOW());