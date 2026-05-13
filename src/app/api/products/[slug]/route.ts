import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: product, error } = await supabase
      .from("products")
      .select("id, title, slug, category_id, short_description, marketing_text, active, featured, created_at")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [categoryRes, variantsRes, imagesRes] = await Promise.all([
      product.category_id
        ? supabase.from("categories").select("id, name, slug").eq("id", product.category_id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from("product_variants")
        .select("id, name, sku, price, moq, dimensions, gsm, ply, stock, stock_warning_threshold, is_primary, technical_spec")
        .eq("product_id", product.id)
        .order("is_primary", { ascending: false })
        .order("name"),
      supabase
        .from("product_images")
        .select("id, variant_id, url, alt, is_primary, sort_order")
        .eq("product_id", product.id)
        .order("sort_order"),
    ]);

    const variants = (variantsRes.data ?? []).map((v) => ({
      ...v,
      images: (imagesRes.data ?? []).filter((img) => img.variant_id === v.id),
    }));

    const productImages = (imagesRes.data ?? []).filter((img) => !img.variant_id);

    return NextResponse.json({
      ...product,
      category: categoryRes.data ?? null,
      variants,
      images: productImages,
    });
  } catch (e) {
    console.error("[api/products/:slug] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
