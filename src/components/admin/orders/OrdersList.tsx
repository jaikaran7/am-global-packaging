"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderStockIndicator from "./OrderStockIndicator";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/schemas/order";

type OrderRow = {
  id: string;
  order_number: string;
  customer: { id: string; name: string; company: string | null } | null;
  status: string;
  subtotal: number;
  total: number;
  stock_status: "in_stock" | "partial" | "out_of_stock";
  created_at: string;
  items: unknown[];
};

type StatsData = Record<string, number>;

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "draft", label: "Draft" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_production", label: "In Production" },
  { key: "shipped", label: "Shipped" },
  { key: "cancelled", label: "Cancelled" },
];

interface OrdersListProps {
  statusFilter?: string;
}

export default function OrdersList({ statusFilter }: OrdersListProps) {
  const router = useRouter();
  const [status, setStatus] = useState(statusFilter ?? "all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const limit = 15;

  const { data: stats } = useQuery<StatsData>({
    queryKey: ["admin-orders-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data, isLoading, refetch } = useQuery<{
    items: OrderRow[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["admin-orders", status, debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this draft order?")) return;
      setDeleting(id);
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const d = await res.json();
          alert(d.error ?? "Failed to delete");
          return;
        }
        refetch();
      } finally {
        setDeleting(null);
      }
    },
    [refetch]
  );

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = stats?.[tab.key] ?? 0;
          const isActive = status === tab.key;
          const config = tab.key !== "all" ? ORDER_STATUS_CONFIG[tab.key as OrderStatus] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`kpi-pill transition-all ${
                isActive ? "ring-2 ring-[#ff7a2d]/30 shadow-md" : "hover:shadow-md"
              }`}
            >
              {config && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
              )}
              <span className="text-xs font-medium text-[#6b7280]">{tab.label}</span>
              <span
                className={`text-sm font-bold ${isActive ? "text-[#ff7a2d]" : "text-[#2b2f33]"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 admin-btn-secondary flex items-center gap-2 px-3 py-2 rounded-xl">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#9aa6b0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="flex-1 bg-transparent text-sm outline-none text-[#2b2f33] placeholder-[#9aa6b0]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100/50">
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Order ID
              </th>
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Total
              </th>
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Stock Status
              </th>
              <th className="text-left text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Date
              </th>
              <th className="text-right text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-[#9aa6b0]">
                  Loading orders...
                </td>
              </tr>
            )}
            {!isLoading && (data?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-[#9aa6b0]">
                  No orders found
                </td>
              </tr>
            )}
            {(data?.items ?? []).map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50/50 hover:bg-white/40 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-[#2b2f33]">
                    {order.order_number}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#2b2f33]">
                      {order.customer?.name ?? "No customer"}
                    </p>
                    {order.customer?.company && (
                      <p className="text-xs text-[#9aa6b0]">{order.customer.company}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#2b2f33]">
                    ${Number(order.total).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStockIndicator status={order.stock_status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#6b7280]">
                    {formatDate(order.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="admin-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View
                    </button>
                    {order.status === "draft" && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={deleting === order.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#9aa6b0] hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="admin-btn-secondary p-2 rounded-xl disabled:opacity-40"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${
                  page === p
                    ? "bg-[#ff7a2d] text-white shadow-md"
                    : "admin-btn-secondary"
                }`}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 6 && (
            <>
              <span className="text-[#9aa6b0]">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${
                  page === totalPages
                    ? "bg-[#ff7a2d] text-white shadow-md"
                    : "admin-btn-secondary"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="admin-btn-secondary p-2 rounded-xl disabled:opacity-40"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
