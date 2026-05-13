/**
 * Import product definitions from repo (src/data/products.ts) into Supabase.
 * Run: npx tsx scripts/import-products-from-repo.ts
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const categorySlugToDbSlug: Record<string, string> = {
  "pizza-boxes": "pizza-boxes",
  "general-purpose": "a4-boxes",
  specialty: "specialty-heavy-duty",
  ecommerce: "e-commerce",
  "vegetable-boxes": "vegetable-boxes",
  "poultry-boxes": "poultry-boxes",
};

function parseMoq(moq: string): number {
  const n = parseInt(moq.replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 1 : n;
}

function parsePly(plyOptions: string[]): number | null {
  if (!plyOptions.length) return null;
  const first = plyOptions[0];
  const m = first.match(/(\d)/);
  return m ? parseInt(m[1], 10) : null;
}

async function main() {
  // Dynamic import so we can run from repo root without bundling the whole app
  const { products } = await import("../src/data/products").catch(() => {
    console.error("Could not load src/data/products. Run from repo root and ensure the file exists.");
    process.exit(1);
  });

  const { data: categories } = await supabase.from("categories").select("id, slug");
  const slugToId = Object.fromEntries((categories ?? []).map((c) => [c.slug, c.id]));

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const p of products) {
    const dbCategorySlug = categorySlugToDbSlug[p.category];
    const category_id = dbCategorySlug ? slugToId[dbCategorySlug] ?? null : null;

    const d = p.dimensionDetail;
    const dimensions = d
      ? { length_mm: d.length, width_mm: d.width, height_mm: d.height }
      : null;

    const row = {
      title: p.name,
      sku: null as string | null,
      slug: p.slug,
      category_id,
      short_description: p.tagline,
      description: p.description,
      price: p.priceAud ?? 0,
      moq: parseMoq(p.moq),
      active: true,
      featured: false,
      dimensions,
      gsm: null as number | null,
      ply: parsePly(p.plyOptions),
      unit: "unit",
    };

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", p.slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("products")
        .update({
          title: row.title,
          category_id: row.category_id,
          short_description: row.short_description,
          description: row.description,
          price: row.price,
          moq: row.moq,
          dimensions: row.dimensions,
          ply: row.ply,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) errors.push(`${p.slug}: ${error.message}`);
      else updated++;
    } else {
      const { error } = await supabase.from("products").insert([row]).select("id").single();

      if (error) errors.push(`${p.slug}: ${error.message}`);
      else created++;
    }
  }

  console.log("Import summary:");
  console.log("  Created:", created);
  console.log("  Updated:", updated);
  if (errors.length) {
    console.log("  Errors:", errors.length);
    errors.forEach((e) => console.log("   -", e));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
