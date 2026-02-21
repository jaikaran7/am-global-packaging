"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductEditorForm from "@/components/admin/products/ProductEditorForm";
import type { ProductEditorValues } from "@/components/admin/products/ProductEditorForm";

async function fetchCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

function NewProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCategoryId = searchParams.get("category") ?? null;

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  async function saveProduct(data: ProductEditorValues): Promise<{ id: string } | undefined> {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        slug: data.slug || undefined,
        category_id: data.category_id || null,
        short_description: data.short_description || undefined,
        marketing_text: data.marketing_text || undefined,
        active: data.active,
        featured: data.featured,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.title?.[0] ?? err?.error ?? "Failed to create");
    }
    const product = await res.json();
    return { id: product.id };
  }

  function onSuccess(payload?: { id?: string }) {
    if (payload?.id) router.replace(`/admin/products/${payload.id}`);
    else router.push("/admin/products");
  }

  return (
    <ProductEditorForm
      mode="create"
      categories={categories}
      defaultCategoryId={defaultCategoryId}
      saveProduct={saveProduct}
      onSuccess={onSuccess}
    />
  );
}

export default function NewProductPage() {
  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight mb-6">Add product</h1>
      <Suspense fallback={<div className="glass rounded-2xl p-8 text-center text-[#6b7280]">Loading...</div>}>
        <NewProductContent />
      </Suspense>
    </div>
  );
}
