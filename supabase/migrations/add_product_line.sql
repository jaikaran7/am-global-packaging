-- ============================================================
-- Migration: Add product_line to support Papers + Boxes admin
-- Run this in Supabase SQL Editor before deploying code changes
-- ============================================================

-- 1. products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'boxes';

UPDATE products SET product_line = 'boxes' WHERE product_line IS NULL OR product_line = '';

-- 2. enquiries table
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'boxes';

UPDATE enquiries SET product_line = 'boxes' WHERE product_line IS NULL OR product_line = '';

-- 3. orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'boxes';

UPDATE orders SET product_line = 'boxes' WHERE product_line IS NULL OR product_line = '';

-- 4. quotations table
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'boxes';

UPDATE quotations SET product_line = 'boxes' WHERE product_line IS NULL OR product_line = '';

-- 5. Optional indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_products_product_line     ON products(product_line);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_line    ON enquiries(product_line);
CREATE INDEX IF NOT EXISTS idx_orders_product_line       ON orders(product_line);
CREATE INDEX IF NOT EXISTS idx_quotations_product_line   ON quotations(product_line);

-- ============================================================
-- DONE. All existing records are tagged as 'boxes'.
-- New papers records will be tagged 'papers' automatically.
-- ============================================================
