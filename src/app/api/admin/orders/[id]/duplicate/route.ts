import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Duplicate order (Create New Version). Allowed only when order is confirmed or in_production.
 * Creates a new order in Draft; marks the current order as obsolete and links to the new one.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const status = order.status as string;
    if (status !== "confirmed" && status !== "in_production") {
      return NextResponse.json(
        { error: "Only confirmed or in-production orders can be duplicated." },
        { status: 400 }
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order has no items to duplicate" }, { status: 400 });
    }

    const orderNotes = order.notes
      ? `Duplicated from order ${order.order_number}. — ${order.notes}`
      : `Duplicated from order ${order.order_number}.`;

    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: order.customer_id,
          status: "draft",
          notes: orderNotes,
          subtotal: order.subtotal,
          tax: order.tax ?? 0,
          total: order.total,
          quotation_id: order.quotation_id ?? null,
          source_quote_id: order.source_quote_id ?? null,
          source_quote_version: order.source_quote_version ?? null,
        },
      ])
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const newItems = items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      custom_name: (item as { custom_name?: string }).custom_name ?? null,
      custom_spec: (item as { custom_spec?: string }).custom_spec ?? null,
      custom_notes: (item as { custom_notes?: string }).custom_notes ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      product_title_snapshot: (item as { product_title_snapshot?: string }).product_title_snapshot ?? null,
      variant_name_snapshot: (item as { variant_name_snapshot?: string }).variant_name_snapshot ?? null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(newItems);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    await supabase
      .from("orders")
      .update({ status: "obsolete", superseded_by_order_id: newOrder.id })
      .eq("id", id);

    const { data: fullOrder } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", newOrder.id)
      .single();

    return NextResponse.json(fullOrder);
  } catch (e) {
    console.error("[admin/orders/duplicate] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
