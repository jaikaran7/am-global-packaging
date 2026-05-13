-- Seed categories only (products are seeded in 20250220210000_seed_products_variants.sql)
-- Run after 20250220100000_create_products_schema.sql

INSERT INTO categories (id, name, slug, description) VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Pizza Boxes', 'pizza-boxes', 'Pizza style boxes'),
  ('a0000002-0000-4000-8000-000000000002', 'A4 Boxes', 'a4-boxes', 'A4 size document and office boxes'),
  ('a0000003-0000-4000-8000-000000000003', 'Specialty & Heavy Duty', 'specialty-heavy-duty', 'Heavy duty and specialty packaging'),
  ('a0000004-0000-4000-8000-000000000004', 'E-Commerce', 'e-commerce', 'Ecommerce and FBA cartons'),
  ('a0000005-0000-4000-8000-000000000005', 'Vegetable Boxes', 'vegetable-boxes', 'Produce and vegetable packaging'),
  ('a0000006-0000-4000-8000-000000000006', 'Poultry Boxes', 'poultry-boxes', 'Poultry and meat packaging')
ON CONFLICT (slug) DO NOTHING;

-- NOTE: Product and variant seeding moved to 20250220210000_seed_products_variants.sql
-- to support the new variant-centric architecture.
