-- Separate corrugated vs papers categories for admin filtering

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'boxes';

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_product_line_check;
ALTER TABLE categories ADD CONSTRAINT categories_product_line_check
  CHECK (product_line IN ('boxes', 'papers'));

COMMENT ON COLUMN categories.product_line IS 'Used to scope admin Categories UI and product category pickers (boxes = corrugated, papers).';

-- Existing paper catalog category slugs → papers; everything else stays boxes (default)
UPDATE categories SET product_line = 'papers' WHERE slug IN (
  'white-handmade-cotton-paper',
  'marble-paper',
  'cotton-paper'
);
