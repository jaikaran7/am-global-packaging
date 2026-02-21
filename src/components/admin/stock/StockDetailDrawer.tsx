"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Movement = {
  id: string;
  movement_type: string;
  qty: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

interface StockDetailDrawerProps {
  variant: {
    id: string;
    variant_name: string;
    product_title: string;
    available: number;
    reserved: number;
    incoming: number;
    remaining: number;
    threshold: number;
  };
  onClose: () => void;
}

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

const MOVEMENT_LABELS: Record<string, { label: string; color: string }> = {
  incoming: { label: "Incoming", color: "text-emerald-600" },
  outgoing: { label: "Outgoing", color: "text-red-600" },
  reserved: { label: "Reserved", color: "text-amber-600" },
  released: { label: "Released", color: "text-blue-600" },
  adjustment: { label: "Adjustment", color: "text-purple-600" },
};

export default function StockDetailDrawer({ variant, onClose }: StockDetailDrawerProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/stock/${variant.id}/movements?page=${page}&limit=15`)
      .then((r) => r.json())
      .then((data) => {
        setMovements(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [variant.id, page]);

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2b2f33]">Stock Details</h2>
              <p className="text-sm text-[#9aa6b0]">
                {variant.product_title} — {variant.variant_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stock Overview */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Available", value: variant.available, color: "text-emerald-600" },
              { label: "Reserved", value: variant.reserved, color: "text-amber-600" },
              { label: "Incoming", value: variant.incoming, color: "text-blue-600" },
              {
                label: "Remaining",
                value: variant.remaining,
                color: variant.remaining <= 0 ? "text-red-600" : "text-[#2b2f33]",
              },
            ].map((item) => (
              <div key={item.label} className="glass rounded-xl p-3">
                <p className="text-xs text-[#9aa6b0] font-medium">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">Low Stock Threshold</span>
            <span className="text-sm font-semibold text-[#2b2f33]">{variant.threshold}</span>
          </div>

          {/* Movement History */}
          <div>
            <h3 className="text-sm font-semibold text-[#2b2f33] mb-3">Stock Movement History</h3>

            {loading ? (
              <div className="text-center py-8 text-sm text-[#9aa6b0]">Loading...</div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#9aa6b0]">No movements recorded</div>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => {
                  const config = MOVEMENT_LABELS[m.movement_type] ?? {
                    label: m.movement_type,
                    color: "text-gray-600",
                  };
                  return (
                    <div
                      key={m.id}
                      className="glass rounded-xl p-3 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-[#9aa6b0]">
                            {formatDate(m.created_at)}
                          </span>
                        </div>
                        {m.note && (
                          <p className="text-xs text-[#6b7280] mt-0.5">{m.note}</p>
                        )}
                        {m.reference_type && (
                          <p className="text-[10px] text-[#9aa6b0] mt-0.5">
                            Ref: {m.reference_type}
                            {m.reference_id ? ` (${m.reference_id.slice(0, 8)}...)` : ""}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          m.qty > 0 ? "text-emerald-600" : m.qty < 0 ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        {m.qty > 0 ? "+" : ""}
                        {m.qty}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="admin-btn-secondary px-3 py-1 text-xs rounded-lg disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-[#9aa6b0]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="admin-btn-secondary px-3 py-1 text-xs rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
