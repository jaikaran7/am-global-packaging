-- Company branding & invoicing (editable via API / future admin UI)

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-4000-8000-000000000001'::uuid,
  company_name text NOT NULL DEFAULT 'AM Global Parcel Packaging Solutions',
  legal_name text,
  abn text DEFAULT '70 503 268 103',
  bank_name text DEFAULT 'B&B Bank',
  bsb text DEFAULT '062-268',
  account_number text DEFAULT '10631463',
  tagline text DEFAULT 'Handmade papers & corrugated packaging — globally shipped',
  address_line text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  gst_note text DEFAULT 'GST Registered — 10% GST applied',
  currency_default text NOT NULL DEFAULT 'USD',
  gst_percent_default numeric(5,2) NOT NULL DEFAULT 10.00,
  invoice_terms_default text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO company_settings (
  id,
  company_name,
  legal_name,
  abn,
  bank_name,
  bsb,
  account_number,
  tagline,
  gst_note,
  currency_default,
  gst_percent_default,
  invoice_terms_default
)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'AM Global Parcel Packaging Solutions',
  'AM Global Parcel Packaging Solutions',
  '70 503 268 103',
  'B&B Bank',
  '062-268',
  '10631463',
  'Handmade papers & corrugated packaging — globally shipped',
  'GST Registered — 10% GST applied',
  'USD',
  10.00,
  'Payment is due within 30 days of invoice date. Please include the invoice number in your payment reference. Goods remain the property of AM Global Parcel Packaging Solutions until payment is received in full.'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  abn = EXCLUDED.abn,
  bank_name = EXCLUDED.bank_name,
  bsb = EXCLUDED.bsb,
  account_number = EXCLUDED.account_number,
  tagline = EXCLUDED.tagline,
  gst_note = EXCLUDED.gst_note,
  invoice_terms_default = EXCLUDED.invoice_terms_default;

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generated','sent','paid')),
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  gst_percent numeric(5,2) NOT NULL DEFAULT 10.00,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  terms_text text,
  bill_to_name text,
  bill_to_phone text,
  bill_to_email text,
  bill_to_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  description text NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  quantity numeric(12,4) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total numeric(12,2) NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_status text NOT NULL DEFAULT 'none';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_invoice_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_invoice_status_check
  CHECK (invoice_status IN ('none','draft','generated','sent','paid'));
