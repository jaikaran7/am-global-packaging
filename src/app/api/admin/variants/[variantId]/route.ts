import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productVariantSchema } from "@/lib/schemas/product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("*, product_images(*)")
      .eq("id", variantId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/variants/:variantId] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await req.json();
    const parsed = productVariantSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.name != null) update.name = parsed.data.name;
    if (parsed.data.sku !== undefined) update.sku = parsed.data.sku ?? null;
    if (parsed.data.price != null) update.price = parsed.data.price;
    if (parsed.data.moq != null) update.moq = parsed.data.moq;
    if (parsed.data.dimensions !== undefined) update.dimensions = parsed.data.dimensions;
    if (parsed.data.gsm !== undefined) update.gsm = parsed.data.gsm;
    if (parsed.data.ply !== undefined) update.ply = parsed.data.ply;
    if (parsed.data.technical_spec !== undefined) update.technical_spec = parsed.data.technical_spec;
    if (parsed.data.is_primary !== undefined) update.is_primary = parsed.data.is_primary;
    if (parsed.data.stock_warning_threshold != null) update.stock_warning_threshold = parsed.data.stock_warning_threshold;

    const { data, error } = await supabase
      .from("product_variants")
      .update(update)
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      console.error("[admin/variants/:variantId] PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/variants/:variantId] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);

    if (error) {
      console.error("[admin/variants/:variantId] DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/variants/:variantId] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
