import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  orderStatusSchema,
  VALID_TRANSITIONS,
  type OrderStatus,
} from "@/lib/schemas/order";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status as OrderStatus;
    const newStatus = parsed.data.status;

    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    // Stock reservation logic
    if (currentStatus === "draft" && newStatus === "confirmed") {
      for (const item of items ?? []) {
        if (!item.variant_id) continue;
        await supabase.from("stock_movements").insert({
          product_id: item.product_id,
          variant_id: item.variant_id,
          movement_type: "reserved",
          qty: 0,
          reference_type: "order",
          reference_id: id,
          note: `Reserved ${item.quantity} units for order ${order.order_number}`,
        });
        const { data: variant } = await supabase
          .from("product_variants")
          .select("reserved_stock")
          .eq("id", item.variant_id)
          .single();
        await supabase
          .from("product_variants")
          .update({ reserved_stock: (variant?.reserved_stock ?? 0) + item.quantity })
          .eq("id", item.variant_id);
      }
    }

    if (
      (currentStatus === "confirmed" || currentStatus === "in_production") &&
      newStatus === "cancelled"
    ) {
      for (const item of items ?? []) {
        if (!item.variant_id) continue;
        await supabase.from("stock_movements").insert({
          product_id: item.product_id,
          variant_id: item.variant_id,
          movement_type: "released",
          qty: 0,
          reference_type: "order",
          reference_id: id,
          note: `Released reservation for cancelled order ${order.order_number}`,
        });
        const { data: variant } = await supabase
          .from("product_variants")
          .select("reserved_stock")
          .eq("id", item.variant_id)
          .single();
        await supabase
          .from("product_variants")
          .update({
            reserved_stock: Math.max(0, (variant?.reserved_stock ?? 0) - item.quantity),
          })
          .eq("id", item.variant_id);
      }
    }

    if (currentStatus === "in_production" && newStatus === "shipped") {
      for (const item of items ?? []) {
        if (!item.variant_id) continue;
        // Deduct from available stock via ledger
        await supabase.from("stock_movements").insert({
          product_id: item.product_id,
          variant_id: item.variant_id,
          movement_type: "outgoing",
          qty: -item.quantity,
          reference_type: "order",
          reference_id: id,
          note: `Shipped ${item.quantity} units for order ${order.order_number}`,
        });
        // Release reservation
        const { data: variant } = await supabase
          .from("product_variants")
          .select("reserved_stock")
          .eq("id", item.variant_id)
          .single();
        await supabase
          .from("product_variants")
          .update({
            reserved_stock: Math.max(0, (variant?.reserved_stock ?? 0) - item.quantity),
          })
          .eq("id", item.variant_id);
      }
    }

    const statusUpdate: Record<string, unknown> = { status: newStatus };
    if (newStatus === "shipped") {
      statusUpdate.shipping_provider = parsed.data.shipping_provider || null;
      statusUpdate.tracking_id = parsed.data.tracking_id || null;
      statusUpdate.shipped_date = parsed.data.shipped_date || new Date().toISOString().split("T")[0];
    }
    if (newStatus === "delivered") {
      statusUpdate.delivered_date = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase.from("orders").update(statusUpdate).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: updated } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single();

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin/orders/[id]/status] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
