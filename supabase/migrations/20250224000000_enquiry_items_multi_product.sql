-- Multi-product enquiries: enquiry_items table + link to quotation
-- Safe migration: preserves existing data; new structure supports multiple products per enquiry.

-- =============================================
-- 1. enquiry_items table
-- =============================================
CREATE TABLE IF NOT EXISTS enquiry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  product_category text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  ply_preference text,
  custom_name text,
  custom_spec text,
  custom_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiry_items_enquiry ON enquiry_items(enquiry_id);

-- RLS: same as enquiries (public insert via service role; admin read/update)
ALTER TABLE enquiry_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert enquiry_items" ON enquiry_items;
CREATE POLICY "Public can insert enquiry_items"
  ON enquiry_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read enquiry_items" ON enquiry_items;
CREATE POLICY "Admin can read enquiry_items"
  ON enquiry_items FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update enquiry_items" ON enquiry_items;
CREATE POLICY "Admin can update enquiry_items"
  ON enquiry_items FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 2. Migrate existing enquiries into enquiry_items (one row per enquiry)
-- =============================================
INSERT INTO enquiry_items (
  enquiry_id,
  product_category,
  product,
  quantity,
  ply_preference,
  custom_name,
  custom_spec,
  custom_notes
)
SELECT
  id,
  COALESCE(product_category, ''),
  COALESCE(product, ''),
  COALESCE(quantity, 1),
  ply_preference,
  custom_name,
  custom_spec,
  custom_notes
FROM enquiries
WHERE NOT EXISTS (SELECT 1 FROM enquiry_items WHERE enquiry_items.enquiry_id = enquiries.id);

-- =============================================
-- 3. enquiries: link to quotation when converted
-- =============================================
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS converted_to_quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS notes text;
CREATE INDEX IF NOT EXISTS idx_enquiries_converted_quote ON enquiries(converted_to_quotation_id);

-- =============================================
-- 4. quotations: link back to source enquiry
-- =============================================
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS source_enquiry_id uuid REFERENCES enquiries(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotations_source_enquiry ON quotations(source_enquiry_id);

COMMENT ON TABLE enquiry_items IS 'Line items per enquiry; supports multiple products per enquiry';
COMMENT ON COLUMN enquiries.converted_to_quotation_id IS 'Set when enquiry is confirmed and converted to a quotation; prevents duplicate conversion';
COMMENT ON COLUMN quotations.source_enquiry_id IS 'Enquiry this quotation was created from (confirm enquiry flow)';
