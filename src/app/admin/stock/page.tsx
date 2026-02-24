"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import StockTable from "@/components/admin/stock/StockTable";
import StockBulkAdjustModal from "@/components/admin/stock/StockBulkAdjustModal";

type StockStats = {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
};

const kpiCards = [
  {
    key: "in_stock" as const,
    label: "In Stock",
    Icon: CheckCircleIcon,
    dotColor: "bg-emerald-500",
    valueColor: "text-emerald-600",
  },
  {
    key: "low_stock" as const,
    label: "Low Stock",
    Icon: ExclamationTriangleIcon,
    dotColor: "bg-amber-500",
    valueColor: "text-amber-600",
  },
  {
    key: "out_of_stock" as const,
    label: "Out of Stock",
    Icon: XCircleIcon,
    dotColor: "bg-red-500",
    valueColor: "text-red-600",
  },
];

export default function AdminStockPage() {
  const { data: stats } = useQuery<StockStats>({
    queryKey: ["admin-stock-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stock/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleExportCSV = () => {
    window.open("/api/admin/stock/export", "_blank");
  };

  const [showBulk, setShowBulk] = useState(false);

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[#2b2f33] tracking-tight">
          Stock Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            onClick={() => {
              /* StockAdjustModal opens from table rows */
            }}
          >
            <PlusIcon className="w-5 h-5" /> Stock Adjustment
          </button>
          <button
            className="admin-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            onClick={() => setShowBulk(true)}
          >
            Bulk Update Stock
          </button>
          <button
            onClick={handleExportCSV}
            className="admin-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="flex flex-wrap gap-3">
        {kpiCards.map((kpi) => (
          <div key={kpi.key} className="kpi-pill">
            <span className={`w-2.5 h-2.5 rounded-full ${kpi.dotColor} flex-shrink-0`} />
            <span className="text-xs font-medium text-[#6b7280]">{kpi.label}</span>
            <span className={`text-sm font-bold ${kpi.valueColor}`}>
              {stats?.[kpi.key] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Stock Table */}
      <StockTable />

      {showBulk && (
        <StockBulkAdjustModal
          onClose={() => setShowBulk(false)}
          onSuccess={() => {
            setShowBulk(false);
          }}
        />
      )}
    </div>
  );
}
