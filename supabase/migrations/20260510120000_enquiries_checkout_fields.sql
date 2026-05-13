-- B2B checkout / inquiry extras (optional columns; backwards compatible).

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS reference_number text;
CREATE UNIQUE INDEX IF NOT EXISTS enquiries_reference_number_uidx ON enquiries(reference_number)
  WHERE reference_number IS NOT NULL;

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS delivery_address text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS state_region text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS preferred_contact_method text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS checkout_metadata jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN enquiries.reference_number IS 'Human-readable enquiry id e.g. ENQ-20260510-A1B2';
COMMENT ON COLUMN enquiries.checkout_metadata IS 'Pricing snapshot, attachment names, checkout version — extensible';
