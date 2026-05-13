import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/schemas/product";
import { getPapersMarketingImageUrl } from "@/lib/papers-marketing-images";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const productLine = searchParams.get("product_line");
    const paperSizeParam = searchParams.get("paper_size"); // meta.size_label — papers only (e.g. A4)
    const gsmParam = searchParams.get("gsm");
    const plyParam = searchParams.get("ply"); // boxes only: 3 | 5 | 7
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    async function productIdsFromVariantFilter(opts: { gsm?: number; ply?: number }): Promise<string[]> {
      let vq = supabase.from("product_variants").select("product_id");
      if (opts.gsm != null) vq = vq.eq("gsm", opts.gsm);
      if (opts.ply != null) vq = vq.eq("ply", opts.ply);
      const { data: vrows } = await vq;
      const raw = [...new Set((vrows ?? []).map((r) => r.product_id))];
      if (raw.length === 0) return [];
      let pq = supabase.from("products").select("id").in("id", raw);
      if (productLine === "papers" || productLine === "boxes") {
        pq = pq.eq("product_line", productLine) as typeof pq;
      }
      const { data: prows } = await pq;
      return (prows ?? []).map((p) => p.id);
    }

    let variantRestrictedIds: string[] | null = null;
    if (productLine === "papers" && gsmParam?.trim()) {
      const g = Number.parseInt(gsmParam, 10);
      if (!Number.isNaN(g)) variantRestrictedIds = await productIdsFromVariantFilter({ gsm: g });
    } else if (productLine === "boxes" && plyParam?.trim()) {
      const pl = Number.parseInt(plyParam, 10);
      if (!Number.isNaN(pl)) variantRestrictedIds = await productIdsFromVariantFilter({ ply: pl });
    }

    if (variantRestrictedIds !== null && variantRestrictedIds.length === 0) {
      return NextResponse.json({ items: [], total: 0, page, limit });
    }

    let query = supabase
      .from("products")
      .select("id, title, slug, category_id, short_description, marketing_text, active, featured, meta, product_line, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq("category_id", category);
    if (status === "active") query = query.eq("active", true);
    if (status === "inactive") query = query.eq("active", false);
    if (productLine === "papers" || productLine === "boxes") query = query.eq("product_line", productLine);
    if (productLine === "papers" && paperSizeParam?.trim()) {
      query = query.eq("meta->>size_label", paperSizeParam.trim());
    }
    if (variantRestrictedIds !== null) {
      query = query.in("id", variantRestrictedIds);
    }
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

      const category = p.category_id ? categoryMap[p.category_id] : null;
      const meta = p.meta as Record<string, unknown> | null | undefined;
      const primaryUrl =
        primaryImage?.url ??
        (p.product_line === "papers"
          ? getPapersMarketingImageUrl(meta, category?.slug ?? null)
          : null);

      return {
        ...p,
        category: category ?? null,
        variant_count,
        representative_variant,
        primary_image_url: primaryUrl,
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
        product_line: parsed.data.product_line ?? "boxes",
      }])
      .select()
      .single();

    if (error) {
      console.error("[admin/products] create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.product_line === "papers") {
      let categorySlug: string | null = null;
      if (parsed.data.category_id) {
        const { data: catRow } = await supabase
          .from("categories")
          .select("slug")
          .eq("id", parsed.data.category_id)
          .maybeSingle();
        categorySlug = catRow?.slug ?? null;
      }
      const url = getPapersMarketingImageUrl(
        (parsed.data.meta ?? data.meta) as Record<string, unknown> | null | undefined,
        categorySlug
      );
      const { error: imgErr } = await supabase.from("product_images").insert([
        {
          product_id: data.id,
          variant_id: null,
          storage_path: `static/papers/${data.id}`,
          url,
          alt: data.title,
          is_primary: true,
          sort_order: 0,
        },
      ]);
      if (imgErr) {
        console.error("[admin/products] default paper image insert:", imgErr);
      }
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
