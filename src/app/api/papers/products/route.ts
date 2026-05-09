import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPapersMarketingImageUrl } from "@/lib/papers-marketing-images";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'cotton' | 'marble'
    const search = searchParams.get("search");

    let query = supabase
      .from("products")
      .select("id, title, slug, category_id, description, short_description, marketing_text, active, featured, meta, product_line, created_at")
      .eq("product_line", "papers")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: true });

    if (type) {
      query = query.eq("meta->>paper_type", type);
    }
    if (search?.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,short_description.ilike.%${search.trim()}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("[api/papers/products] list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const productIds = (products ?? []).map((p) => p.id);

    const [categoriesRes, variantsRes, imagesRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug"),
      productIds.length
        ? supabase
            .from("product_variants")
            .select("id, product_id, name, sku, price, gsm, dimensions, size_label, unit_label, currency, tax_rate_percent, tax_inclusive, min_order_quantity, max_order_quantity, weight_grams, is_available, is_primary, stock, moq")
            .in("product_id", productIds)
            .order("gsm", { ascending: true })
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase
            .from("product_images")
            .select("id, product_id, variant_id, url, is_primary")
            .in("product_id", productIds)
        : Promise.resolve({ data: [] }),
    ]);

    const categoryMap = Object.fromEntries((categoriesRes.data ?? []).map((c) => [c.id, c]));

    type VariantRow = {
      id: string; product_id: string; name: string; sku: string | null;
      price: number; gsm: number | null; dimensions: Record<string, number> | null;
      size_label: string | null; unit_label: string; currency: string;
      tax_rate_percent: number; tax_inclusive: boolean;
      min_order_quantity: number; max_order_quantity: number | null;
      weight_grams: number | null; is_available: boolean; is_primary: boolean; stock: number; moq: number;
    };

    type ImageRow = { id: string; product_id: string; variant_id: string | null; url: string; is_primary: boolean };

    const variantsByProduct: Record<string, VariantRow[]> = {};
    for (const v of (variantsRes.data ?? []) as VariantRow[]) {
      if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
      variantsByProduct[v.product_id].push(v);
    }

    const imagesByProduct: Record<string, ImageRow[]> = {};
    for (const img of (imagesRes.data ?? []) as ImageRow[]) {
      if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
      imagesByProduct[img.product_id].push(img);
    }

    const items = (products ?? []).map((p) => {
      const variants = variantsByProduct[p.id] ?? [];
      const primaryVariant = variants.find((v) => v.is_primary) ?? variants[0] ?? null;
      const prices = variants.map((v) => v.price).filter(Boolean);
      const lowestPrice = prices.length ? Math.min(...prices) : 0;
      const highestPrice = prices.length ? Math.max(...prices) : 0;
      const totalStock = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
      const gsmOptions = [...new Set(variants.map((v) => v.gsm).filter(Boolean))].sort((a, b) => a! - b!) as number[];

      const images = imagesByProduct[p.id] ?? [];
      const cat = p.category_id ? categoryMap[p.category_id] : null;
      const meta = p.meta as Record<string, unknown> ?? {};
      const primaryImageUrl =
        images.find((i) => i.is_primary)?.url ??
        images[0]?.url ??
        getPapersMarketingImageUrl(meta, cat?.slug ?? null);

      return {
        ...p,
        category: cat ?? null,
        variants,
        primary_variant: primaryVariant,
        variant_count: variants.length,
        primary_image_url: primaryImageUrl,
        images,
        lowest_price: lowestPrice,
        highest_price: highestPrice,
        total_stock: totalStock,
        gsm_options: gsmOptions,
        feature_badges: (meta.feature_badges as string[]) ?? [],
        tags: (meta.tags as string[]) ?? [],
        paper_type: (meta.paper_type as string) ?? null,
        size_label: (meta.size_label as string) ?? null,
        dimensions_label: (meta.dimensions as string) ?? null,
        use_cases: (meta.use_cases as string[]) ?? [],
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/papers/products] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
