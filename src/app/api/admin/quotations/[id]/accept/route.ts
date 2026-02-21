import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: quote } = await supabase
      .from("quotations")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single();

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    if (quote.status === "accepted") {
      return NextResponse.json({ error: "Quotation already accepted" }, { status: 400 });
    }

    const { data: items } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Quotation has no items" }, { status: 400 });
    }

    const orderNotes = quote.notes
      ? `Converted from quote ${quote.quote_number} — ${quote.notes}`
      : `Converted from quote ${quote.quote_number}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: quote.customer_id,
          status: "draft",
          notes: orderNotes,
          subtotal: quote.subtotal,
          tax: quote.tax,
          total: quote.total,
          quotation_id: quote.id,
        },
      ])
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      custom_name: (item as { custom_name?: string }).custom_name ?? null,
      custom_spec: (item as { custom_spec?: string }).custom_spec ?? null,
      custom_notes: (item as { custom_notes?: string }).custom_notes ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    await supabase.from("quotations").update({ status: "accepted" }).eq("id", id);

    return NextResponse.json({ success: true, order_id: order.id });
  } catch (e) {
    console.error("[admin/quotations/accept] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
