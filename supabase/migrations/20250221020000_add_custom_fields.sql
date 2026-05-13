-- Add custom item fields for quotes/orders/enquiries

ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS custom_name text;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS custom_spec text;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS custom_notes text;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_name text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_spec text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_notes text;

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS custom_name text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS custom_spec text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS custom_notes text;
