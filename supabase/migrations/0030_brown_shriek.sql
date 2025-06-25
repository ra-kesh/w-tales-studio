ALTER TABLE expenses
  ALTER COLUMN bill_to DROP DEFAULT,
  ALTER COLUMN bill_to TYPE text USING bill_to::text;

-- 2) Drop the old bill_to type if you’re replacing it
DROP TYPE IF EXISTS "bill_to";

-- 3) Create the new pgEnum
CREATE TYPE "bill_to" AS ENUM ('Studio','Client');

-- 4) Re‐cast the column back to the enum
ALTER TABLE expenses
  ALTER COLUMN bill_to TYPE "bill_to" USING bill_to::"bill_to";

INSERT INTO configurations
  (type, key,            value,                   is_system, created_at, updated_at)
VALUES
  ('expense_category','food',           'Food',                    true, NOW(), NOW()),
  ('expense_category','drink',          'Drink',                   true, NOW(), NOW()),
  ('expense_category','travel',         'Travel',                  true, NOW(), NOW()),
  ('expense_category','equipment',      'Equipment',               true, NOW(), NOW()),
  ('expense_category','accommodation',  'Accommodation',           true, NOW(), NOW()),
  ('expense_category','miscellaneous',  'Miscellaneous',           true, NOW(), NOW()),
  ('expense_category','props',          'Props & Set Design',      true, NOW(), NOW()),
  ('expense_category','makeup',         'Makeup & Styling',        true, NOW(), NOW()),
  ('expense_category','wardrobe',       'Wardrobe',                true, NOW(), NOW()),
  ('expense_category','location_fees',  'Location / Venue Fees',   true, NOW(), NOW()),
  ('expense_category','insurance',      'Insurance',               true, NOW(), NOW())
