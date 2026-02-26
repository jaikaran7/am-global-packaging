"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import StockStatusBadge from "./StockStatusBadge";
import { SearchableSelect } from "@/components/ui/select";
import StockAdjustModal from "./StockAdjustModal";
import StockDetailDrawer from "./StockDetailDrawer";

type StockItem = {
  id: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  category_id: string | null;
  category_name: string;
  variant_name: string;
  sku: string | null;
  price: number;
  available: number;
  reserved: number;
  incoming: number;
  remaining: number;
  threshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  image_url: string | null;
};

type Category = { id: string; name: string };

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

interface StockTableProps {
  statusFilter?: string;
}

export default function StockTable({ statusFilter }: StockTableProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState(statusFilter ?? "");
  const [page, setPage] = useState(1);
  const [adjustVariant, setAdjustVariant] = useState<StockItem | null>(null);
  const [detailVariant, setDetailVariant] = useState<StockItem | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const limit = 20;

  const { data, isLoading } = useQuery<{ items: StockItem[]; total: number }>({
    queryKey: ["admin-stock", debouncedSearch, category, stockStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (stockStatus) params.set("status", stockStatus);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await fetch(`/api/admin/stock?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      return Array.isArray(d) ? d : d.data ?? [];
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, stockStatus]);

  // Keep detail drawer in sync with refetched list (e.g. after receive incoming)
  useEffect(() => {
    if (!data?.items || !detailVariant) return;
    const updated = data.items.find((i) => i.id === detailVariant.id);
    if (updated && updated !== detailVariant) setDetailVariant(updated);
  }, [data?.items, detailVariant]);

  const handleAdjustSuccess = useCallback(() => {
    setAdjustVariant(null);
    queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stock-stats"] });
  }, [queryClient]);

  const handleDetailRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stock-stats"] });
  }, [queryClient]);

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] admin-btn-secondary flex items-center gap-2 px-3 py-2 rounded-xl">
            <MagnifyingGlassIcon className="w-4 h-4 text-[#9aa6b0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variants..."
              className="flex-1 bg-transparent text-sm outline-none text-[#2b2f33] placeholder-[#9aa6b0]"
            />
          </div>
          <div className="min-w-[170px]">
            <SearchableSelect
              value={stockStatus}
              onChange={(value) => setStockStatus(value)}
              options={[
                { value: "", label: "Status: All" },
                { value: "in_stock", label: "In Stock" },
                { value: "low_stock", label: "Low Stock" },
                { value: "out_of_stock", label: "Out of Stock" },
              ]}
              placeholder="Status: All"
              allowClear={false}
            />
          </div>
          <div className="min-w-[200px]">
            <SearchableSelect
              value={category}
              onChange={(value) => setCategory(value)}
              options={[{ value: "", label: "Category: All" }].concat(
                (categories ?? []).map((c) => ({ value: c.id, label: c.name }))
              )}
              placeholder="Category: All"
              allowClear={false}
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100/50">
                {["Product", "Variant", "Available", "Reserved", "Incoming", "Remaining", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`text-xs font-semibold text-[#9aa6b0] uppercase tracking-wider px-4 py-3 ${
                        h === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#9aa6b0]">
                    Loading stock data...
                  </td>
                </tr>
              )}
              {!isLoading && (data?.items ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#9aa6b0]">
                    No variants found
                  </td>
                </tr>
              )}
              {(data?.items ?? []).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50/50 hover:bg-white/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-[#9aa6b0]">
                          N/A
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#2b2f33]">
                          {item.product_title}
                        </p>
                        <p className="text-xs text-[#9aa6b0]">{item.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#2b2f33]">{item.variant_name}</p>
                    {item.sku && (
                      <p className="text-xs text-[#9aa6b0]">{item.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${
                      item.available > 0 ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {item.available}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#6b7280]">{item.reserved}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-blue-600">{item.incoming}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        item.remaining <= 0
                          ? "text-red-600"
                          : item.remaining <= item.threshold
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {item.remaining}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailVariant(item)}
                        className="admin-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg"
                      >
                        <EyeIcon className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => setAdjustVariant(item)}
                        className="admin-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg"
                      >
                        <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" /> Adjust
                      </button>
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

      {/* Adjust Modal */}
      {adjustVariant && (
        <StockAdjustModal
          variant={adjustVariant}
          onClose={() => setAdjustVariant(null)}
          onSuccess={handleAdjustSuccess}
        />
      )}

      {/* Detail Drawer */}
      {detailVariant && (
        <StockDetailDrawer
          variant={detailVariant}
          onClose={() => setDetailVariant(null)}
          onRefresh={handleDetailRefresh}
        />
      )}
    </>
  );
}
