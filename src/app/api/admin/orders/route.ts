import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderSchema } from "@/lib/schemas/order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customer = searchParams.get("customer");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("*, customer:customers(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") query = query.eq("status", status);
    if (customer) query = query.eq("customer_id", customer);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");
    if (search?.trim()) {
      query = query.or(`order_number.ilike.%${search.trim()}%`);
    }

    const { data: orders, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orderIds = (orders ?? []).map((o) => o.id);

    const itemsRes = orderIds.length
      ? await supabase
          .from("order_items")
          .select("*, product:products(id,title), variant:product_variants(id,name,stock,reserved_stock)")
          .in("order_id", orderIds)
      : { data: [] };

    type ItemRow = NonNullable<typeof itemsRes.data>[number];
    const itemsByOrder: Record<string, ItemRow[]> = {};
    for (const item of itemsRes.data ?? []) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    // Also search by customer name/email if search is provided
    let customerMatchedOrders: typeof orders = [];
    if (search?.trim() && orders) {
      const { data: custOrders } = await supabase
        .from("orders")
        .select("*, customer:customers(*)")
        .or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`, {
          referencedTable: "customers",
        })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      customerMatchedOrders = custOrders ?? [];
    }

    const mergedIds = new Set(orderIds);
    for (const o of customerMatchedOrders) {
      if (!mergedIds.has(o.id)) {
        orders?.push(o);
        mergedIds.add(o.id);
      }
    }

    const items = (orders ?? []).map((o) => {
      const lineItems = itemsByOrder[o.id] ?? [];
      let stockStatus: "in_stock" | "partial" | "out_of_stock" = "in_stock";
      for (const li of lineItems) {
        if (!li.variant_id) continue;
        const variant = li.variant as { stock?: number; reserved_stock?: number } | null;
        const available = (variant?.stock ?? 0) - (variant?.reserved_stock ?? 0);
        if (available <= 0) {
          stockStatus = "out_of_stock";
          break;
        } else if (available < li.quantity) {
          stockStatus = "partial";
        }
      }
      return { ...o, items: lineItems, stock_status: stockStatus };
    });

    return NextResponse.json({ items, total: count ?? 0, page, limit });
  } catch (e) {
    console.error("[admin/orders] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    let customerId = parsed.data.customer_id;

    if (!customerId && parsed.data.new_customer) {
      const { data: newCust, error: custErr } = await supabase
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
      if (custErr) {
        return NextResponse.json({ error: custErr.message }, { status: 500 });
      }
      customerId = newCust.id;
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([{
        customer_id: customerId || null,
        status: "draft",
        notes: parsed.data.notes || null,
        tax: parsed.data.tax ?? 0,
      }])
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const itemsToInsert = parsed.data.items.map((item) => {
      const hasCustom = item.product_id === "custom" || Boolean(item.custom_name?.trim());
      return {
        order_id: order.id,
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

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    const { data: fullOrder } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", order.id)
      .single();

    return NextResponse.json(fullOrder);
  } catch (e) {
    console.error("[admin/orders] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
