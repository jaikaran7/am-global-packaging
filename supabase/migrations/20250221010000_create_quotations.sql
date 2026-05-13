-- Quotations Management
-- Run after 20250221000000_create_orders_stock.sql

-- =============================================
-- 1. quotations table
-- =============================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL DEFAULT '',
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  subtotal numeric(12,2) DEFAULT 0,
  gst_percent numeric(5,2) DEFAULT 10,
  tax numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  notes text,
  terms_text text,
  valid_until date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT quotations_status_check CHECK (
    status IN ('draft','sent','accepted','rejected','expired')
  )
);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quote_number);

-- =============================================
-- 2. quotation_items table
-- =============================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);

-- =============================================
-- 3. Link order -> quotation (optional)
-- =============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_quotation ON orders(quotation_id);

-- =============================================
-- 4. Auto-generate quote number: QUO-YYYYMMDD-XXXX
-- =============================================
CREATE OR REPLACE FUNCTION fn_generate_quote_number() RETURNS trigger AS $$
DECLARE
  today_prefix text;
  seq integer;
BEGIN
  today_prefix := 'QUO-' || to_char(now(), 'YYYYMMDD') || '-';
  SELECT COALESCE(MAX(
    CAST(substring(quote_number FROM length(today_prefix) + 1) AS integer)
  ), 0) + 1
  INTO seq
  FROM quotations
  WHERE quote_number LIKE today_prefix || '%';

  NEW.quote_number := today_prefix || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_quote_number ON quotations;
CREATE TRIGGER trg_generate_quote_number
  BEFORE INSERT ON quotations
  FOR EACH ROW
  WHEN (NEW.quote_number = '' OR NEW.quote_number IS NULL)
  EXECUTE FUNCTION fn_generate_quote_number();

-- =============================================
-- 5. Auto-calculate quote totals from items + GST
-- =============================================
CREATE OR REPLACE FUNCTION fn_update_quote_totals() RETURNS trigger AS $$
DECLARE
  target_quote_id uuid;
  subtotal_sum numeric(12,2);
  gst_rate numeric(5,2);
BEGIN
  target_quote_id := COALESCE(NEW.quotation_id, OLD.quotation_id);
  SELECT COALESCE(SUM(subtotal), 0) INTO subtotal_sum
  FROM quotation_items
  WHERE quotation_id = target_quote_id;

  SELECT COALESCE(gst_percent, 0) INTO gst_rate FROM quotations WHERE id = target_quote_id;

  UPDATE quotations
  SET subtotal = subtotal_sum,
      tax = ROUND(subtotal_sum * (gst_rate / 100.0), 2),
      total = subtotal_sum + ROUND(subtotal_sum * (gst_rate / 100.0), 2),
      updated_at = now()
  WHERE id = target_quote_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_quote_totals ON quotation_items;
CREATE TRIGGER trg_update_quote_totals
  AFTER INSERT OR UPDATE OR DELETE ON quotation_items
  FOR EACH ROW EXECUTE FUNCTION fn_update_quote_totals();

-- =============================================
-- 6. Update quotations.updated_at on change
-- =============================================
CREATE OR REPLACE FUNCTION fn_quotations_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quotations_updated_at ON quotations;
CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION fn_quotations_updated_at();

-- =============================================
-- 7. RLS — Admin-only for quotations + items
-- =============================================
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins quotations" ON quotations;
CREATE POLICY "admins quotations" ON quotations FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins quotation_items" ON quotation_items;
CREATE POLICY "admins quotation_items" ON quotation_items FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));
