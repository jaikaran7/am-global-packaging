"use client";

import { useState, useEffect } from "react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { SearchableSelect } from "@/components/ui/select";

type Product = { id: string; title: string };
type Variant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  reserved_stock: number;
};

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
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function QuotationItemRow({
  index,
  item,
  products,
  onChange,
  onRemove,
  disabled,
}: Readonly<QuotationItemRowProps>) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    if (!item.product_id || item.product_id === "custom") {
      setVariants([]);
      return;
    }
    setLoadingVariants(true);
    fetch(`/api/admin/products/${item.product_id}/variants`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setVariants(list);
        if (list.length === 1 && !item.variant_id) {
          onChange(index, "variant_id", list[0].id);
          onChange(index, "unit_price", list[0].price ?? 0);
        }
      })
      .catch(() => setVariants([]))
      .finally(() => setLoadingVariants(false));
  }, [item.product_id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      label: `${v.name}${v.sku ? ` (${v.sku})` : ""}`,
    })),
    ...(!isCustom ? [{ value: "custom", label: "➕ Custom" }] : []),
  ];

  const isCustomVariant = !isCustom && item.variant_id === "custom";
  const showCustomInputs = isCustom || isCustomVariant;

  const compactSelectClass = "text-xs py-1.5 px-2.5 rounded-lg min-h-8 h-8";
  const compactInputClass = "admin-btn-secondary w-full py-1.5 px-2 rounded-lg text-xs min-h-8";

  return (
    <div className="glass rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-12 gap-2 items-end min-w-0">
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
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-3 min-w-0">
          <label htmlFor={`variant-${index}`} className="block text-xs font-medium text-[#9aa6b0] mb-1">
            Variant
          </label>
          <div className="min-w-0 [&_[data-slot=trigger]]:min-w-0 [&_[data-slot=trigger]]:truncate">
            <SearchableSelect
              value={item.variant_id}
              onChange={(value) => {
                onChange(index, "variant_id", value);
                const v = variants.find((vr) => vr.id === value);
                if (v) onChange(index, "unit_price", v.price ?? 0);
                if (value === "custom") onChange(index, "unit_price", 0);
              }}
              options={variantOptions}
              placeholder={loadingVariants ? "Loading..." : isCustom ? "Custom product" : "Select variant..."}
              disabled={disabled || loadingVariants || !item.product_id || isCustom}
              buttonClassName={compactSelectClass}
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
            value={item.quantity}
            onChange={(e) => onChange(index, "quantity", Math.max(1, Number(e.target.value)))}
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
