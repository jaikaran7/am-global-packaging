import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from("products")
      .select("id, title, slug, category_id, short_description, marketing_text, active, featured, created_at")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category_id", category);
    if (search?.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,short_description.ilike.%${search.trim()}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("[api/products] list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const productIds = (products ?? []).map((p) => p.id);

    const [categoriesRes, variantsRes, imagesRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug"),
      productIds.length
        ? supabase.from("product_variants").select("id, product_id, name, sku, price, dimensions, is_primary, stock").in("product_id", productIds)
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase.from("product_images").select("id, product_id, variant_id, url, is_primary").in("product_id", productIds)
        : Promise.resolve({ data: [] }),
    ]);

    const categoryMap = Object.fromEntries((categoriesRes.data ?? []).map((c) => [c.id, c]));

    type VariantRow = { id: string; product_id: string; name: string; sku: string | null; price: number; dimensions: { length_mm?: number; width_mm?: number; height_mm?: number } | null; is_primary: boolean; stock: number };
    const variantsByProduct: Record<string, VariantRow[]> = {};
    for (const v of (variantsRes.data ?? []) as VariantRow[]) {
      if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
      variantsByProduct[v.product_id].push(v);
    }

    type ImageRow = { id: string; product_id: string; variant_id: string | null; url: string; is_primary: boolean };
    const imagesByProduct: Record<string, ImageRow[]> = {};
    for (const img of (imagesRes.data ?? []) as ImageRow[]) {
      if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
      imagesByProduct[img.product_id].push(img);
    }

    const items = (products ?? []).map((p) => {
      const variants = variantsByProduct[p.id] ?? [];
      const variant_count = variants.length;
      const representative_variant = variants.find((v) => v.is_primary) ?? variants[0] ?? null;

      const images = imagesByProduct[p.id] ?? [];
      const primaryImage =
        images.find((i) => i.is_primary && representative_variant && i.variant_id === representative_variant.id)
        ?? images.find((i) => i.is_primary)
        ?? images[0]
        ?? null;

      const lowestPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
      const totalStock = variants.reduce((acc, v) => acc + (v.stock ?? 0), 0);

      return {
        ...p,
        category: p.category_id ? categoryMap[p.category_id] : null,
        variant_count,
        representative_variant,
        primary_image_url: primaryImage?.url ?? null,
        lowest_price: lowestPrice,
        total_stock: totalStock,
      };
    });

    return NextResponse.json({ items, categories: categoriesRes.data ?? [] });
  } catch (e) {
    console.error("[api/products] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
