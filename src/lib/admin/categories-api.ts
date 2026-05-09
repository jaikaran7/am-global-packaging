/** Matches categories.product_line and ProductLineContext */
export type CategoryProductLine = "boxes" | "papers";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  product_line?: string;
};

export async function fetchAdminCategories(productLine: CategoryProductLine): Promise<AdminCategoryRow[]> {
  const res = await fetch(`/api/admin/categories?product_line=${productLine}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export function adminCategoriesQueryKey(productLine: CategoryProductLine) {
  return ["admin-categories", productLine] as const;
}
