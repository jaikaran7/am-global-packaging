import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/schemas/product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("products")
      .select("id, title, slug, category_id, short_description, marketing_text, active, featured, meta, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq("category_id", category);
    if (status === "active") query = query.eq("active", true);
    if (status === "inactive") query = query.eq("active", false);
    if (search?.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,short_description.ilike.%${search.trim()}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("[admin/products] list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const productIds = (products ?? []).map((p) => p.id);

    const [categoriesRes, variantsRes, imagesRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug"),
      productIds.length
        ? supabase.from("product_variants").select("id, product_id, name, sku, price, dimensions, is_primary").in("product_id", productIds)
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase.from("product_images").select("id, product_id, variant_id, url, is_primary").in("product_id", productIds)
        : Promise.resolve({ data: [] }),
    ]);

    const categoryMap = Object.fromEntries((categoriesRes.data ?? []).map((c) => [c.id, c]));

    type VariantRow = NonNullable<typeof variantsRes.data>[number];
    type ImageRow = NonNullable<typeof imagesRes.data>[number];

    const variantsByProduct: Record<string, VariantRow[]> = {};
    for (const v of variantsRes.data ?? []) {
      if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
      variantsByProduct[v.product_id].push(v);
    }

    const imagesByProduct: Record<string, ImageRow[]> = {};
    for (const img of imagesRes.data ?? []) {
      if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
      imagesByProduct[img.product_id].push(img);
    }

    const items = (products ?? []).map((p) => {
      const variants = variantsByProduct[p.id] ?? [];
      const variant_count = variants.length;
      const representative_variant = variants.find((v) => v.is_primary) ?? variants[0] ?? null;

      const images = imagesByProduct[p.id] ?? [];
      const primaryImage = images.find((i) => i.is_primary && (!representative_variant || i.variant_id === representative_variant.id))
        ?? images.find((i) => i.is_primary)
        ?? images[0]
        ?? null;

      return {
        ...p,
        category: p.category_id ? categoryMap[p.category_id] : null,
        variant_count,
        representative_variant,
        primary_image_url: primaryImage?.url ?? null,
      };
    });

    return NextResponse.json({ items, total: count ?? 0, page, limit });
  } catch (e) {
    console.error("[admin/products] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const slug = parsed.data.slug?.trim() || parsed.data.title.toLowerCase().replaceAll(/\s+/g, "-").replaceAll(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("products")
      .insert([{
        title: parsed.data.title,
        slug,
        category_id: parsed.data.category_id || null,
        short_description: parsed.data.short_description || null,
        marketing_text: parsed.data.marketing_text || null,
        active: parsed.data.active,
        featured: parsed.data.featured,
        meta: parsed.data.meta || null,
      }])
      .select()
      .single();

    if (error) {
      console.error("[admin/products] create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
