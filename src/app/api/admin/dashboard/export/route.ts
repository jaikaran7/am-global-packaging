import { NextRequest, NextResponse } from "next/server";

function escapeCsv(s: string | number): string {
  const str = String(s ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const origin = url.origin || "http://localhost:3000";
    const format = url.searchParams.get("format") || "csv";

    const res = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load dashboard data" }, { status: res.status });
    }
    const data = await res.json();

    if (format !== "csv") {
      return NextResponse.json({ error: "Unsupported format. Use format=csv" }, { status: 400 });
    }

    const summaryRows = [
      "Dashboard Summary",
      "Metric,Value",
      `New Enquiries,${data.newEnquiries ?? 0}`,
      `Pending Orders,${data.pendingOrders ?? 0}`,
      `Low Stock Alerts,${data.lowStockAlerts ?? 0}`,
      `Upcoming Loads,${data.upcomingLoads ?? 0}`,
      `Total Revenue (This Month),${data.totalRevenueThisMonth ?? 0}`,
      `Total Revenue (Last Month),${data.totalRevenueLastMonth ?? 0}`,
      `Revenue Change %,${data.revenueChangePct ?? 0}`,
      `Active Orders,${data.activeOrders ?? 0}`,
      `Products Count,${data.productsCount ?? 0}`,
      `Customers Count,${data.customersCount ?? 0}`,
      "",
    ];

    const enquiryRows = [
      "Recent Enquiries",
      "ID,Name,Subject,Status,Created At",
      ...(data.recentEnquiries ?? []).map((e: { id: string; name: string; subject: string; status: string; created_at?: string }) =>
        [e.id, e.name, e.subject, e.status, e.created_at ?? ""].map(escapeCsv).join(",")
      ),
      "",
    ];

    const orderRows = [
      "Latest Orders",
      "ID,Order Number,Status,Total,Created At",
      ...(data.latestOrders ?? []).map((o: { id: string; order_number: string; status: string; total: number; created_at: string }) =>
        [o.id, o.order_number, o.status, o.total ?? 0, o.created_at ?? ""].map(escapeCsv).join(",")
      ),
      "",
    ];

    const lowStockRows = [
      "Low Stock Items",
      "ID,Name,Remaining,Product Title",
      ...(data.lowStockItems ?? []).map((i: { id: string; name: string; remaining: number; product_title?: string }) =>
        [i.id, i.name, i.remaining ?? 0, i.product_title ?? ""].map(escapeCsv).join(",")
      ),
      "",
    ];

    const loadsRows = [
      "Upcoming Loads",
      "ID,Label,Qty",
      ...(data.upcomingLoadsList ?? []).map((l: { id: string; label: string; qty: number }) =>
        [l.id, l.label, l.qty ?? 0].map(escapeCsv).join(",")
      ),
      "",
    ];

    const salesRows = [
      "Sales By Month (Revenue)",
      "Month,Sales,Period",
      ...(data.salesByMonth ?? []).map((s: { month: string; sales: number; period: string }) =>
        [s.month, s.sales ?? 0, s.period ?? ""].map(escapeCsv).join(",")
      ),
      "",
    ];

    const ss = data.stockSummary ?? {};
    const stockRows = [
      "Stock Summary",
      "Available,Reserved,Incoming",
      [ss.available ?? 0, ss.reserved ?? 0, ss.incoming ?? 0].join(","),
    ];

    const csv = [summaryRows, enquiryRows, orderRows, lowStockRows, loadsRows, salesRows, stockRows]
      .flat()
      .join("\n");
    const filename = `dashboard-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("[admin/dashboard/export] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
