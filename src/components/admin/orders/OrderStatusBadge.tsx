"use client";

import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/schemas/order";

interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function OrderStatusBadge({ status, size = "sm" }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status as OrderStatus] ?? ORDER_STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5"
      }`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
