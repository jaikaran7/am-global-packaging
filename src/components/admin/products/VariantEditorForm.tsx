"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productVariantSchema, type ProductVariantInput } from "@/lib/schemas/product";
import { SearchableSelect } from "@/components/ui/select";

interface VariantEditorFormProps {
  productId: string;
  variantId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function VariantEditorForm({
  productId,
  variantId,
  onSaved,
  onCancel,
}: VariantEditorFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!variantId;

  const form = useForm<ProductVariantInput>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      moq: 1,
      dimensions: {},
      gsm: undefined,
      ply: undefined,
      technical_spec: {},
      is_primary: false,
      stock_warning_threshold: 5,
    },
  });

  useEffect(() => {
    if (!variantId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/variants/${variantId}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            name: data.name ?? "",
            sku: data.sku ?? "",
            price: data.price ?? 0,
            moq: data.moq ?? 1,
            dimensions: data.dimensions ?? {},
            gsm: data.gsm ?? undefined,
            ply: data.ply ?? undefined,
            technical_spec: data.technical_spec ?? {},
            is_primary: data.is_primary ?? false,
            stock_warning_threshold: data.stock_warning_threshold ?? 5,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [variantId, form]);

  async function onSubmit(data: ProductVariantInput) {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/admin/variants/${variantId}`
        : `/api/admin/products/${productId}/variants`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sku: data.sku || undefined,
          price: data.price,
          moq: data.moq,
          dimensions: data.dimensions,
          gsm: data.gsm,
          ply: data.ply,
          technical_spec: data.technical_spec,
          is_primary: data.is_primary,
          stock_warning_threshold: data.stock_warning_threshold,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to save variant");
      }
      onSaved();
    } catch (err) {
      form.setError("root", { message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-xl bg-white/70 border border-white/80 space-y-4 mb-4">
      <h4 className="font-semibold text-[#2b2f33]">{isEdit ? "Edit variant" : "New variant"}</h4>
      {form.formState.errors.root && (
        <p className="text-red-600 text-sm">{form.formState.errors.root.message}</p>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Name *</label>
            <input {...form.register("name")} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" placeholder="e.g. Small 200×200" />
            {form.formState.errors.name && <p className="text-red-600 text-xs mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">SKU</label>
            <input {...form.register("sku")} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Price (AUD)</label>
            <input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">MOQ</label>
            <input type="number" {...form.register("moq", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">L (mm)</label>
            <input type="number" {...form.register("dimensions.length_mm", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">W (mm)</label>
            <input type="number" {...form.register("dimensions.width_mm", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">H (mm)</label>
            <input type="number" {...form.register("dimensions.height_mm", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">GSM</label>
            <input type="number" {...form.register("gsm", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Ply</label>
            <SearchableSelect
              value={form.watch("ply") ? String(form.watch("ply")) : ""}
              onChange={(value) => form.setValue("ply", value ? Number(value) : undefined)}
              options={[
                { value: "3", label: "3" },
                { value: "5", label: "5" },
                { value: "7", label: "7" },
              ]}
              placeholder="—"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Stock warning</label>
            <input type="number" {...form.register("stock_warning_threshold", { valueAsNumber: true })} className="admin-btn-secondary w-full py-2 px-3 rounded-lg text-sm" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <input type="checkbox" {...form.register("is_primary")} className="rounded" id="is_primary" />
            <label htmlFor="is_primary" className="text-sm text-[#2b2f33]">Primary variant (representative)</label>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="admin-btn-primary py-2 px-4 text-sm">
            {loading ? "Saving…" : isEdit ? "Save" : "Create variant"}
          </button>
          <button type="button" onClick={onCancel} className="admin-btn-secondary py-2 px-4 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
