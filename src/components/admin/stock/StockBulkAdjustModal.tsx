"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SearchableSelect } from "@/components/ui/select";

type StockItem = {
  id: string;
  product_title: string;
  variant_name: string;
  sku: string | null;
  available: number;
};

interface StockBulkAdjustModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type BulkMode = "same" | "per_item";

export default function StockBulkAdjustModal({
  onClose,
  onSuccess,
}: Readonly<StockBulkAdjustModalProps>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"same" | "per_item">("same");
  const [action, setAction] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [perItemQty, setPerItemQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data } = useQuery<{ items: StockItem[] }>({
    queryKey: ["admin-stock-bulk-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stock?limit=1000");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = data?.items ?? [];
    if (!q) return items;
    return items.filter(
      (i) =>
        i.product_title.toLowerCase().includes(q) ||
        i.variant_name.toLowerCase().includes(q) ||
        (i.sku ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const setQtyForId = (id: string, value: number) => {
    setPerItemQty((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const handleSubmit = async () => {
    setError("");
    if (selectedIds.length === 0) {
      setError("Select at least one variant.");
      return;
    }
    if (mode === "same") {
      if (quantity < 1) {
        setError("Quantity must be at least 1.");
        return;
      }
    } else {
      const itemsWithQty = selectedIds.filter((id) => (perItemQty[id] ?? 0) > 0);
      if (itemsWithQty.length === 0) {
        setError("Enter at least one quantity for selected items.");
        return;
      }
    }
    setSaving(true);
    try {
      const body =
        mode === "per_item"
          ? {
              items: selectedIds
                .map((id) => ({ variant_id: id, quantity: perItemQty[id] ?? 0 }))
                .filter((i) => i.quantity > 0),
              reason: reason.trim() || undefined,
            }
          : {
              variant_ids: selectedIds,
              action,
              quantity,
              reason: reason.trim() || undefined,
            };
      const res = await fetch("/api/admin/stock/bulk-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data?.error === "string" ? data.error : "Bulk update failed");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stock-stats"] });
      toast.success("Bulk stock update applied");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      toast.error("Bulk stock update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label="Close modal"
      />
      <div className="relative glass rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2b2f33]">Bulk Update Stock</h2>
            <p className="text-xs text-[#9aa6b0]">Select multiple variants to adjust stock</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-[#9aa6b0]" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <span className="block text-sm font-medium text-[#6b7280] mb-1">Mode</span>
            <SearchableSelect
              value={mode}
              onChange={(value) => setMode(value as BulkMode)}
              options={[
                { value: "same", label: "Same quantity for all" },
                { value: "per_item", label: "Different quantity per item" },
              ]}
              allowClear={false}
            />
          </div>
          {mode === "same" && (
            <>
              <div>
                <label htmlFor="bulk-action" className="block text-sm font-medium text-[#6b7280] mb-1">
                  Action
                </label>
                <SearchableSelect
                  value={action}
                  onChange={(value) => setAction(value)}
                  options={[
                    { value: "add", label: "Add Stock" },
                    { value: "remove", label: "Remove Stock" },
                    { value: "set", label: "Set Stock" },
                  ]}
                  allowClear={false}
                />
              </div>
              <div>
                <label htmlFor="bulk-quantity" className="block text-sm font-medium text-[#6b7280] mb-1">
                  Quantity
                </label>
                <input
                  id="bulk-quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="admin-btn-secondary w-full min-w-[100px] py-2 px-3 rounded-xl text-sm"
                />
              </div>
            </>
          )}
          <div className="min-w-[180px]">
            <label htmlFor="bulk-reason" className="block text-sm font-medium text-[#6b7280] mb-1">
              Reason (optional)
            </label>
            <input
              id="bulk-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="admin-btn-secondary flex items-center gap-2 px-3 py-2 rounded-xl">
          <label htmlFor="bulk-search" className="sr-only">
            Search variants
          </label>
          <input
            id="bulk-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variants..."
            className="flex-1 bg-transparent text-sm outline-none text-[#2b2f33] placeholder-[#9aa6b0]"
          />
          <span className="text-xs text-[#9aa6b0]">{selectedIds.length} selected</span>
        </div>

        <div className="max-h-64 overflow-y-auto border border-white/60 rounded-xl">
          {(filtered ?? []).map((item) => {
            const checked = selectedIds.includes(item.id);
            const qty = perItemQty[item.id] ?? (mode === "per_item" ? 0 : quantity);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/60"
              >
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleId(item.id)}
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2b2f33]">
                    {item.product_title} — {item.variant_name}
                  </p>
                  <p className="text-xs text-[#9aa6b0]">
                    Available: {item.available} {item.sku ? `• ${item.sku}` : ""}
                  </p>
                </div>
                {mode === "per_item" && (
                  <div className="shrink-0 w-24">
                    <label htmlFor={`qty-${item.id}`} className="sr-only">
                      Quantity for {item.variant_name}
                    </label>
                    <input
                      id={`qty-${item.id}`}
                      type="number"
                      min={0}
                      value={checked ? (perItemQty[item.id] ?? "") : ""}
                      onChange={(e) =>
                        setQtyForId(item.id, Number(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="admin-btn-secondary w-full py-1.5 px-2 rounded-lg text-sm text-center"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="admin-btn-secondary flex-1 py-2.5 rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="admin-btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium"
          >
            {saving ? "Updating..." : "Apply Bulk Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
