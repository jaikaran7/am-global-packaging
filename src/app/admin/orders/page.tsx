"use client";

import Link from "next/link";
import { PlusIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import OrdersList from "@/components/admin/orders/OrdersList";

export default function AdminOrdersPage() {
  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/admin/orders?limit=500");
      if (!res.ok) return;
      const data = await res.json();
      const items = data.items ?? [];

      const header = "Order Number,Customer,Company,Status,Total,Stock Status,Date\n";
      const rows = items.map(
        (o: Record<string, unknown>) => {
          const cust = o.customer as { name?: string; company?: string } | null;
          return [
            `"${String(o.order_number ?? "")}"`,
            `"${String(cust?.name ?? "")}"`,
            `"${String(cust?.company ?? "")}"`,
            `"${String(o.status ?? "")}"`,
            o.total,
            `"${String(o.stock_status ?? "")}"`,
            `"${new Date(o.created_at as string).toLocaleDateString("en-AU")}"`,
          ].join(",");
        }
      );

      const csv = header + rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#2b2f33] tracking-tight">
          Orders Management
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders/new"
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
          >
            <PlusIcon className="w-5 h-5" /> Add Order
          </Link>
          <button
            onClick={handleExportCSV}
            className="admin-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Export CSV
          </button>
        </div>
      </div>

      <OrdersList />
    </div>
  );
}
