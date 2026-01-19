-- Add category column to items table (nullable first)
ALTER TABLE items 
ADD COLUMN category TEXT;

-- Set default value for existing items
UPDATE items SET category = 'food' WHERE category IS NULL;

-- Now add NOT NULL constraint and CHECK constraint
ALTER TABLE items 
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN category SET DEFAULT 'food';

ALTER TABLE items 
ADD CONSTRAINT items_category_check CHECK (category IN ('food', 'drink'));

-- Create index for category filtering
CREATE INDEX idx_items_category ON items(category);
