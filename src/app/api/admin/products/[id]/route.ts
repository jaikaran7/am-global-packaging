import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/schemas/product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title, slug, category_id, short_description, marketing_text, active, featured, meta, created_at, updated_at")
      .eq("id", id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [variantsRes, imagesRes, categoryRes] = await Promise.all([
      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .order("is_primary", { ascending: false })
        .order("name"),
      supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      product.category_id
        ? supabase.from("categories").select("id, name, slug").eq("id", product.category_id).single()
        : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json({
      ...product,
      category: categoryRes.data ?? null,
      variants: variantsRes.data ?? [],
      images: imagesRes.data ?? [],
    });
  } catch (e) {
    console.error("[admin/products/:id] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.title != null) update.title = parsed.data.title;
    if (parsed.data.slug != null) update.slug = parsed.data.slug;
    if (parsed.data.category_id !== undefined) update.category_id = parsed.data.category_id;
    if (parsed.data.short_description !== undefined) update.short_description = parsed.data.short_description;
    if (parsed.data.marketing_text !== undefined) update.marketing_text = parsed.data.marketing_text;
    if (parsed.data.active !== undefined) update.active = parsed.data.active;
    if (parsed.data.featured !== undefined) update.featured = parsed.data.featured;
    if (parsed.data.meta !== undefined) update.meta = parsed.data.meta;

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin/products/:id] PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products/:id] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("[admin/products/:id] DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/products/:id] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
