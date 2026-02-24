"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import ProductList from "@/components/admin/products/ProductList";
import { SearchableSelect } from "@/components/ui/select";

type Stats = {
  totalProducts: number;
  activeProducts: number;
  lowStockItems: number;
  categories: number;
};

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/admin/products/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

type CategoryOption = { id: string; name: string; slug: string };
async function fetchCategories(): Promise<CategoryOption[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

const kpiPills = [
  { key: "totalProducts" as const, label: "Total Products", icon: CubeIcon, color: "text-amber-700", bg: "bg-amber-50" },
  { key: "activeProducts" as const, label: "Active Products", icon: CheckCircleIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "lowStockItems" as const, label: "Low Stock Items", icon: ExclamationTriangleIcon, color: "text-[#ff7a2d]", bg: "bg-orange-50" },
  { key: "categories" as const, label: "Categories", icon: Squares2X2Icon, color: "text-[#6b7280]", bg: "bg-[#f3f4f6]" },
];

export default function AdminProductsPage() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [ply, setPly] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: stats } = useQuery({ queryKey: ["admin-products-stats"], queryFn: fetchStats });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories });

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header: title + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">
            Products Management
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
          >
            <PlusIcon className="w-5 h-5" /> Add Product
          </Link>
          <button
            type="button"
            className="admin-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Import CSV
          </button>
          <div className="flex gap-1 ml-2">
            <button
              type="button"
              className="admin-btn-secondary p-2.5 rounded-xl"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-5 h-5 text-[#6b7280]" />
            </button>
            <button
              type="button"
              className="admin-btn-secondary p-2.5 rounded-xl"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-[#6b7280]" />
            </button>
            <button
              type="button"
              className="admin-btn-secondary p-2.5 rounded-xl"
              aria-label="History"
            >
              <ClockIcon className="w-5 h-5 text-[#6b7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI pills */}
      <div className="flex flex-wrap gap-3">
        {kpiPills.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="kpi-pill flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm text-[#6b7280] font-medium">{label}</span>
            <span className="text-lg font-bold text-[#ff7a2d]">{stats?.[key] ?? "—"}</span>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="glass glass--soft rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="min-w-[180px]">
          <SearchableSelect
            value={categoryId ?? ""}
            onChange={(value) => setCategoryId(value || null)}
            options={categoryOptions}
            placeholder="All Categories"
            allowClear={false}
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: "", label: "Status: All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            placeholder="Status: All"
            allowClear={false}
          />
        </div>
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-btn-secondary py-2 px-3 rounded-xl text-sm flex-1 min-w-[180px]"
        />
        <div className="flex rounded-xl overflow-hidden border border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2.5 ${viewMode === "grid" ? "bg-[#ff7a2d] text-white" : "bg-white/80 text-[#6b7280]"}`}
            aria-label="Grid view"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2.5 ${viewMode === "list" ? "bg-[#ff7a2d] text-white" : "bg-white/80 text-[#6b7280]"}`}
            aria-label="List view"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product list with sidebar */}
      <ProductList
        categoryId={categoryId}
        ply={ply}
        search={search}
        status={status}
        page={page}
        viewMode={viewMode}
        onCategoryChange={setCategoryId}
        onPlyChange={setPly}
      />
    </div>
  );
}
