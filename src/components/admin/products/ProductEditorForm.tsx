"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import VariantCard from "./VariantCard";
import VariantEditorForm from "./VariantEditorForm";
import ImageUploader from "./ImageUploader";
import { SearchableSelect } from "@/components/ui/select";

const productEditorSchema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  short_description: z.string().optional(),
  marketing_text: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
});

export type ProductEditorValues = z.infer<typeof productEditorSchema>;

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

type ProductWithRelations = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  marketing_text: string | null;
  active: boolean;
  featured: boolean;
  variants: Variant[];
  images: ProductImage[];
};

interface ProductEditorFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: ProductWithRelations | null;
  categories: { id: string; name: string; slug: string }[];
  defaultCategoryId?: string | null;
  onSuccess: (payload?: { id?: string }) => void;
  saveProduct: (data: ProductEditorValues) => Promise<{ id: string } | undefined>;
  refetchProduct?: () => void;
}

export default function ProductEditorForm({
  mode,
  productId,
  initialData,
  categories,
  defaultCategoryId,
  onSuccess,
  saveProduct,
  refetchProduct,
}: ProductEditorFormProps) {
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const form = useForm<ProductEditorValues>({
    resolver: zodResolver(productEditorSchema),
    defaultValues: {
      title: "",
      slug: "",
      category_id: defaultCategoryId ?? null,
      short_description: "",
      marketing_text: "",
      active: true,
      featured: false,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      title: initialData.title,
      slug: initialData.slug,
      category_id: initialData.category_id ?? null,
      short_description: initialData.short_description ?? "",
      marketing_text: initialData.marketing_text ?? "",
      active: initialData.active ?? true,
      featured: initialData.featured ?? false,
    });
  }, [initialData, form]);

  const title = form.watch("title");
  useEffect(() => {
    if (mode === "create" && title && !form.getValues("slug")) {
      const slug = title.toLowerCase().replaceAll(/\s+/g, "-").replaceAll(/[^a-z0-9-]/g, "");
      form.setValue("slug", slug);
    }
  }, [mode, title, form]);

  async function onSubmit(data: ProductEditorValues) {
    try {
      const result = await saveProduct(data);
      onSuccess(result);
    } catch (err) {
      form.setError("root", { message: (err as Error).message });
    }
  }

  const variants = initialData?.variants ?? [];
  const productImages = (initialData?.images ?? []).filter((img) => !img.variant_id);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {form.formState.errors.root && (
        <div className="glass rounded-xl p-4 text-red-600 text-sm">
          {form.formState.errors.root.message}
        </div>
      )}

      <div className="glass glass--soft rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#2b2f33] uppercase tracking-wider">Basic info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Title *</label>
            <input {...form.register("title")} className="admin-btn-secondary w-full py-2 px-3 rounded-xl" />
            {form.formState.errors.title && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Slug</label>
            <input {...form.register("slug")} className="admin-btn-secondary w-full py-2 px-3 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Category</label>
            <SearchableSelect
              value={form.watch("category_id") ?? ""}
              onChange={(value) => form.setValue("category_id", value || null)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="— Select —"
            />
          </div>
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("active")} className="rounded" />
              <span className="text-sm text-[#2b2f33]">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("featured")} className="rounded" />
              <span className="text-sm text-[#2b2f33]">Featured</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6b7280] mb-1">Short description</label>
          <input {...form.register("short_description")} className="admin-btn-secondary w-full py-2 px-3 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6b7280] mb-1">Marketing text / Key features</label>
          <textarea {...form.register("marketing_text")} rows={4} className="admin-btn-secondary w-full py-2 px-3 rounded-xl" />
        </div>
      </div>

      {productId && (
        <ImageUploader
          productId={productId}
          variantId={null}
          images={productImages}
          onUploaded={() => refetchProduct?.()}
        />
      )}

      {productId && (
        <div className="glass glass--soft rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2b2f33] uppercase tracking-wider">
              Variants ({variants.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingVariantId(null);
                setShowVariantForm(true);
              }}
              className="admin-btn-primary text-sm py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" /> Add variant
            </button>
          </div>

          {showVariantForm && (
            <VariantEditorForm
              productId={productId}
              variantId={editingVariantId}
              onSaved={() => {
                setShowVariantForm(false);
                setEditingVariantId(null);
                refetchProduct?.();
              }}
              onCancel={() => {
                setShowVariantForm(false);
                setEditingVariantId(null);
              }}
            />
          )}

          {variants.length === 0 && !showVariantForm && (
            <p className="text-sm text-[#6b7280]">No variants yet. Add one to define sizes/options.</p>
          )}

          <div className="space-y-3 mt-4">
            {variants.map((v) => (
              <VariantCard
                key={v.id}
                variant={v}
                images={(initialData?.images ?? []).filter((img) => img.variant_id === v.id)}
                onEdit={() => {
                  setEditingVariantId(v.id);
                  setShowVariantForm(true);
                }}
                onDelete={async () => {
                  if (!confirm(`Delete variant "${v.name}"?`)) return;
                  await fetch(`/api/admin/variants/${v.id}`, { method: "DELETE" });
                  refetchProduct?.();
                }}
                onRefresh={() => refetchProduct?.()}
                productId={productId}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={form.formState.isSubmitting} className="admin-btn-primary px-6 py-2.5 text-sm font-medium">
          {mode === "create" ? "Create product" : "Save changes"}
        </button>
        <Link href="/admin/products" className="admin-btn-secondary px-6 py-2.5 text-sm font-medium inline-block">
          Cancel
        </Link>
        {mode === "edit" && productId && initialData && (
          <Link
            href={`/products/${initialData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-secondary px-6 py-2.5 text-sm font-medium inline-block"
          >
            Preview product →
          </Link>
        )}
      </div>
    </form>
  );
}
