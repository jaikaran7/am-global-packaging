import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const stockStatus = searchParams.get("status"); // in_stock, low_stock, out_of_stock
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select(
        "id, product_id, name, sku, price, stock, reserved_stock, incoming_stock, stock_warning_threshold, is_primary, created_at, updated_at"
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const productIds = [...new Set((variants ?? []).map((v) => v.product_id))];

    const [productsRes, imagesRes, categoriesRes] = await Promise.all([
      productIds.length
        ? supabase
            .from("products")
            .select("id, title, slug, category_id")
            .in("id", productIds)
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase
            .from("product_images")
            .select("id, product_id, variant_id, url, is_primary")
            .in("product_id", productIds)
        : Promise.resolve({ data: [] }),
      supabase.from("categories").select("id, name, slug"),
    ]);

    const productMap = Object.fromEntries(
      (productsRes.data ?? []).map((p) => [p.id, p])
    );
    const categoryMap = Object.fromEntries(
      (categoriesRes.data ?? []).map((c) => [c.id, c])
    );
    const imageMap: Record<string, string> = {};
    for (const img of imagesRes.data ?? []) {
      if (img.variant_id && img.is_primary && img.url) {
        imageMap[img.variant_id] = img.url;
      }
    }
    for (const img of imagesRes.data ?? []) {
      if (img.is_primary && img.url && img.product_id && !imageMap[img.product_id]) {
        imageMap[`product_${img.product_id}`] = img.url;
      }
    }

    let items = (variants ?? []).map((v) => {
      const product = productMap[v.product_id];
      const cat = product?.category_id ? categoryMap[product.category_id] : null;
      const available = v.stock ?? 0;
      const reserved = v.reserved_stock ?? 0;
      const incoming = v.incoming_stock ?? 0;
      const remaining = available - reserved;
      const threshold = v.stock_warning_threshold ?? 5;

      let status: "in_stock" | "low_stock" | "out_of_stock";
      if (remaining <= 0) status = "out_of_stock";
      else if (remaining <= threshold) status = "low_stock";
      else status = "in_stock";

      return {
        id: v.id,
        product_id: v.product_id,
        product_title: product?.title ?? "Unknown",
        product_slug: product?.slug ?? "",
        category_id: product?.category_id ?? null,
        category_name: cat?.name ?? "Uncategorized",
        variant_name: v.name ?? "Default",
        sku: v.sku,
        price: v.price,
        available,
        reserved,
        incoming,
        remaining,
        threshold,
        status,
        image_url: imageMap[v.id] ?? imageMap[`product_${v.product_id}`] ?? null,
        is_primary: v.is_primary,
      };
    });

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.product_title.toLowerCase().includes(q) ||
          i.variant_name.toLowerCase().includes(q) ||
          i.sku?.toLowerCase().includes(q) ||
          i.category_name.toLowerCase().includes(q)
      );
    }
    if (category) {
      items = items.filter((i) => i.category_id === category);
    }
    if (stockStatus === "in_stock") items = items.filter((i) => i.status === "in_stock");
    if (stockStatus === "low_stock") items = items.filter((i) => i.status === "low_stock");
    if (stockStatus === "out_of_stock") items = items.filter((i) => i.status === "out_of_stock");

    const total = items.length;
    const paged = items.slice(offset, offset + limit);

    return NextResponse.json({ items: paged, total, page, limit });
  } catch (e) {
    console.error("[admin/stock] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
