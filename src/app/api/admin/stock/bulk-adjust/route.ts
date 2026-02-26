import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bulkItemSchema = z.object({
  variant_id: z.string().uuid(),
  quantity: z.number().int().min(0),
});

const bulkSchema = z.object({
  variant_ids: z.array(z.string().uuid()).optional(),
  action: z.enum(["add", "remove", "set"]).optional(),
  quantity: z.number().int().min(0).optional(),
  reason: z.string().optional().or(z.literal("")),
  /** Mode B: per-item quantities. If provided, overrides variant_ids + quantity. */
  items: z.array(bulkItemSchema).optional(),
}).refine(
  (data) =>
    (Array.isArray(data.items) && data.items.length > 0) ||
    (Array.isArray(data.variant_ids) && data.variant_ids.length > 0 && data.quantity !== undefined),
  { message: "Provide either items (per-variant qty) or variant_ids + quantity" }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      const msg =
        (Array.isArray(err.formErrors) && err.formErrors[0]) ||
        Object.values(err.fieldErrors ?? {}).flat().find(Boolean) ||
        "Validation failed";
      return NextResponse.json({ error: String(msg) }, { status: 400 });
    }

    const { variant_ids, action, quantity, reason, items: perItemQuantities } = parsed.data;
    const supabase = createAdminClient();

    const reasonText = reason?.trim();
    const noteSuffix = reasonText ? `: ${reasonText}` : "";

    let movements: Array<{ product_id: string; variant_id: string; movement_type: string; qty: number; reference_type: string; note: string }>;

    if (Array.isArray(perItemQuantities) && perItemQuantities.length > 0) {
      // Mode B: different quantity per item
      const variantIds = perItemQuantities.map((i) => i.variant_id);
      const { data: variants, error } = await supabase
        .from("product_variants")
        .select("id, product_id, stock")
        .in("id", variantIds);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const variantMap = Object.fromEntries((variants ?? []).map((v) => [v.id, v]));

      movements = perItemQuantities
        .map((item) => {
          const variant = variantMap[item.variant_id];
          if (!variant || item.quantity <= 0) return null;
          return {
            product_id: variant.product_id,
            variant_id: variant.id,
            movement_type: "adjustment",
            qty: item.quantity,
            reference_type: "bulk",
            note: `Bulk add ${item.quantity} units${noteSuffix}`,
          };
        })
        .filter(Boolean) as typeof movements;
    } else {
      // Mode A: same quantity for all
      const qty = quantity ?? 0;
      if (qty < 1) {
        return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
      }
      const { data: variants, error } = await supabase
        .from("product_variants")
        .select("id, product_id, stock")
        .in("id", variant_ids ?? []);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      movements = (variants ?? [])
        .map((variant) => {
          const current = Number(variant.stock ?? 0);
          let delta = qty;
          if (action === "remove") delta = -qty;
          if (action === "set") delta = qty - current;
          if (delta === 0) return null;
          return {
            product_id: variant.product_id,
            variant_id: variant.id,
            movement_type: "adjustment",
            qty: delta,
            reference_type: "bulk",
            note: `Bulk ${action} ${qty} units${noteSuffix}`,
          };
        })
        .filter(Boolean) as typeof movements;
    }

    if (movements.length === 0) {
      return NextResponse.json({ success: true, adjusted: 0 });
    }

    const { error: insertErr } = await supabase.from("stock_movements").insert(movements);
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, adjusted: movements.length });
  } catch (e) {
    console.error("[admin/stock/bulk-adjust] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
