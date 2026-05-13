-- Primary marketing images for paper products (same paths as storefront /public assets)

INSERT INTO product_images (product_id, variant_id, storage_path, url, alt, is_primary, sort_order)
SELECT
  p.id,
  NULL,
  'static/papers/' || p.id::text,
  CASE
    WHEN c.slug = 'marble-paper' OR COALESCE(p.meta->>'paper_type', '') = 'marble' THEN '/assets/papers/marble-02.png'
    ELSE '/assets/papers/cotton-01.png'
  END,
  p.title,
  true,
  0
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.product_line = 'papers'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);
