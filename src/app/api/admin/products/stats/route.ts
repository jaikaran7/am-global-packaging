import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [productsCount, activeCount, lowStockCount, categoriesCount] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .lte("stock", 5)
        .gt("stock", 0),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      totalProducts: productsCount.count ?? 0,
      activeProducts: activeCount.count ?? 0,
      lowStockItems: lowStockCount.count ?? 0,
      categories: categoriesCount.count ?? 0,
    });
  } catch (e) {
    console.error("[admin/products/stats] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
