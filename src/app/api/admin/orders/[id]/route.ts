import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderSchema } from "@/lib/schemas/order";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*, customer:customers(*)").eq("id", id).single(),
      supabase
        .from("order_items")
        .select(
          "*, product:products(id,title,slug), variant:product_variants(id,name,sku,price,stock,reserved_stock,stock_warning_threshold)"
        )
        .eq("order_id", id),
    ]);

    if (orderRes.error) {
      return NextResponse.json({ error: orderRes.error.message }, { status: 404 });
    }

    return NextResponse.json({
      ...orderRes.data,
      items: itemsRes.data ?? [],
    });
  } catch (e) {
    console.error("[admin/orders/[id]] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (existing.status === "delivered") {
      return NextResponse.json(
        { error: "Delivered orders cannot be edited" },
        { status: 400 }
      );
    }

    const parsed = orderSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let customerId = parsed.data?.customer_id;
    if (!customerId && parsed.data?.new_customer) {
      const { data: cust } = await supabase
        .from("customers")
        .insert([{
          name: parsed.data.new_customer.name,
          email: parsed.data.new_customer.email || null,
          phone: parsed.data.new_customer.phone || null,
          company: parsed.data.new_customer.company || null,
          address: parsed.data.new_customer.address || null,
        }])
        .select()
        .single();
      customerId = cust?.id;
    }

    const updates: Record<string, unknown> = {};
    if (customerId !== undefined) updates.customer_id = customerId || null;
    if (parsed.data?.notes !== undefined) updates.notes = parsed.data.notes || null;
    if (parsed.data?.tax !== undefined) updates.tax = parsed.data.tax;
    if (parsed.data?.shipping_provider !== undefined)
      updates.shipping_provider = parsed.data.shipping_provider || null;
    if (parsed.data?.tracking_id !== undefined)
      updates.tracking_id = parsed.data.tracking_id || null;
    if (parsed.data?.shipped_date !== undefined)
      updates.shipped_date = parsed.data.shipped_date || null;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (parsed.data?.items) {
      await supabase.from("order_items").delete().eq("order_id", id);
      const newItems = parsed.data.items.map((item) => {
        const hasCustom = item.product_id === "custom" || Boolean(item.custom_name?.trim());
        return {
          order_id: id,
          product_id: hasCustom ? null : item.product_id,
          variant_id: hasCustom ? null : item.variant_id,
          custom_name: item.custom_name || null,
          custom_spec: item.custom_spec || null,
          custom_notes: item.custom_notes || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
        };
      });
      const { error: itemsErr } = await supabase.from("order_items").insert(newItems);
      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
      }
    }

    const { data: updated } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single();

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin/orders/[id]] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft orders can be deleted" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/orders/[id]] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
