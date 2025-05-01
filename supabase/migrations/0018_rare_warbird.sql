-- Update crews table
ALTER TABLE crews
ADD COLUMN organization_id TEXT;

UPDATE crews
SET organization_id = 'D3DmRj81Jov2dckBGQPENXJW8RmfZdU3'
WHERE organization_id IS NULL;

ALTER TABLE crews
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE crews
ADD CONSTRAINT crews_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Update assignments table
ALTER TABLE assignments
ADD COLUMN organization_id TEXT;

UPDATE assignments
SET organization_id = (
  SELECT c.organization_id
  FROM crews c
  WHERE c.id = assignments.crew_id
  LIMIT 1
)
WHERE organization_id IS NULL;

ALTER TABLE assignments
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE assignments
ADD CONSTRAINT assignments_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS assignments_unique_idx;
CREATE UNIQUE INDEX assignments_unique_idx ON assignments (crew_id, entity_type, entity_id, organization_id);