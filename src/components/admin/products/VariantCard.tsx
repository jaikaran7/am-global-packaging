"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import ImageUploader from "./ImageUploader";
import { SearchableSelect } from "@/components/ui/select";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  moq: number;
  dimensions: { length_mm?: number; width_mm?: number; height_mm?: number } | null;
  gsm: number | null;
  ply: number | null;
  stock: number;
  is_primary: boolean;
  technical_spec: Record<string, string> | null;
};

type ProductImage = {
  id: string;
  url: string;
  is_primary: boolean;
  variant_id: string | null;
};

interface VariantCardProps {
  variant: Variant;
  images: ProductImage[];
  productId: string;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2 }).format(n);
}

function dimsString(d: Variant["dimensions"]) {
  if (!d) return null;
  const l = d.length_mm ?? 0;
  const w = d.width_mm ?? 0;
  const h = d.height_mm ?? 0;
  if (!l && !w && !h) return null;
  return `${l} × ${w} × ${h} mm`;
}

export default function VariantCard({
  variant,
  images,
  productId,
  onEdit,
  onDelete,
  onRefresh,
}: VariantCardProps) {
  const [showStockAdjust, setShowStockAdjust] = useState(false);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"incoming" | "outgoing" | "adjustment">("incoming");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);

  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const dims = dimsString(variant.dimensions);

  async function handleStockAdjust() {
    const num = Number.parseInt(adjustQty, 10);
    if (Number.isNaN(num) || num <= 0) return;
    setAdjusting(true);
    try {
      await fetch(`/api/admin/variants/${variant.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movement_type: adjustType, qty: num, note: adjustNote || undefined }),
      });
      setShowStockAdjust(false);
      setAdjustQty("");
      setAdjustNote("");
      onRefresh();
    } finally {
      setAdjusting(false);
    }
  }

  async function handleSetPrimary() {
    await fetch(`/api/admin/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_primary: true }),
    });
    onRefresh();
  }

  return (
    <div className="p-4 rounded-xl bg-white/60 border border-white/80 space-y-3">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0 relative overflow-hidden">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={variant.name} fill className="object-cover" sizes="80px" />
          ) : (
            <CubeIcon className="w-8 h-8 text-[#9aa6b0]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#2b2f33]">{variant.name}</h4>
            {variant.is_primary ? (
              <span className="text-amber-500" title="Primary variant">
                <StarSolidIcon className="w-4 h-4" />
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSetPrimary}
                className="text-[#9aa6b0] hover:text-amber-500"
                title="Set as primary"
              >
                <StarIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-[#6b7280]">
            {variant.sku && <span className="mr-2">SKU: {variant.sku}</span>}
            {dims && <span className="mr-2">{dims}</span>}
          </p>
          <p className="text-sm font-semibold text-[#ff7a2d] mt-1">{formatPrice(variant.price)}</p>
          <p className="text-xs text-[#6b7280]">
            MOQ: {variant.moq} · Stock: {variant.stock > 0 ? (
              <span className="text-emerald-600">{variant.stock}</span>
            ) : (
              <span className="text-red-600">0</span>
            )}
            {variant.gsm && ` · ${variant.gsm} GSM`}
            {variant.ply && ` · ${variant.ply}-Ply`}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={onEdit} className="p-2 rounded-lg text-[#6b7280] hover:bg-white/80" title="Edit">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowStockAdjust((p) => !p)}
            className="p-2 rounded-lg text-[#6b7280] hover:bg-white/80"
            title="Adjust stock"
          >
            {showStockAdjust ? <MinusIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showStockAdjust && (
        <div className="flex flex-wrap gap-2 items-end pt-2 border-t border-[#e5e7eb]">
          <div className="min-w-[160px]">
            <SearchableSelect
              value={adjustType}
              onChange={(value) => setAdjustType(value as typeof adjustType)}
              options={[
                { value: "incoming", label: "Incoming" },
                { value: "outgoing", label: "Outgoing" },
                { value: "adjustment", label: "Adjustment" },
              ]}
              placeholder="Adjustment type"
              allowClear={false}
            />
          </div>
          <input
            type="number"
            min="1"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            placeholder="Qty"
            className="admin-btn-secondary py-1.5 px-2 rounded-lg text-sm w-20"
          />
          <input
            type="text"
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.target.value)}
            placeholder="Note"
            className="admin-btn-secondary py-1.5 px-2 rounded-lg text-sm flex-1 min-w-[100px]"
          />
          <button
            type="button"
            onClick={handleStockAdjust}
            disabled={adjusting}
            className="admin-btn-primary py-1.5 px-3 text-sm"
          >
            {adjusting ? "…" : "Apply"}
          </button>
        </div>
      )}

      <div className="pt-2 border-t border-[#e5e7eb]">
        <button
          type="button"
          onClick={() => setShowImageUploader((p) => !p)}
          className="text-sm text-[#6b7280] hover:text-[#ff7a2d]"
        >
          {showImageUploader ? "Hide images" : `Images (${images.length})`}
        </button>
        {showImageUploader && (
          <div className="mt-2">
            <ImageUploader
              productId={productId}
              variantId={variant.id}
              images={images}
              onUploaded={onRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
}
