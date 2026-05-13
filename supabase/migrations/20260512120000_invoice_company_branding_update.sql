-- Invoice letterhead: company name, bank, currency AUD, contact defaults, terms wording

UPDATE company_settings
SET
  company_name = 'AM Global Packaging Solutions',
  legal_name = 'AM Global Packaging Solutions',
  bank_name = 'Commonwealth Bank',
  currency_default = 'AUD',
  phone = '0434 396 360',
  email = 'amglobalpackagingsolutions@gmail.com',
  invoice_terms_default = 'Payment is due within 30 days of invoice date. Please include the invoice number in your payment reference. Goods remain the property of AM Global Packaging Solutions until payment is received in full.',
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000001';

UPDATE invoices
SET terms_text = replace(terms_text, 'AM Global Parcel Packaging Solutions', 'AM Global Packaging Solutions')
WHERE terms_text IS NOT NULL
  AND terms_text LIKE '%AM Global Parcel Packaging Solutions%';
