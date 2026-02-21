-- Products schema for AM Global Packaging Solutions
-- Requires: auth.users (Supabase Auth)

-- 0. Admins table (for RLS; create if not exists)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'superadmin',
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- 1. categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  short_description text,
  price numeric(12,2) DEFAULT 0,
  moq integer DEFAULT 1,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  stock integer DEFAULT 0,
  stock_warning_threshold integer DEFAULT 5,
  dimensions jsonb,
  gsm integer,
  ply integer,
  unit text DEFAULT 'unit',
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- 3. product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text,
  sku text UNIQUE,
  price numeric(12,2),
  dimensions jsonb,
  gsm integer,
  ply integer,
  moq integer,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- 4. product_images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  url text,
  alt text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- 5. stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  movement_type text NOT NULL,
  qty integer NOT NULL,
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock_movements(product_id);

-- 6. product_meta
CREATE TABLE IF NOT EXISTS product_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  meta_key text NOT NULL,
  meta_value text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_meta_product ON product_meta(product_id);

-- Trigger: update products.stock and product_variants.stock from stock_movements
CREATE OR REPLACE FUNCTION update_stock_totals() RETURNS trigger AS $$
BEGIN
  UPDATE products SET stock = COALESCE((
    SELECT SUM(qty) FROM stock_movements WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  ), 0), updated_at = now() WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  IF COALESCE(NEW.variant_id, OLD.variant_id) IS NOT NULL THEN
    UPDATE product_variants SET stock = COALESCE((
      SELECT SUM(qty) FROM stock_movements WHERE variant_id = COALESCE(NEW.variant_id, OLD.variant_id)
    ), 0) WHERE id = COALESCE(NEW.variant_id, OLD.variant_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock_totals ON stock_movements;
CREATE TRIGGER trg_update_stock_totals
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_stock_totals();

-- RLS: admin-only for products, variants, images, categories, stock_movements, product_meta
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins categories" ON categories;
CREATE POLICY "admins categories" ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins products" ON products;
CREATE POLICY "admins products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins product_variants" ON product_variants;
CREATE POLICY "admins product_variants" ON product_variants FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins product_images" ON product_images;
CREATE POLICY "admins product_images" ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins stock_movements" ON stock_movements;
CREATE POLICY "admins stock_movements" ON stock_movements FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "admins product_meta" ON product_meta;
CREATE POLICY "admins product_meta" ON product_meta FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Public read for categories and products (storefront)
DROP POLICY IF EXISTS "public read categories" ON categories;
CREATE POLICY "public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read products" ON products;
CREATE POLICY "public read products" ON products FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public read product_variants" ON product_variants;
CREATE POLICY "public read product_variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read product_images" ON product_images;
CREATE POLICY "public read product_images" ON product_images FOR SELECT USING (true);
