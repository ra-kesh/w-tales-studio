-- Drop the foreign key constraint on relationId
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_relation_id_relationsTable_id_fk";

-- Create the relation_type enum (if not already created)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relation_type') THEN
    CREATE TYPE "relation_type" AS ENUM ('bride', 'groom', 'family');
  END IF;
END $$;

-- Add the new relation column with a default value (e.g., 'family' for existing rows)
ALTER TABLE "clients" ADD COLUMN "relation" "relation_type" NOT NULL DEFAULT 'family';

-- Update existing rows based on relationId (with explicit enum casting)
UPDATE "clients" SET "relation" = 
  CASE 
    WHEN "relation_id" = 1 THEN 'bride'::relation_type
    WHEN "relation_id" = 2 THEN 'groom'::relation_type
    WHEN "relation_id" = 3 THEN 'family'::relation_type
    ELSE 'family'::relation_type -- Default fallback
  END;

-- Drop the old relationId column
ALTER TABLE "clients" DROP COLUMN "relation_id";