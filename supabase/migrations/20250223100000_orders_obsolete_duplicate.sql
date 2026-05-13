-- Order obsolete status and superseded_by for duplicate-order flow

ALTER TABLE orders ADD COLUMN IF NOT EXISTS superseded_by_order_id uuid REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('draft','pending_confirmation','confirmed','in_production','shipped','delivered','cancelled','obsolete')
);

CREATE INDEX IF NOT EXISTS idx_orders_superseded_by ON orders(superseded_by_order_id);

COMMENT ON COLUMN orders.superseded_by_order_id IS 'Set when order is superseded by a duplicated order (new version)';
