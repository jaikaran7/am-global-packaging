-- Orders & Stock Management
-- Run after 20250220200000_refactor_variants_stock.sql

-- =============================================
-- 1. customers table
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);

-- =============================================
-- 2. orders table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT '',
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  subtotal numeric(12,2) DEFAULT 0,
  tax numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  notes text,
  shipping_provider text,
  tracking_id text,
  shipped_date date,
  delivered_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (
    status IN ('draft','confirmed','in_production','shipped','delivered','cancelled')
  )
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =============================================
-- 3. order_items table
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

-- =============================================
-- 4. Alter product_variants for reserved / incoming stock
-- =============================================
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS incoming_stock integer DEFAULT 0;

-- =============================================
-- 5. Auto-generate order number: ORD-YYYYMMDD-XXXX
-- =============================================
CREATE OR REPLACE FUNCTION fn_generate_order_number() RETURNS trigger AS $$
DECLARE
  today_prefix text;
  seq integer;
BEGIN
  today_prefix := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-';
  SELECT COALESCE(MAX(
    CAST(substring(order_number FROM length(today_prefix) + 1) AS integer)
  ), 0) + 1
  INTO seq
  FROM orders
  WHERE order_number LIKE today_prefix || '%';

  NEW.order_number := today_prefix || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number = '' OR NEW.order_number IS NULL)
  EXECUTE FUNCTION fn_generate_order_number();

-- =============================================
-- 6. Auto-calculate order totals from items
-- =============================================
CREATE OR REPLACE FUNCTION fn_update_order_totals() RETURNS trigger AS $$
DECLARE
  target_order_id uuid;
BEGIN
  target_order_id := COALESCE(NEW.order_id, OLD.order_id);
  UPDATE orders
  SET subtotal = COALESCE((
    SELECT SUM(subtotal) FROM order_items WHERE order_id = target_order_id
  ), 0),
  total = COALESCE((
    SELECT SUM(subtotal) FROM order_items WHERE order_id = target_order_id
  ), 0) + COALESCE(tax, 0),
  updated_at = now()
  WHERE id = target_order_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_order_totals ON order_items;
CREATE TRIGGER trg_update_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION fn_update_order_totals();

-- =============================================
-- 7. Update orders.updated_at on change
-- =============================================
CREATE OR REPLACE FUNCTION fn_orders_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_orders_updated_at();

-- =============================================
-- 8. RLS — Admin-only for customers, orders, order_items
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins customers" ON customers;
CREATE POLICY "admins customers" ON customers FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins orders" ON orders;
CREATE POLICY "admins orders" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins order_items" ON order_items;
CREATE POLICY "admins order_items" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- =============================================
-- 9. Index on stock_movements.created_at for ledger queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
