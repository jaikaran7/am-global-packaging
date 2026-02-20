import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productVariantSchema } from "@/lib/schemas/product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("is_primary", { ascending: false })
      .order("name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("[admin/products/:id/variants] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    const parsed = productVariantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("product_variants")
      .insert([{
        product_id: productId,
        name: parsed.data.name,
        sku: parsed.data.sku ?? null,
        price: parsed.data.price ?? 0,
        moq: parsed.data.moq ?? 1,
        dimensions: parsed.data.dimensions ?? null,
        gsm: parsed.data.gsm ?? null,
        ply: parsed.data.ply ?? null,
        technical_spec: parsed.data.technical_spec ?? null,
        is_primary: parsed.data.is_primary ?? false,
        stock_warning_threshold: parsed.data.stock_warning_threshold ?? 5,
      }])
      .select()
      .single();

    if (error) {
      console.error("[admin/products/:id/variants] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products/:id/variants] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
