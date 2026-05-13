import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  movement_type: z.enum(["purchase_in", "production_in"]).optional().default("purchase_in"),
  note: z.string().optional(),
});

/**
 * Receive incoming stock: decrease incoming_stock, increase available stock (via stock_movement).
 * Call this when goods are physically received.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      const msg =
        (Array.isArray(err.formErrors) && err.formErrors[0]) ||
        Object.values(err.fieldErrors ?? {}).flat().find(Boolean) ||
        "Validation failed";
      return NextResponse.json({ error: String(msg) }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: variant, error: fetchErr } = await supabase
      .from("product_variants")
      .select("id, product_id, incoming_stock")
      .eq("id", variantId)
      .single();

    if (fetchErr || !variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const incoming = variant.incoming_stock ?? 0;
    const toReceive = parsed.data.quantity;
    if (toReceive > incoming) {
      return NextResponse.json(
        { error: `Cannot receive ${toReceive} units; only ${incoming} incoming.` },
        { status: 400 }
      );
    }

    const newIncoming = incoming - toReceive;
    const { error: updErr } = await supabase
      .from("product_variants")
      .update({ incoming_stock: newIncoming })
      .eq("id", variantId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    const note =
      parsed.data.note?.trim() ||
      `Received ${toReceive} units (${parsed.data.movement_type})`;
    const { error: moveErr } = await supabase.from("stock_movements").insert({
      variant_id: variantId,
      product_id: variant.product_id,
      movement_type: parsed.data.movement_type,
      qty: toReceive,
      reference_type: "receive",
      note,
    });

    if (moveErr) {
      return NextResponse.json({ error: moveErr.message }, { status: 500 });
    }

    const { data: updated } = await supabase
      .from("product_variants")
      .select("id, stock, incoming_stock")
      .eq("id", variantId)
      .single();

    return NextResponse.json({
      success: true,
      variant: updated,
      received: toReceive,
    });
  } catch (e) {
    console.error("[admin/variants/:variantId/stock/receive] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
