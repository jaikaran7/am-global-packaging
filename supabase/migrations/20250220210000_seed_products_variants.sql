-- Seed categories (if not already present) and products with variants
-- Run after 20250220100000_create_products_schema.sql and 20250220200000_refactor_variants_stock.sql

-- 1. Categories (upsert)
INSERT INTO categories (id, name, slug, description) VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Pizza Boxes', 'pizza-boxes', 'Pizza style boxes for takeaway and delivery'),
  ('a0000002-0000-4000-8000-000000000002', 'A4 Boxes', 'a4-boxes', 'A4 size document and office boxes'),
  ('a0000003-0000-4000-8000-000000000003', 'Specialty & Heavy Duty', 'specialty-heavy-duty', 'Heavy duty and specialty packaging'),
  ('a0000004-0000-4000-8000-000000000004', 'E-Commerce', 'e-commerce', 'Ecommerce and FBA cartons'),
  ('a0000005-0000-4000-8000-000000000005', 'Vegetable Boxes', 'vegetable-boxes', 'Produce and vegetable packaging'),
  ('a0000006-0000-4000-8000-000000000006', 'Poultry Boxes', 'poultry-boxes', 'Poultry and meat packaging')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Products (product-level fields only)
INSERT INTO products (id, title, slug, category_id, short_description, marketing_text, active, featured) VALUES
  (
    'b0000001-0000-4000-8000-000000000001',
    'Pizza Box',
    'pizza-box',
    'a0000001-0000-4000-8000-000000000001',
    'Premium pizza boxes with ventilation slots and lock-tab closure',
    'Precision-engineered pizza boxes designed for optimal heat retention and crispness. Features optimized ventilation slots for steam release, food-grade certified material, grease-resistant inner coating, and custom branding available.',
    true,
    true
  ),
  (
    'b0000002-0000-4000-8000-000000000002',
    'A4 Box',
    'a4-box',
    'a0000002-0000-4000-8000-000000000002',
    'Versatile A4-format boxes for documents, small goods, and office shipping',
    'Compact A4-format boxes ideal for documents, small goods, and everyday office shipping. Available in multiple depths for various needs. Tiered pricing for bulk orders.',
    true,
    true
  ),
  (
    'b0000003-0000-4000-8000-000000000003',
    'Tea Chest Box',
    'tea-chest-box',
    'a0000003-0000-4000-8000-000000000003',
    'Heavy-duty chest for bulk storage and export',
    'Premium heavy-duty tea chest built with 5-Ply (3BC) corrugated board. Designed for bulk storage, export cartons, and heavy goods. Features reinforced corners and handles.',
    true,
    false
  ),
  (
    'b0000004-0000-4000-8000-000000000004',
    'E-Commerce Mailer',
    'ecommerce-mailer',
    'a0000004-0000-4000-8000-000000000004',
    'Sleek mailer boxes perfect for online retail',
    'Modern mailer boxes with clean design, self-locking tabs, and tear strip. Ideal for subscription boxes, retail packaging, and direct-to-consumer shipping.',
    true,
    false
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  marketing_text = EXCLUDED.marketing_text,
  featured = EXCLUDED.featured;

-- 3. Product variants
-- Pizza Box variants (Small, Medium, Large, Extra-Large, Family)
INSERT INTO product_variants (id, product_id, name, sku, price, moq, dimensions, gsm, ply, stock, is_primary) VALUES
  ('c0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'Small (200 × 200 × 40 mm)', 'PZ-001-S', 0.35, 500, '{"length_mm": 200, "width_mm": 200, "height_mm": 40}', 180, 3, 120, true),
  ('c0000002-0000-4000-8000-000000000002', 'b0000001-0000-4000-8000-000000000001', 'Medium (250 × 250 × 50 mm)', 'PZ-001-M', 0.48, 500, '{"length_mm": 250, "width_mm": 250, "height_mm": 50}', 180, 3, 95, false),
  ('c0000003-0000-4000-8000-000000000003', 'b0000001-0000-4000-8000-000000000001', 'Large (300 × 300 × 50 mm)', 'PZ-001-L', 0.62, 400, '{"length_mm": 300, "width_mm": 300, "height_mm": 50}', 200, 5, 80, false),
  ('c0000004-0000-4000-8000-000000000004', 'b0000001-0000-4000-8000-000000000001', 'Extra-Large (330 × 330 × 50 mm)', 'PZ-001-XL', 0.75, 300, '{"length_mm": 330, "width_mm": 330, "height_mm": 50}', 200, 5, 60, false),
  ('c0000005-0000-4000-8000-000000000005', 'b0000001-0000-4000-8000-000000000001', 'Family / Party (400 × 400 × 50 mm)', 'PZ-001-P', 0.95, 200, '{"length_mm": 400, "width_mm": 400, "height_mm": 50}', 220, 5, 40, false)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  moq = EXCLUDED.moq,
  dimensions = EXCLUDED.dimensions,
  stock = EXCLUDED.stock,
  is_primary = EXCLUDED.is_primary;

-- A4 Box variants (Type 1-4)
INSERT INTO product_variants (id, product_id, name, sku, price, moq, dimensions, gsm, ply, stock, is_primary) VALUES
  ('c0000011-0000-4000-8000-000000000011', 'b0000002-0000-4000-8000-000000000002', 'Type 1 (320 × 220 × 240 mm)', 'A4-001', 0.80, 500, '{"length_mm": 320, "width_mm": 220, "height_mm": 240}', 160, 3, 85, true),
  ('c0000012-0000-4000-8000-000000000012', 'b0000002-0000-4000-8000-000000000002', 'Type 2 (320 × 220 × 300 mm)', 'A4-002', 0.95, 400, '{"length_mm": 320, "width_mm": 220, "height_mm": 300}', 180, 3, 60, false),
  ('c0000013-0000-4000-8000-000000000013', 'b0000002-0000-4000-8000-000000000002', 'Type 3 (400 × 300 × 250 mm)', 'A4-003', 1.15, 300, '{"length_mm": 400, "width_mm": 300, "height_mm": 250}', 180, 5, 45, false),
  ('c0000014-0000-4000-8000-000000000014', 'b0000002-0000-4000-8000-000000000002', 'Type 4 (400 × 300 × 350 mm)', 'A4-004', 1.35, 250, '{"length_mm": 400, "width_mm": 300, "height_mm": 350}', 200, 5, 30, false)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  moq = EXCLUDED.moq,
  dimensions = EXCLUDED.dimensions,
  stock = EXCLUDED.stock;

-- Tea Chest Box variants (Standard, Large)
INSERT INTO product_variants (id, product_id, name, sku, price, moq, dimensions, gsm, ply, stock, is_primary) VALUES
  ('c0000021-0000-4000-8000-000000000021', 'b0000003-0000-4000-8000-000000000003', 'Standard (431 × 406 × 596 mm)', 'TEA-001', 3.70, 200, '{"length_mm": 431, "width_mm": 406, "height_mm": 596}', 300, 5, 45, true),
  ('c0000022-0000-4000-8000-000000000022', 'b0000003-0000-4000-8000-000000000003', 'Large (500 × 450 × 650 mm)', 'TEA-002', 4.50, 150, '{"length_mm": 500, "width_mm": 450, "height_mm": 650}', 350, 7, 25, false)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  dimensions = EXCLUDED.dimensions,
  stock = EXCLUDED.stock;

-- E-Commerce Mailer variants
INSERT INTO product_variants (id, product_id, name, sku, price, moq, dimensions, gsm, ply, stock, is_primary) VALUES
  ('c0000031-0000-4000-8000-000000000031', 'b0000004-0000-4000-8000-000000000004', 'Small (200 × 150 × 50 mm)', 'EC-001-S', 0.45, 1000, '{"length_mm": 200, "width_mm": 150, "height_mm": 50}', 150, 3, 200, true),
  ('c0000032-0000-4000-8000-000000000032', 'b0000004-0000-4000-8000-000000000004', 'Medium (300 × 200 × 80 mm)', 'EC-001-M', 0.65, 750, '{"length_mm": 300, "width_mm": 200, "height_mm": 80}', 150, 3, 150, false),
  ('c0000033-0000-4000-8000-000000000033', 'b0000004-0000-4000-8000-000000000004', 'Large (400 × 300 × 100 mm)', 'EC-001-L', 0.90, 500, '{"length_mm": 400, "width_mm": 300, "height_mm": 100}', 180, 3, 100, false)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  dimensions = EXCLUDED.dimensions,
  stock = EXCLUDED.stock;

-- Done
