-- Refactor: variant-centric stock, add is_primary, technical_spec, marketing_text
-- Run after 20250220100000_create_products_schema.sql

-- 1. Add marketing_text to products (product-level marketing copy)
ALTER TABLE products ADD COLUMN IF NOT EXISTS marketing_text text;

-- 2. Add missing columns to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock_warning_threshold integer DEFAULT 5;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS technical_spec jsonb;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Ensure stock_movements references variant (not product) for stock ledger
-- Add index on variant_id if not exists
CREATE INDEX IF NOT EXISTS idx_stock_variant ON stock_movements(variant_id);

-- 4. Update trigger: compute variant.stock from stock_movements per variant only
CREATE OR REPLACE FUNCTION fn_update_variant_stock() RETURNS trigger AS $$
BEGIN
  -- Update variant stock
  IF COALESCE(NEW.variant_id, OLD.variant_id) IS NOT NULL THEN
    UPDATE product_variants
    SET stock = COALESCE((
      SELECT SUM(qty) FROM stock_movements WHERE variant_id = COALESCE(NEW.variant_id, OLD.variant_id)
    ), 0),
    updated_at = now()
    WHERE id = COALESCE(NEW.variant_id, OLD.variant_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Replace old trigger with new one (scoped to variant)
DROP TRIGGER IF EXISTS trg_update_stock_totals ON stock_movements;
DROP TRIGGER IF EXISTS trg_update_variant_stock ON stock_movements;
CREATE TRIGGER trg_update_variant_stock
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION fn_update_variant_stock();

-- 5. Helper function to ensure only one is_primary per product
CREATE OR REPLACE FUNCTION fn_ensure_single_primary_variant() RETURNS trigger AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE product_variants SET is_primary = false
    WHERE product_id = NEW.product_id AND id <> NEW.id AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_primary_variant ON product_variants;
CREATE TRIGGER trg_single_primary_variant
  BEFORE INSERT OR UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION fn_ensure_single_primary_variant();

-- 6. Add RLS policies for variant-level operations (already present from base migration, but ensure)
-- (policies created in base migration are sufficient)

-- 7. Optional: compute products.stock as aggregate of variants (view or trigger)
-- For now, leave products.stock as-is (can be updated separately or dropped later)

-- Done
