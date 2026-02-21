"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard, { type AdminProductItem } from "./ProductCard";
import ProductFilters, { type CategoryOption } from "./ProductFilters";

type ListResponse = {
  items: AdminProductItem[];
  total: number;
  page: number;
  limit: number;
};

async function fetchProducts(params: {
  category?: string | null;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ListResponse> {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.search) sp.set("search", params.search);
  if (params.status) sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit ?? 20));
  const res = await fetch(`/api/admin/products?${sp.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to fetch products");
  }
  return res.json();
}

async function fetchCategories(): Promise<CategoryOption[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to delete");
  }
}

interface ProductListProps {
  categoryId: string | null;
  ply: number | null;
  search: string;
  status: string;
  page: number;
  viewMode: "grid" | "list";
  onCategoryChange: (id: string | null) => void;
  onPlyChange: (ply: number | null) => void;
}

export default function ProductList({
  categoryId,
  ply,
  search,
  status,
  page,
  viewMode,
  onCategoryChange,
  onPlyChange,
}: ProductListProps) {
  const queryClient = useQueryClient();

  const { data: list, isLoading, error } = useQuery({
    queryKey: ["admin-products", categoryId, search, status, page],
    queryFn: () => fetchProducts({ category: categoryId, search: search || undefined, status: status || undefined, page, limit: 20 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-red-600">
        {(error as Error).message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-[#6b7280]">
        Loading products…
      </div>
    );
  }

  const items = list?.items ?? [];
  const total = list?.total ?? 0;

  return (
    <div className="flex gap-6">
      <ProductFilters
        categories={categories}
        selectedCategoryId={categoryId}
        selectedPly={ply}
        onCategoryChange={onCategoryChange}
        onPlyChange={onPlyChange}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#6b7280] mb-4">
          Showing {items.length} of {total} products
          {categoryId && categories.find((c) => c.id === categoryId) && (
            <> in {categories.find((c) => c.id === categoryId)?.name}</>
          )}
        </p>
        {items.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-[#6b7280]">
            No products match your filters.
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={(id) => {
                  if (confirm("Delete this product?")) deleteMutation.mutate(id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={(id) => {
                  if (confirm("Delete this product?")) deleteMutation.mutate(id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
