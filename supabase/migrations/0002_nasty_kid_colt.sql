-- Step 1: Create a new relations table with serial ID
CREATE TABLE relations_new (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Step 2: Migrate data from the old relations table to the new one
-- Since the old IDs are text (e.g., 'rel_001'), we'll insert the data and let the serial type assign new integer IDs
INSERT INTO relations_new (name)
SELECT name
FROM relations;

-- Step 3: Update the clients table to reference the new integer IDs
-- First, add a temporary column to store the new integer relation_id
ALTER TABLE clients ADD COLUMN new_relation_id INTEGER;

-- Map the old text relation_id to the new integer ID
UPDATE clients
SET new_relation_id = (
  SELECT r_new.id
  FROM relations_new r_new
  JOIN relations r_old ON r_new.name = r_old.name
  WHERE r_old.id = clients.relation_id
);

-- Step 4: Drop the old relation_id column and rename the new one
ALTER TABLE clients DROP COLUMN relation_id;
ALTER TABLE clients RENAME COLUMN new_relation_id TO relation_id;

-- Step 5: Drop the old relations table and rename the new one
DROP TABLE relations;
ALTER TABLE relations_new RENAME TO relations;

-- Step 6: Update the foreign key constraint on clients.relation_id
ALTER TABLE clients
ADD CONSTRAINT clients_relation_id_fkey
FOREIGN KEY (relation_id) REFERENCES relations(id) ON DELETE SET NULL;