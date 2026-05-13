import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { products } from "@/data/products";

const categorySlugToDbSlug: Record<string, string> = {
  "pizza-boxes": "pizza-boxes",
  "general-purpose": "a4-boxes",
  specialty: "specialty-heavy-duty",
  ecommerce: "e-commerce",
  "vegetable-boxes": "vegetable-boxes",
  "poultry-boxes": "poultry-boxes",
};

function parseMoq(moq: string): number {
  const n = Number.parseInt(moq.replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 1 : n;
}

function parsePly(plyOptions: string[]): number | null {
  if (!plyOptions.length) return null;
  const first = plyOptions[0];
  const m = first.match(/(\d)/);
  return m ? Number.parseInt(m[1], 10) : null;
}

/**
 * POST /api/admin/products/import-repo
 * Syncs products from src/data/products into the DB (create or update by slug).
 */
export async function POST() {
  try {
    const supabase = createAdminClient();
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

    return NextResponse.json({ created, updated, errors });
  } catch (e) {
    console.error("[admin/products/import-repo] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
