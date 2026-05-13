-- Replace all paper (product_line = papers) products with the official catalog only.

DELETE FROM product_images
WHERE product_id IN (SELECT id FROM products WHERE product_line = 'papers');

DELETE FROM product_variants
WHERE product_id IN (SELECT id FROM products WHERE product_line = 'papers');

DELETE FROM products
WHERE product_line = 'papers';

INSERT INTO categories (name, slug, description)
VALUES
  ('White Handmade Cotton Paper', 'white-handmade-cotton-paper', 'White handmade cotton — Deckle Edge Paper line'),
  ('Marble Paper', 'marble-paper', 'Hand-marbled decorative paper — 200 gsm')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ========== Cotton products ==========
INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'White Handmade Cotton Paper — Deckle Edge Paper — A4',
  'white-cotton-deckle-a4',
  id,
  'Premium white handmade cotton paper with natural deckle edges. Listed prices are base (before tax); GST 10% added at checkout / invoice.',
  'Deckle Edge Paper — A4 (210 × 297 mm)',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"cotton","category_label":"White Handmade Cotton Paper","size_label":"A4","dimensions":"210 × 297 mm","feature_badges":["100% Handmade","Acid Free","Tree Free","Ships Globally"],"tags":["cotton","deckle","A4"]}'::jsonb
FROM categories WHERE slug = 'white-handmade-cotton-paper';

INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'White Handmade Cotton Paper — Deckle Edge Paper — A5',
  'white-cotton-deckle-a5',
  id,
  'Premium white handmade cotton paper — A5. Prices exclude GST; +10% GST on subtotal.',
  'Deckle Edge Paper — A5 (148 × 210 mm)',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"cotton","category_label":"White Handmade Cotton Paper","size_label":"A5","dimensions":"148 × 210 mm","feature_badges":["100% Handmade","Acid Free","Tree Free","Ships Globally"],"tags":["cotton","deckle","A5"]}'::jsonb
FROM categories WHERE slug = 'white-handmade-cotton-paper';

INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'White Handmade Cotton Paper — Deckle Edge Paper — 22 × 30 inch',
  'white-cotton-deckle-22x30',
  id,
  'Large-format deckle edge cotton sheets. Straight cut or deckle edge — note preference when ordering.',
  'Deckle Edge Paper — 22 × 30 inch',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"cotton","category_label":"White Handmade Cotton Paper","size_label":"22 × 30 inch","dimensions":"558.8 × 762 mm","feature_badges":["100% Handmade","Large Format","Ships Globally"],"tags":["cotton","deckle","large"]}'::jsonb
FROM categories WHERE slug = 'white-handmade-cotton-paper';

INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'White Handmade Cotton Paper — Deckle Edge Paper — 10 × 20 cm',
  'white-cotton-deckle-10x20',
  id,
  'Narrow-format deckle edge cotton sheets.',
  'Deckle Edge Paper — 10 × 20 cm',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"cotton","category_label":"White Handmade Cotton Paper","size_label":"10 × 20 cm","dimensions":"100 × 200 mm","feature_badges":["100% Handmade","Ships Globally"],"tags":["cotton","deckle","custom-size"]}'::jsonb
FROM categories WHERE slug = 'white-handmade-cotton-paper';

-- Cotton variants (USD base price, stock 100, GST 10%)
INSERT INTO product_variants (product_id, name, sku, price, gsm, dimensions, is_primary, stock, moq, size_label, unit_label, currency, tax_rate_percent, tax_inclusive, min_order_quantity, weight_grams, is_available, stock_warning_threshold)
SELECT p.id, x.nm, x.sku, x.pr, x.gsm, x.dim::jsonb, x.ip, 100, 1, x.sz, 'sheet', 'USD', 10.00, false, 1, x.wg, true, 15
FROM products p
CROSS JOIN (VALUES
  ('white-cotton-deckle-a4', 110, 'White Handmade Cotton Paper — A4 — 110 GSM', 'PAPER-WHT-A4-110', 1.00, '{"length_mm":210,"width_mm":297}'::text, true, 'A4', 18),
  ('white-cotton-deckle-a4', 250, 'White Handmade Cotton Paper — A4 — 250 GSM', 'PAPER-WHT-A4-250', 2.50, '{"length_mm":210,"width_mm":297}'::text, false, 'A4', 41),
  ('white-cotton-deckle-a4', 320, 'White Handmade Cotton Paper — A4 — 320 GSM', 'PAPER-WHT-A4-320', 3.20, '{"length_mm":210,"width_mm":297}'::text, false, 'A4', 52),
  ('white-cotton-deckle-a5', 250, 'White Handmade Cotton Paper — A5 — 250 GSM', 'PAPER-WHT-A5-250', 1.60, '{"length_mm":148,"width_mm":210}'::text, true, 'A5', 26),
  ('white-cotton-deckle-a5', 320, 'White Handmade Cotton Paper — A5 — 320 GSM', 'PAPER-WHT-A5-320', 2.00, '{"length_mm":148,"width_mm":210}'::text, false, 'A5', 33),
  ('white-cotton-deckle-22x30', 270, 'White Handmade Cotton Paper — 22 × 30 inch — 270 GSM', 'PAPER-WHT-22x30-270', 8.00, '{"length_mm":559,"width_mm":762}'::text, true, '22 × 30 inch', 140),
  ('white-cotton-deckle-10x20', 350, 'White Handmade Cotton Paper — 10 × 20 cm — 350 GSM', 'PAPER-WHT-10x20-350', 1.40, '{"length_mm":100,"width_mm":200}'::text, true, '10 × 20 cm', 35)
) AS x(sl, gsm, nm, sku, pr, dim, ip, sz, wg)
WHERE p.slug = x.sl;

-- ========== Marble products (200 gsm only) ==========
INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'Marble Paper — A4',
  'marble-paper-a4',
  id,
  'Hand-marbled decorative paper — 200 gsm. Unique patterns per sheet.',
  'Marble Paper — A4 — 200 gsm',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"marble","category_label":"Marble Paper","size_label":"A4","dimensions":"210 × 297 mm","gsm_fixed":200,"feature_badges":["Hand Marbled","Unique Pattern","Ships Globally"],"tags":["marble","A4"]}'::jsonb
FROM categories WHERE slug = 'marble-paper';

INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'Marble Paper — A5',
  'marble-paper-a5',
  id,
  'Hand-marbled decorative paper — 200 gsm.',
  'Marble Paper — A5 — 200 gsm',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"marble","category_label":"Marble Paper","size_label":"A5","dimensions":"148 × 210 mm","gsm_fixed":200,"feature_badges":["Hand Marbled","Unique Pattern"],"tags":["marble","A5"]}'::jsonb
FROM categories WHERE slug = 'marble-paper';

INSERT INTO products (title, slug, category_id, description, short_description, marketing_text, active, featured, product_line, meta)
SELECT
  'Marble Paper — 22 × 30 inch',
  'marble-paper-22x30',
  id,
  'Large-format hand-marbled paper — 200 gsm.',
  'Marble Paper — 22 × 30 inch — 200 gsm',
  'GST Registered — 10% on subtotal · Prices in USD',
  true, true, 'papers',
  '{"paper_type":"marble","category_label":"Marble Paper","size_label":"22 × 30 inch","dimensions":"558.8 × 762 mm","gsm_fixed":200,"feature_badges":["Hand Marbled","Large Format"],"tags":["marble","large"]}'::jsonb
FROM categories WHERE slug = 'marble-paper';

INSERT INTO product_variants (product_id, name, sku, price, gsm, dimensions, is_primary, stock, moq, size_label, unit_label, currency, tax_rate_percent, tax_inclusive, min_order_quantity, weight_grams, is_available, stock_warning_threshold)
SELECT p.id, x.nm, x.sku, x.pr, 200, x.dim::jsonb, true, 100, 1, x.sz, 'sheet', 'USD', 10.00, false, 1, x.wg, true, 15
FROM products p
CROSS JOIN (VALUES
  ('marble-paper-a4', 'Marble Paper — A4 — 200 GSM', 'PAPER-MBL-A4-200', 3.00, '{"length_mm":210,"width_mm":297}'::text, 'A4', 33),
  ('marble-paper-a5', 'Marble Paper — A5 — 200 GSM', 'PAPER-MBL-A5-200', 2.00, '{"length_mm":148,"width_mm":210}'::text, 'A5', 21),
  ('marble-paper-22x30', 'Marble Paper — 22 × 30 inch — 200 GSM', 'PAPER-MBL-22x30-200', 10.00, '{"length_mm":559,"width_mm":762}'::text, '22 × 30 inch', 104)
) AS x(sl, nm, sku, pr, dim, sz, wg)
WHERE p.slug = x.sl;
