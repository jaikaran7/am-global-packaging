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

    const movementType = parsed.data.movement_type;
    const absQty = Math.abs(parsed.data.qty);

    // Incoming: does NOT affect Available; only increases incoming_stock until approved/received
    if (movementType === "incoming") {
      const { data: v } = await supabase
        .from("product_variants")
        .select("incoming_stock")
        .eq("id", variantId)
        .single();
      const newIncoming = (v?.incoming_stock ?? 0) + absQty;
      const { error: updErr } = await supabase
        .from("product_variants")
        .update({ incoming_stock: newIncoming })
        .eq("id", variantId);
      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }
      await supabase.from("stock_movements").insert({
        variant_id: variantId,
        product_id: variant.product_id,
        movement_type: "incoming",
        qty: 0,
        reference_type: parsed.data.reference_type ?? "manual",
        note: parsed.data.note ?? `Added ${absQty} to incoming (pending receive)`,
      });
      return NextResponse.json({
        variant_id: variantId,
        movement_type: "incoming",
        incoming_stock: newIncoming,
      });
    }

    const qty =
      movementType === "outgoing" || movementType === "order_reserved"
        ? -absQty
        : absQty;

    const { data, error } = await supabase
      .from("stock_movements")
      .insert([{
        variant_id: variantId,
        product_id: variant.product_id,
        movement_type: movementType,
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
