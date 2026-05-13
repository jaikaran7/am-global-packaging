"use client";

import { useState, useEffect, useRef } from "react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { SearchableSelect } from "@/components/ui/select";
import { formatVariantSelectLabel } from "@/lib/admin/order-item-variant-label";
import { audFromStoredVariant } from "@/lib/currency-usd-aud";

type Product = { id: string; title: string };
type Variant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  reserved_stock: number;
  currency?: string | null;
  size_label?: string | null;
  gsm?: number | null;
  ply?: number | null;
  dimensions?: unknown;
};

function normalizeVariantPrice(raw: unknown): number {
  if (raw == null || raw === "") return 0;
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : 0;
}

/** Same numbers as quotation PDF/customer-facing papers line (USD → AUD when applicable). */
function defaultQuotableUnitPrice(v: Variant, productLine: "papers" | "boxes"): number {
  const base = normalizeVariantPrice(v.price);
  if (productLine !== "papers") return Math.round(base * 100) / 100;
  return audFromStoredVariant(base, v.currency ?? "USD");
}

interface QuotationItemRowProps {
  index: number;
  item: {
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    description?: string;
    custom_name?: string;
    custom_spec?: string;
    custom_notes?: string;
  };
  products: Product[];
  /** Used to default papers catalogue prices from USD storage to AUD. */
  productLine: "papers" | "boxes";
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function QuotationItemRow({
  index,
  item,
  products,
  productLine,
  onChange,
  onRemove,
  disabled,
}: Readonly<QuotationItemRowProps>) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const prevVariantIdRef = useRef<string | null>(null);

  useEffect(() => {
    prevVariantIdRef.current = null;
  }, [item.product_id]);

  useEffect(() => {
    if (!item.product_id || item.product_id === "custom") {
      setVariants([]);
      return;
    }
    setVariants([]);
    setLoadingVariants(true);
    fetch(`/api/admin/products/${item.product_id}/variants`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setVariants(list);
        if (list.length === 1 && !item.variant_id) {
          const v0 = list[0] as Variant;
          const p0 = defaultQuotableUnitPrice(v0, productLine);
          onChange(index, "variant_id", v0.id);
          onChange(index, "unit_price", p0);
        }
      })
      .catch(() => setVariants([]))
      .finally(() => setLoadingVariants(false));
  }, [item.product_id, productLine]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loadingVariants || disabled) return;
    if (!item.product_id || item.product_id === "custom" || item.product_id === "") return;
    if (!item.variant_id || item.variant_id === "custom") return;
    const v = variants.find((vr) => vr.id === item.variant_id);
    if (!v) return;
    const price = defaultQuotableUnitPrice(v, productLine);
    if (price <= 0) return;
    const prev = prevVariantIdRef.current;
    const variantJustChanged = prev !== item.variant_id;
    prevVariantIdRef.current = item.variant_id;
    if (!variantJustChanged) return;
    /** Opening a saved quote: don't replace a stored positive price — only fill gaps (0/missing). */
    if (prev === null && item.unit_price > 0) return;
    onChange(index, "unit_price", price);
  }, [loadingVariants, variants, item.product_id, item.variant_id, item.unit_price, disabled, productLine, index, onChange]);

  const selectedVariant = variants.find((v) => v.id === item.variant_id);
  const available = selectedVariant
    ? selectedVariant.stock - (selectedVariant.reserved_stock ?? 0)
    : null;
  const isInsufficient = available !== null && available < item.quantity;
  const subtotal = item.quantity * item.unit_price;
  const isCustom = item.product_id === "custom";

  const productOptions = [
    ...products.map((p) => ({ value: p.id, label: p.title })),
    { value: "custom", label: "➕ Custom" },
  ];

  const variantOptions = [
    ...variants.map((v) => ({
      value: v.id,
      label: formatVariantSelectLabel(v),
    })),
    ...(!isCustom ? [{ value: "custom", label: "➕ Custom" }] : []),
  ];

  const isCustomVariant = !isCustom && item.variant_id === "custom";
  const showCustomInputs = isCustom || isCustomVariant;

  const compactSelectClass = "text-xs py-2 px-2.5 rounded-lg min-h-9";
  const compactInputClass = "admin-btn-secondary w-full py-1.5 px-2 rounded-lg text-xs min-h-8";

  return (
    <div className="glass rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-12 gap-2 items-start min-w-0">
        <div className="col-span-12 sm:col-span-3 min-w-0">
          <label htmlFor={`product-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
            Product
          </label>
          <div className="min-w-0">
            <SearchableSelect
              value={item.product_id}
              onChange={(value) => {
                onChange(index, "product_id", value);
                onChange(index, "variant_id", value === "custom" ? "custom" : "");
                onChange(index, "unit_price", 0);
                if (value !== "custom") {
                  onChange(index, "custom_name", "");
                  onChange(index, "custom_spec", "");
                  onChange(index, "custom_notes", "");
                }
              }}
              options={productOptions}
              placeholder="Select product..."
              disabled={disabled}
              buttonClassName={compactSelectClass}
              buttonTextMode="wrap"
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-3 min-w-0">
          <label htmlFor={`variant-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
            Variant
          </label>
          <div className="min-w-0">
            <SearchableSelect
              value={item.variant_id}
              onChange={(value) => {
                onChange(index, "variant_id", value);
                const v = variants.find((vr) => vr.id === value);
                if (v) onChange(index, "unit_price", defaultQuotableUnitPrice(v, productLine));
                if (value === "custom") onChange(index, "unit_price", 0);
              }}
              options={variantOptions}
              placeholder={loadingVariants ? "Loading..." : isCustom ? "Custom product" : "Select variant..."}
              disabled={disabled || loadingVariants || !item.product_id || isCustom}
              buttonClassName={compactSelectClass}
              buttonTextMode="wrap"
            />
          </div>
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-[5.5rem]">
          <label htmlFor={`qty-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
            Qty
          </label>
          <input
            id={`qty-${index}`}
            type="number"
            min={1}
            value={item.quantity || ""}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange(index, "quantity", 0);
                return;
              }
              const next = Number(raw);
              if (!Number.isNaN(next)) {
                onChange(index, "quantity", next);
              }
            }}
            onBlur={(e) => {
              const raw = e.target.value;
              const next = Number(raw);
              if (Number.isNaN(next) || next < 1) {
                onChange(index, "quantity", 1);
              }
            }}
            disabled={disabled}
            className={`${compactInputClass} text-center`}
          />
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-0">
          <label htmlFor={`price-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
            Unit Price
          </label>
          <div className="relative w-full min-w-0">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#9aa6b0]">$</span>
            <input
              id={`price-${index}`}
              type="number"
              min={0}
              step={0.01}
              value={item.unit_price}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onChange(index, "unit_price", Number(e.target.value))}
              disabled={disabled}
              className={`${compactInputClass} pl-5`}
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-2 flex items-end gap-1 flex-wrap min-w-0">
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-[#9aa6b0] mb-1">Subtotal</span>
            <div className="py-1.5 px-2 rounded-lg bg-gray-50/50 text-xs font-medium text-[#2b2f33] truncate">
              ${subtotal.toFixed(2)}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9aa6b0] hover:text-red-500 transition-colors shrink-0"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {selectedVariant && !isCustom && !isCustomVariant && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#9aa6b0]">
            Available:{" "}
            <strong className={available !== null && available <= 0 ? "text-red-500" : "text-[#2b2f33]"}>
              {available ?? 0}
            </strong>
          </span>
          {isInsufficient && (
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <ExclamationTriangleIcon className="w-3.5 h-3.5" />
              Only {available ?? 0} available
            </span>
          )}
        </div>
      )}

      {showCustomInputs && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor={`custom-name-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
              {isCustom ? "Custom Product Name *" : "Custom Variant Name *"}
            </label>
            <input
              id={`custom-name-${index}`}
              type="text"
              value={item.custom_name ?? ""}
              onChange={(e) => onChange(index, "custom_name", e.target.value)}
              disabled={disabled}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label htmlFor={`custom-spec-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
              {isCustom ? "Custom Spec" : "Dimensions / Specs"}
            </label>
            <input
              id={`custom-spec-${index}`}
              type="text"
              value={item.custom_spec ?? ""}
              onChange={(e) => onChange(index, "custom_spec", e.target.value)}
              disabled={disabled}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label htmlFor={`custom-notes-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
              Notes
            </label>
            <input
              id={`custom-notes-${index}`}
              type="text"
              value={item.custom_notes ?? ""}
              onChange={(e) => onChange(index, "custom_notes", e.target.value)}
              disabled={disabled}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
