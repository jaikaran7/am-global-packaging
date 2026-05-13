import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { audFromStoredVariant, displayCurrencyForStored } from "@/lib/currency-usd-aud";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: product, error } = await supabase
      .from("products")
      .select("id, title, slug, category_id, description, short_description, marketing_text, active, featured, meta, product_line, created_at")
      .eq("slug", slug)
      .eq("product_line", "papers")
      .eq("active", true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [categoryRes, variantsRes, imagesRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug").eq("id", product.category_id ?? "").maybeSingle(),
      supabase
        .from("product_variants")
        .select("id, product_id, name, sku, price, gsm, dimensions, size_label, unit_label, currency, tax_rate_percent, tax_inclusive, min_order_quantity, max_order_quantity, weight_grams, is_available, is_primary, stock, moq, stock_warning_threshold")
        .eq("product_id", product.id)
        .order("gsm", { ascending: true }),
      supabase
        .from("product_images")
        .select("id, product_id, variant_id, url, is_primary")
        .eq("product_id", product.id),
    ]);

    const variantsRaw = variantsRes.data ?? [];
    const images = imagesRes.data ?? [];

    const variants = variantsRaw.map((v) => ({
      ...v,
      price: audFromStoredVariant(v.price, v.currency),
      currency: displayCurrencyForStored(v.currency),
    }));

    const prices = variants.map((v) => v.price).filter(Boolean);
    const lowestPrice = prices.length ? Math.min(...prices) : 0;
    const highestPrice = prices.length ? Math.max(...prices) : 0;
    const gsmOptions = [...new Set(variants.map((v) => v.gsm).filter(Boolean))].sort((a, b) => a! - b!) as number[];

    const meta = product.meta as Record<string, unknown> ?? {};

    return NextResponse.json({
      ...product,
      category: categoryRes.data ?? null,
      variants: variants.map((v) => ({
        ...v,
        is_in_stock: (v.stock ?? 0) > (v.stock_warning_threshold ?? 0),
        is_low_stock: (v.stock ?? 0) > 0 && (v.stock ?? 0) <= (v.stock_warning_threshold ?? 5),
        stock_status:
          (v.stock ?? 0) === 0 ? "out_of_stock"
          : (v.stock ?? 0) <= (v.stock_warning_threshold ?? 5) ? "low_stock"
          : "in_stock",
      })),
      images,
      lowest_price: lowestPrice,
      highest_price: highestPrice,
      gsm_options: gsmOptions,
      feature_badges: (meta.feature_badges as string[]) ?? [],
      tags: (meta.tags as string[]) ?? [],
      paper_type: (meta.paper_type as string) ?? null,
      size_label: (meta.size_label as string) ?? null,
      dimensions_label: (meta.dimensions as string) ?? null,
      use_cases: (meta.use_cases as string[]) ?? [],
    });
  } catch (e) {
    console.error("[api/papers/products/[slug]] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
