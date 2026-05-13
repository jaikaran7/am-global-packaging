"use client";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

const CONFIG: Record<StockStatus, { label: string; color: string; bg: string; dot: string }> = {
  in_stock: {
    label: "In Stock",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  low_stock: {
    label: "Low Stock",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
};

interface StockStatusBadgeProps {
  status: StockStatus;
}

export default function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const config = CONFIG[status] ?? CONFIG.in_stock;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
