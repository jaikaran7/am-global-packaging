import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Revenue: only delivered (or shipped if you recognise revenue on ship) */
const REVENUE_STATUSES = ["delivered", "shipped"] as const;
const PENDING_ORDER_STATUSES = ["draft", "pending_confirmation", "confirmed", "in_production"];
const ACTIVE_ORDER_STATUSES = ["confirmed", "in_production", "shipped"];

export async function GET() {
  try {
    const supabase = createAdminClient();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);

    const [
      newEnquiriesRes,
      orderStatsRes,
      stockStatsRes,
      variantsRes,
      revenueThisMonthRes,
      revenueLastMonthRes,
      salesByMonthRes,
      recentEnquiriesRes,
      latestOrdersRes,
      productsCountRes,
      customersCountRes,
    ] = await Promise.all([
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("orders").select("id, status"),
      supabase.from("product_variants").select("id, stock, reserved_stock, incoming_stock, stock_warning_threshold, name, product_id"),
      supabase.from("product_variants").select("id, stock, reserved_stock, incoming_stock, stock_warning_threshold, name, product_id"),
      supabase.from("orders").select("total").in("status", REVENUE_STATUSES).gte("created_at", thisMonthStart).lte("created_at", `${thisMonthEnd}T23:59:59`),
      supabase.from("orders").select("total").in("status", REVENUE_STATUSES).gte("created_at", lastMonthStart).lte("created_at", `${lastMonthEnd}T23:59:59`),
      supabase.from("orders").select("total, created_at").in("status", REVENUE_STATUSES).gte("created_at", sixMonthsAgo),
      supabase.from("enquiries").select("id, full_name, company_name, product_category, product, status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("id, order_number, status, total, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
    ]);

    const orders = orderStatsRes.data ?? [];
    const pendingOrders = orders.filter((o) => PENDING_ORDER_STATUSES.includes(o.status)).length;
    const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length;

    const variants = variantsRes.data ?? [];
    let totalAvailable = 0;
    let totalReserved = 0;
    let totalIncoming = 0;
    const lowStockItems: { id: string; name: string; remaining: number; product_title?: string }[] = [];
    let upcomingLoadsCount = 0;
    const productIds = [...new Set(variants.map((v) => v.product_id))];
    const { data: productsList } = productIds.length
      ? await supabase.from("products").select("id, title").in("id", productIds)
      : { data: [] };
    const productMap = Object.fromEntries((productsList ?? []).map((p) => [p.id, p]));

    for (const v of variants) {
      const available = v.stock ?? 0;
      const reserved = v.reserved_stock ?? 0;
      const incoming = v.incoming_stock ?? 0;
      const remaining = available - reserved;
      totalAvailable += available;
      totalReserved += reserved;
      totalIncoming += incoming;
      if (incoming > 0) upcomingLoadsCount++;
      const threshold = v.stock_warning_threshold ?? 5;
      if (remaining <= threshold && remaining >= 0) {
        lowStockItems.push({
          id: v.id,
          name: v.name ?? "Variant",
          remaining,
          product_title: productMap[v.product_id]?.title,
        });
      }
    }

    const lowStockAlerts = lowStockItems.length;

    const revenueThisMonth = (revenueThisMonthRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
    const revenueLastMonth = (revenueLastMonthRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
    const revenueChangePct =
      revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : (revenueThisMonth > 0 ? 100 : 0);

    const salesByMonthRaw = salesByMonthRes.data ?? [];
    const monthSums: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthSums[key] = 0;
    }
    for (const o of salesByMonthRaw) {
      const created = String(o.created_at).slice(0, 7);
      if (monthSums[created] !== undefined) monthSums[created] += Number(o.total ?? 0);
    }
    const salesByMonth = Object.entries(monthSums)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, sales]) => {
        const [y, m] = month.split("-");
        const d = new Date(Number(y), Number(m) - 1, 1);
        return { month: d.toLocaleString("en-AU", { month: "short", year: "2-digit" }), sales, period: month };
      });

    const recentEnquiries = (recentEnquiriesRes.data ?? []).map((e) => ({
      id: e.id,
      name: e.full_name,
      subject: `${e.product_category ?? ""} — ${e.product ?? ""}`.trim() || "Enquiry",
      status: e.status,
      created_at: e.created_at,
    }));

    const latestOrders = (latestOrdersRes.data ?? []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total: Number(o.total ?? 0),
      created_at: o.created_at,
    }));

    const upcomingLoadsList = variants
      .filter((v) => (v.incoming_stock ?? 0) > 0)
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        label: `${productMap[v.product_id]?.title ?? "Product"} — ${v.name ?? "Variant"}`,
        qty: v.incoming_stock ?? 0,
      }));

    return NextResponse.json({
      newEnquiries: newEnquiriesRes.count ?? 0,
      pendingOrders,
      lowStockAlerts,
      upcomingLoads: upcomingLoadsCount,
      totalRevenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      totalRevenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
      revenueChangePct: Math.round(revenueChangePct * 10) / 10,
      activeOrders,
      productsCount: productsCountRes.count ?? 0,
      customersCount: customersCountRes.count ?? 0,
      recentEnquiries,
      latestOrders,
      lowStockItems: lowStockItems.slice(0, 5),
      upcomingLoadsList,
      salesByMonth,
      stockSummary: {
        available: totalAvailable,
        reserved: totalReserved,
        incoming: totalIncoming,
      },
    });
  } catch (e) {
    console.error("[admin/dashboard] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
