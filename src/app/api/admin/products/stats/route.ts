import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productLine = searchParams.get("product_line");

    const supabase = createAdminClient();

    let baseQ = supabase.from("products").select("id", { count: "exact", head: true });
    if (productLine === "papers" || productLine === "boxes") {
      baseQ = baseQ.eq("product_line", productLine) as typeof baseQ;
    }

    const [productsCount, activeCount, categoriesCount] = await Promise.all([
      baseQ,
      (() => {
        let q = supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true);
        if (productLine === "papers" || productLine === "boxes") q = q.eq("product_line", productLine);
        return q;
      })(),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    // Low stock: variants whose product matches the product_line
    let lowStockCount = 0;
    if (productLine === "papers" || productLine === "boxes") {
      const { data: lineProducts } = await supabase
        .from("products")
        .select("id")
        .eq("product_line", productLine);
      const productIds = (lineProducts ?? []).map((p) => p.id);
      if (productIds.length > 0) {
        const { data: variants } = await supabase
          .from("product_variants")
          .select("stock, reserved_stock, stock_warning_threshold")
          .in("product_id", productIds);
        for (const v of variants ?? []) {
          const remaining = (v.stock ?? 0) - (v.reserved_stock ?? 0);
          const threshold = v.stock_warning_threshold ?? 5;
          if (remaining <= threshold && remaining >= 0) lowStockCount++;
        }
      }
    } else {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("stock, reserved_stock, stock_warning_threshold");
      for (const v of variants ?? []) {
        const remaining = (v.stock ?? 0) - (v.reserved_stock ?? 0);
        const threshold = v.stock_warning_threshold ?? 5;
        if (remaining <= threshold && remaining >= 0) lowStockCount++;
      }
    }

    return NextResponse.json({
      totalProducts: productsCount.count ?? 0,
      activeProducts: activeCount.count ?? 0,
      lowStockItems: lowStockCount,
      categories: categoriesCount.count ?? 0,
    });
  } catch (e) {
    console.error("[admin/products/stats] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
