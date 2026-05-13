-- Quotation versioning, soft delete, order snapshot & pending_confirmation
-- Safe additive migration; does not break existing data.

-- =============================================
-- 1. Quotations: version, parent_quote_id, deleted_at, status
-- =============================================
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES quotations(id) ON DELETE SET NULL;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_quotations_deleted_at ON quotations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quotations_parent ON quotations(parent_quote_id);

-- Extend status check: add revised, locked, cancelled (keep existing values)
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;
ALTER TABLE quotations ADD CONSTRAINT quotations_status_check CHECK (
  status IN ('draft','sent','accepted','rejected','expired','revised','locked','cancelled')
);

-- =============================================
-- 2. Orders: source_quote_id, source_quote_version, status pending_confirmation
-- =============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_quote_id uuid REFERENCES quotations(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_quote_version integer;

-- Backfill: orders created from quote already have quotation_id
UPDATE orders SET source_quote_id = quotation_id, source_quote_version = 1
WHERE quotation_id IS NOT NULL AND source_quote_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_source_quote ON orders(source_quote_id);

-- Add pending_confirmation to order status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('draft','pending_confirmation','confirmed','in_production','shipped','delivered','cancelled')
);

-- =============================================
-- 3. Order items: optional snapshot display (product/variant names at order creation)
-- =============================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_title_snapshot text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_name_snapshot text;

-- =============================================
-- 4. Quotation list: exclude soft-deleted by default (application-level filter)
-- RLS and queries should use: WHERE (deleted_at IS NULL)
-- =============================================
-- No trigger needed; API and GET list will filter deleted_at IS NULL.

COMMENT ON COLUMN quotations.deleted_at IS 'Soft delete: set when draft is deleted; exclude from lists';
COMMENT ON COLUMN quotations.version IS 'Revision number; 1 for new quotes, incremented for revisions';
COMMENT ON COLUMN orders.source_quote_version IS 'Quotation version at time of order creation (snapshot)';
