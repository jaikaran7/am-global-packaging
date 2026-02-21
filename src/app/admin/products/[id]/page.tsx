"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductEditorForm from "@/components/admin/products/ProductEditorForm";
import type { ProductEditorValues } from "@/components/admin/products/ProductEditorForm";

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

async function fetchProduct(id: string): Promise<ProductWithRelations> {
  const res = await fetch(`/api/admin/products/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Product not found");
    throw new Error("Failed to load product");
  }
  return res.json();
}

async function fetchCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default function EditProductPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  async function saveProduct(data: ProductEditorValues): Promise<{ id: string } | undefined> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        slug: data.slug,
        category_id: data.category_id ?? null,
        short_description: data.short_description ?? null,
        marketing_text: data.marketing_text ?? null,
        active: data.active,
        featured: data.featured,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Failed to save");
    }
    const updated = await res.json();
    queryClient.setQueryData(["admin-product", id], (old: ProductWithRelations | undefined) => (old ? { ...old, ...updated } : updated));
    return { id };
  }

  if (!id) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-[#6b7280]">Invalid product ID.</div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-red-600">
        {(error as Error).message}
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-[#6b7280]">Loading product…</div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight mb-6">Edit product</h1>
      <ProductEditorForm
        mode="edit"
        productId={id}
        initialData={product}
        categories={categories}
        saveProduct={saveProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products-stats"] });
        }}
        refetchProduct={refetch}
      />
    </div>
  );
}
