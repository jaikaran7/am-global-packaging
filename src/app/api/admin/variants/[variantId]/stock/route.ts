import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  movement_type: z.enum(["incoming", "outgoing", "adjustment", "order_reserved", "order_released"]),
  qty: z.number().int(),
  reference_type: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: variant } = await supabase
      .from("product_variants")
      .select("id, product_id")
      .eq("id", variantId)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const qty =
      parsed.data.movement_type === "outgoing" || parsed.data.movement_type === "order_reserved"
        ? -Math.abs(parsed.data.qty)
        : Math.abs(parsed.data.qty);

    const { data, error } = await supabase
      .from("stock_movements")
      .insert([{
        variant_id: variantId,
        product_id: variant.product_id,
        movement_type: parsed.data.movement_type,
        qty,
        reference_type: parsed.data.reference_type ?? "manual",
        note: parsed.data.note ?? null,
      }])
      .select()
      .single();

    if (error) {
      console.error("[admin/variants/:variantId/stock] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/variants/:variantId/stock] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
