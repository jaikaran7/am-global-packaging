"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateEnquiryStatus } from "./actions";
import {
  ENQUIRY_STATUS_CONFIG,
  ENQUIRY_STATUSES,
  normalizeEnquiryStatus,
  type EnquiryStatus,
} from "@/lib/enquiry-status";
import { EnquiryStatusIcon } from "@/components/admin/EnquiryStatusIcon";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export type EnquiryRow = {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string | null;
  product_category: string;
  product: string;
  quantity: number | null;
  ply_preference: string | null;
  project_details: string | null;
  status: string;
  created_at: string;
};

type StatusCounts = {
  total: number;
  new: number;
  contact: number;
  cancelled: number;
  successful: number;
  follow_up: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusPill({ status }: Readonly<{ status: string }>) {
  const normalized = normalizeEnquiryStatus(status);
  const config = ENQUIRY_STATUS_CONFIG[normalized];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${config.pillClass}`}>
      <EnquiryStatusIcon status={normalized} />
      {config.label}
    </span>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function EnquiriesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status") ?? "";
  const urlPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const urlSearch = searchParams.get("search") ?? "";

  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [page, setPage] = useState(urlPage);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<StatusCounts | null>(null);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.items ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries/stats");
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(`/admin/enquiries${query ? `?${query}` : ""}`, { scroll: false });
  }, [statusFilter, debouncedSearch, page, router]);

  function handleStatusFilter(status: string) {
    setStatusFilter(status);
    setPage(1);
    setDetailId(null);
  }

  function handleSearch(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  async function handleUpdateStatus(id: string, status: EnquiryStatus) {
    setUpdatingId(id);
    await updateEnquiryStatus(id, status);
    setUpdatingId(null);
    setDetailId(null);
    fetchEnquiries();
    fetchCounts();
  }

  const selected = detailId ? enquiries.find((e) => e.id === detailId) : null;

  return (
    <div className="space-y-4">
      {/* Status tabs with counts */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleStatusFilter("")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            !statusFilter
              ? "bg-[#ff7a2d]/10 text-[#ff7a2d] border-[#ff7a2d]/30"
              : "bg-white/60 text-[#6b7280] border-white/60 hover:bg-white/80"
          }`}
        >
          All
          {counts && <span className="ml-1 opacity-70">({counts.total})</span>}
        </button>
        {ENQUIRY_STATUSES.map((status) => {
          const config = ENQUIRY_STATUS_CONFIG[status];
          const isActive = statusFilter === status;
          const count = counts ? counts[status as keyof StatusCounts] : null;
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusFilter(status)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isActive
                  ? `${config.pillClass} border-current/20`
                  : "bg-white/60 text-[#6b7280] border-white/60 hover:bg-white/80"
              }`}
            >
              <EnquiryStatusIcon status={status} />
              {config.label}
              {count !== null && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email, company, phone, product, or message..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 border border-white/60 text-sm text-[#2b2f33] placeholder-[#9aa6b0] focus:outline-none focus:border-[#ff7a2d]/40 focus:bg-white/80 transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass glass--soft rounded-xl p-8 text-center text-[#6b7280]">
          Loading enquiries…
        </div>
      ) : enquiries.length === 0 ? (
        <div className="glass glass--soft rounded-xl p-8 text-center text-[#6b7280]">
          {debouncedSearch || statusFilter ? "No enquiries match your filters." : "No enquiries yet."}
        </div>
      ) : (
        <>
          <div className="glass glass--soft rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/50 bg-white/30">
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2b2f33]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/30 hover:bg-white/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#2b2f33]">{row.full_name}</td>
                      <td className="py-3 px-4 text-[#6b7280]">{row.company_name}</td>
                      <td className="py-3 px-4 text-[#6b7280]">
                        <a href={`mailto:${row.email}`} className="text-[#ff7a2d] hover:underline">
                          {row.email}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-[#6b7280]">{row.product}</td>
                      <td className="py-3 px-4 text-[#6b7280]">{row.quantity ?? "—"}</td>
                      <td className="py-3 px-4">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="py-3 px-4 text-[#6b7280]">{formatDate(row.created_at)}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setDetailId(detailId === row.id ? null : row.id)}
                          className="text-xs font-medium text-[#ff7a2d] hover:underline"
                        >
                          {detailId === row.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b7280]">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} enquiries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white/60 text-[#6b7280] border-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-3 h-3" /> Previous
              </button>
              <span className="text-sm text-[#6b7280]">
                Page {page} of {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white/60 text-[#6b7280] border-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="glass glass--soft rounded-xl p-6">
          <h3 className="text-base font-semibold text-[#2b2f33] mb-4">Enquiry details</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <p><span className="text-[#6b7280]">Name:</span> {selected.full_name}</p>
            <p><span className="text-[#6b7280]">Company:</span> {selected.company_name}</p>
            <p><span className="text-[#6b7280]">Email:</span> <a href={`mailto:${selected.email}`} className="text-[#ff7a2d]">{selected.email}</a></p>
            <p><span className="text-[#6b7280]">Phone:</span> {selected.phone ?? "—"}</p>
            <p><span className="text-[#6b7280]">Category:</span> {selected.product_category}</p>
            <p><span className="text-[#6b7280]">Product:</span> {selected.product}</p>
            <p><span className="text-[#6b7280]">Quantity:</span> {selected.quantity ?? "—"}</p>
            <p><span className="text-[#6b7280]">Ply:</span> {selected.ply_preference ?? "—"}</p>
          </div>
          {selected.project_details && (
            <p className="mt-4 text-sm"><span className="text-[#6b7280]">Details:</span><br />{selected.project_details}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-[#6b7280] mr-1">Set status:</span>
            {ENQUIRY_STATUSES.filter((s) => s !== normalizeEnquiryStatus(selected.status)).map((status) => {
              const config = ENQUIRY_STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  type="button"
                  disabled={updatingId === selected.id}
                  onClick={() => handleUpdateStatus(selected.id, status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-60 ${config.pillClass} border-current/20 hover:opacity-90`}
                >
                  <EnquiryStatusIcon status={status} />
                  {config.label}
                </button>
              );
            })}
            {updatingId === selected.id && <span className="text-xs text-[#6b7280]">Updating…</span>}
          </div>
        </div>
      )}
    </div>
  );
}
