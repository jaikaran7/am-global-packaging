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

interface OrderItemRowProps {
  index: number;
  item: {
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    custom_name?: string;
    custom_spec?: string;
    custom_notes?: string;
  };
  products: Product[];
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function OrderItemRow({
  index,
  item,
  products,
  onChange,
  onRemove,
  disabled,
}: OrderItemRowProps) {
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

  return (
    <div className="glass rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Product */}
        <div className="col-span-4">
          <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Product</label>
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
          />
        </div>

        {/* Variant */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Variant</label>
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
          />
        </div>

        {/* Quantity */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Qty</label>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onChange(index, "quantity", Math.max(1, Number(e.target.value)))}
            disabled={disabled}
            className="admin-btn-secondary w-full py-2 px-2 rounded-xl text-sm text-center"
          />
        </div>

        {/* Unit Price */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Unit Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9aa6b0]">$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={item.unit_price}
              onChange={(e) => onChange(index, "unit_price", Number(e.target.value))}
              disabled={disabled}
              className="admin-btn-secondary w-full py-2 pl-6 pr-2 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Subtotal + Remove */}
        <div className="col-span-2 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Subtotal</label>
            <div className="py-2 px-2.5 rounded-xl bg-gray-50/50 text-sm font-medium text-[#2b2f33]">
              ${subtotal.toFixed(2)}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 rounded-lg hover:bg-red-50 text-[#9aa6b0] hover:text-red-500 transition-colors mb-0.5"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stock warning */}
      {selectedVariant && !isCustom && !isCustomVariant && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#9aa6b0]">
            Available: <strong className={available !== null && available <= 0 ? "text-red-500" : "text-[#2b2f33]"}>{available ?? 0}</strong>
          </span>
          {isInsufficient && (
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <ExclamationTriangleIcon className="w-3.5 h-3.5" />
              Insufficient stock: need {item.quantity - (available ?? 0)} more units
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
