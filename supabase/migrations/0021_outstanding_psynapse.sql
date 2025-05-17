-- Create the deliverable_status enum
CREATE TYPE "deliverable_status" AS ENUM ('pending', 'in_progress', 'in_revision', 'completed', 'delivered', 'cancelled');

-- Create the deliverable_priority enum
CREATE TYPE "deliverable_priority" AS ENUM ('low', 'medium', 'high');

-- Add columns to the deliverables table
ALTER TABLE "deliverables" ADD COLUMN "status" "deliverable_status" DEFAULT 'pending' NOT NULL;
ALTER TABLE "deliverables" ADD COLUMN "file_url" text;
ALTER TABLE "deliverables" ADD COLUMN "client_feedback" text;
ALTER TABLE "deliverables" ADD COLUMN "priority" "deliverable_priority" DEFAULT 'medium' NOT NULL;
ALTER TABLE "deliverables" ADD COLUMN "revision_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "deliverables" ADD COLUMN "delivered_at" timestamp;