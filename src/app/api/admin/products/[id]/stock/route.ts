import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  movement_type: z.enum(["incoming", "outgoing", "adjustment", "order_reserved", "order_released"]),
  qty: z.number().int(),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: product } = await supabase.from("products").select("id").eq("id", id).single();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const qty = parsed.data.movement_type === "outgoing" || parsed.data.movement_type === "order_reserved"
      ? -Math.abs(parsed.data.qty)
      : Math.abs(parsed.data.qty);

    const { data, error } = await supabase
      .from("stock_movements")
      .insert([{
        product_id: id,
        movement_type: parsed.data.movement_type,
        qty,
        reference_type: "manual",
        note: parsed.data.note ?? null,
      }])
      .select()
      .single();

    if (error) {
      console.error("[admin/products/:id/stock] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products/:id/stock] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
