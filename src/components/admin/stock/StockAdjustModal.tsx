"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface StockAdjustModalProps {
  variant: {
    id: string;
    variant_name: string;
    product_title: string;
    available: number;
    reserved: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustModal({
  variant,
  onClose,
  onSuccess,
}: StockAdjustModalProps) {
  const [type, setType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: variant.id,
          type,
          quantity,
        reason: reason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to adjust stock");
      }
      toast.success("Stock updated");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      toast.error("Stock update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2b2f33]">Adjust Stock</h2>
            <p className="text-xs text-[#9aa6b0] mt-0.5">
              {variant.product_title} — {variant.variant_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#9aa6b0]" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#6b7280]">Current stock:</span>
          <span className="font-semibold text-[#2b2f33]">{variant.available}</span>
          <span className="text-[#9aa6b0]">|</span>
          <span className="text-[#6b7280]">Reserved:</span>
          <span className="font-semibold text-[#2b2f33]">{variant.reserved}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("add")}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === "add"
                    ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                    : "admin-btn-secondary"
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setType("remove")}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === "remove"
                    ? "bg-red-50 text-red-700 ring-2 ring-red-200"
                    : "admin-btn-secondary"
                }`}
              >
                - Remove Stock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="admin-btn-secondary w-full py-2.5 px-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Enter reason for adjustment..."
              className="admin-btn-secondary w-full py-2.5 px-3 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

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
            {saving ? "Saving..." : "Confirm Adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}
