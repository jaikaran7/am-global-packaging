"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard, { type AdminProductItem } from "./ProductCard";
import ProductFilters, { type CategoryOption } from "./ProductFilters";
import { useProductLine } from "@/contexts/ProductLineContext";
import { adminCategoriesQueryKey, fetchAdminCategories } from "@/lib/admin/categories-api";
import { useAppConfirm } from "@/contexts/AppConfirmContext";

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
  product_line?: string;
  ply?: number | null;
  paper_size?: string | null;
  gsm?: number | null;
}): Promise<ListResponse> {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.search) sp.set("search", params.search);
  if (params.status) sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit ?? 20));
  if (params.product_line) sp.set("product_line", params.product_line);
  if (params.ply != null) sp.set("ply", String(params.ply));
  if (params.paper_size) sp.set("paper_size", params.paper_size);
  if (params.gsm != null) sp.set("gsm", String(params.gsm));
  const res = await fetch(`/api/admin/products?${sp.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to fetch products");
  }
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
  paperSize: string | null;
  gsm: number | null;
  search: string;
  status: string;
  page: number;
  viewMode: "grid" | "list";
  onCategoryChange: (id: string | null) => void;
  onPlyChange: (ply: number | null) => void;
  onPaperSizeChange: (sizeLabel: string | null) => void;
  onGsmChange: (gsm: number | null) => void;
}

export default function ProductList({
  categoryId,
  ply,
  paperSize,
  gsm,
  search,
  status,
  page,
  viewMode,
  onCategoryChange,
  onPlyChange,
  onPaperSizeChange,
  onGsmChange,
}: ProductListProps) {
  const queryClient = useQueryClient();
  const { activeProductLine } = useProductLine();
  const { confirm } = useAppConfirm();

  const { data: list, isLoading, error } = useQuery({
    queryKey: ["admin-products", activeProductLine, categoryId, search, status, page, ply, paperSize, gsm],
    queryFn: () =>
      fetchProducts({
        category: categoryId,
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 20,
        product_line: activeProductLine,
        ply: activeProductLine === "boxes" ? ply : null,
        paper_size: activeProductLine === "papers" ? paperSize : null,
        gsm: activeProductLine === "papers" ? gsm : null,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: adminCategoriesQueryKey(activeProductLine),
    queryFn: () => fetchAdminCategories(activeProductLine),
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
        productLine={activeProductLine}
        selectedPly={ply}
        onCategoryChange={onCategoryChange}
        onPlyChange={onPlyChange}
        selectedPaperSize={paperSize}
        onPaperSizeChange={onPaperSizeChange}
        selectedGsm={gsm}
        onGsmChange={onGsmChange}
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
                onDelete={async (id) => {
                  const ok = await confirm({
                    title: "Delete product?",
                    description: "This product and its variants will be removed. This cannot be undone.",
                    confirmLabel: "Delete",
                    variant: "danger",
                  });
                  if (ok) deleteMutation.mutate(id);
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
                onDelete={async (id) => {
                  const ok = await confirm({
                    title: "Delete product?",
                    description: "This product and its variants will be removed. This cannot be undone.",
                    confirmLabel: "Delete",
                    variant: "danger",
                  });
                  if (ok) deleteMutation.mutate(id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
