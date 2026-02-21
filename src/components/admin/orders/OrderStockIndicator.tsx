"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type StockStatus = "in_stock" | "partial" | "out_of_stock";

const CONFIG: Record<StockStatus, { icon: typeof CheckCircleIcon; label: string; className: string }> = {
  in_stock: {
    icon: CheckCircleIcon,
    label: "In Stock",
    className: "text-emerald-600",
  },
  partial: {
    icon: ExclamationTriangleIcon,
    label: "Low Stock",
    className: "text-amber-500",
  },
  out_of_stock: {
    icon: XCircleIcon,
    label: "Out of Stock",
    className: "text-red-500",
  },
};

interface OrderStockIndicatorProps {
  status: StockStatus;
}

export default function OrderStockIndicator({ status }: OrderStockIndicatorProps) {
  const config = CONFIG[status] ?? CONFIG.in_stock;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}
