# Admin Products Management

Product management module for AM Global Packaging Solutions with variant-centric architecture: products hold marketing info, variants hold specs/pricing/stock.

## Architecture

- **Products**: Marketing-level entity (title, slug, category, short_description, marketing_text, featured, active)
- **Variants**: Specification-level entity (name, sku, price, moq, dimensions, gsm, ply, stock, technical_spec)
- **Images**: Stored per product or per variant (variant_id optional)
- **Stock**: Tracked per variant via stock_movements ledger

## Setup

1. **Environment**
   - Set `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

2. **Database migrations** (run in order)
   ```bash
   # Option A: Supabase CLI
   supabase db push

   # Option B: SQL Editor - run each file:
   # supabase/migrations/20250220100000_create_products_schema.sql
   # supabase/migrations/20250220200000_refactor_variants_stock.sql
   # supabase/migrations/20250220210000_seed_products_variants.sql
   ```

3. **Storage bucket**
   - In Supabase Dashboard → Storage: create bucket `product-images` and make it **public**.

4. **Admin access**
   - Create user in Supabase Auth, then:
     ```sql
     INSERT INTO admins (id, role, display_name)
     VALUES ('<auth.users.id>', 'superadmin', 'Admin');
     ```

## Database schema

### Products table (marketing level)
- `id`, `title`, `slug`, `category_id`, `short_description`, `marketing_text`, `featured`, `active`, `meta`

### Product_variants table (spec level)
- `id`, `product_id`, `name`, `sku`, `price`, `moq`, `dimensions`, `gsm`, `ply`, `stock`, `stock_warning_threshold`, `technical_spec`, `is_primary`

### Triggers
- `trg_update_variant_stock`: Updates `product_variants.stock` when `stock_movements` changes
- `trg_single_primary_variant`: Ensures only one variant is `is_primary` per product

## Seed data

The migration `20250220210000_seed_products_variants.sql` creates:

| Category | Product | Variants |
|----------|---------|----------|
| Pizza Boxes | Pizza Box | Small, Medium, Large, Extra-Large, Family (5 types) |
| A4 Boxes | A4 Box | Type 1-4 (4 types) |
| Specialty & Heavy Duty | Tea Chest Box | Standard, Large (2 types) |
| E-Commerce | E-Commerce Mailer | Small, Medium, Large (3 types) |

## Admin UI workflows

### View products
- `/admin/products` shows one card per product with variant count badge
- Sidebar is sticky, grid scrolls independently
- Click product → edit page with variants

### Create product (from category)
1. Go to `/admin/products/new?category=<category_id>`
2. Fill product-level fields (title, description, marketing text)
3. Save → redirected to edit page
4. Add variants with specs, pricing, images, stock

### Edit product
- `/admin/products/[id]` shows:
  - Product info form (product-level fields)
  - Product images section
  - Variants section with add/edit/delete
  - Per-variant: images, stock adjustments

### Variant management
- Each variant has: name, SKU, price, MOQ, dimensions, GSM, ply, stock
- Set one variant as "primary" (representative for product listings)
- Upload images per variant
- Adjust stock per variant (creates stock_movement records)

## API endpoints

### Products (admin)
- `GET /api/admin/products` — list with `variant_count`, `representative_variant`
- `POST /api/admin/products` — create product (product-level fields)
- `GET /api/admin/products/[id]` — product + variants + images
- `PATCH /api/admin/products/[id]` — update product-level fields
- `DELETE /api/admin/products/[id]` — delete (cascades variants)

### Variants (admin)
- `GET /api/admin/products/[id]/variants` — list variants
- `POST /api/admin/products/[id]/variants` — create variant
- `GET /api/admin/variants/[variantId]` — get variant
- `PATCH /api/admin/variants/[variantId]` — update variant
- `DELETE /api/admin/variants/[variantId]` — delete variant

### Stock (admin)
- `POST /api/admin/variants/[variantId]/stock` — record movement

### Images (admin)
- `POST /api/admin/products/[id]/images` — upload (accepts `variant_id`)
- `PATCH/DELETE /api/admin/products/[id]/images/[imageId]`

### Categories (admin)
- `GET/POST /api/admin/categories`
- `PATCH/DELETE /api/admin/categories/[id]`

### Public API
- `GET /api/products` — list products with variant_count, lowest_price
- `GET /api/products/[slug]` — product detail with all variants

## Import scripts

### From repo data
```bash
npx tsx scripts/import-products-from-repo.ts
```

### Via API
```bash
curl -X POST /api/admin/products/import-repo
curl -X POST /api/admin/products/import-csv -F file=@products.csv
```

## Testing locally

1. `npm run dev`
2. Run migrations in Supabase
3. Log in at `/admin/login`
4. Navigate to `/admin/products`
5. Verify seed data appears (4 products, 14 total variants)
6. Test create/edit/delete workflows

## Key differences from previous version

1. **Products no longer have price/dimensions/stock** — these live on variants
2. **Stock is per variant** — `stock_movements.variant_id` is the key
3. **One card per product** in listings — shows `variant_count` badge
4. **Primary variant** — each product has one `is_primary` variant for representative display
5. **Public API** returns aggregates (`lowest_price`, `total_stock`, `variant_count`)
