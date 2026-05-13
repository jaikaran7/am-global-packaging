import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stockAdjustSchema } from "@/lib/schemas/order";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = stockAdjustSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      const msg =
        (Array.isArray(err.formErrors) && err.formErrors[0]) ||
        Object.values(err.fieldErrors ?? {}).flat().find(Boolean) ||
        "Validation failed";
      return NextResponse.json({ error: String(msg) }, { status: 400 });
    }

    const { variant_id, type, quantity, reason } = parsed.data;
    const supabase = createAdminClient();

    const { data: variant } = await supabase
      .from("product_variants")
      .select("id, product_id, stock, name")
      .eq("id", variant_id)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const qty = type === "add" ? quantity : -quantity;

    const reasonText = reason?.trim();
    const noteSuffix = reasonText ? `: ${reasonText}` : "";
    const { error: moveErr } = await supabase.from("stock_movements").insert({
      product_id: variant.product_id,
      variant_id,
      movement_type: "adjustment",
      qty,
      reference_type: "manual",
      note: `${type === "add" ? "Added" : "Removed"} ${quantity} units${noteSuffix}`,
    });

    if (moveErr) {
      return NextResponse.json({ error: moveErr.message }, { status: 500 });
    }

    // The trigger fn_update_variant_stock updates product_variants.stock automatically
    const { data: updated } = await supabase
      .from("product_variants")
      .select("id, stock, reserved_stock, incoming_stock, stock_warning_threshold")
      .eq("id", variant_id)
      .single();

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin/stock/adjust] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
