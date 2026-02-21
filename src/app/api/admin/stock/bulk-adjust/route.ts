import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bulkSchema = z.object({
  variant_ids: z.array(z.string().uuid()).min(1, "Select at least one variant"),
  action: z.enum(["add", "remove", "set"]),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { variant_ids, action, quantity, reason } = parsed.data;
    const supabase = createAdminClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("id, product_id, stock")
      .in("id", variant_ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reasonText = reason?.trim();
    const noteSuffix = reasonText ? `: ${reasonText}` : "";
    const movements = (variants ?? [])
      .map((variant) => {
        const current = Number(variant.stock ?? 0);
        let qty = quantity;
        if (action === "remove") qty = -quantity;
        if (action === "set") qty = quantity - current;
        if (qty === 0) return null;
        return {
          product_id: variant.product_id,
          variant_id: variant.id,
          movement_type: "adjustment",
          qty,
          reference_type: "bulk",
          note: `Bulk ${action} ${quantity} units${noteSuffix}`,
        };
      })
      .filter(Boolean);

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
