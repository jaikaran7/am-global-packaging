import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productLine = searchParams.get("product_line");

    const supabase = createAdminClient();

    let variantsQuery = supabase
      .from("product_variants")
      .select("stock, reserved_stock, stock_warning_threshold, product_id");

    if (productLine === "papers" || productLine === "boxes") {
      const { data: lineProducts } = await supabase
        .from("products")
        .select("id")
        .eq("product_line", productLine);
      const productIds = (lineProducts ?? []).map((p) => p.id);
      if (productIds.length === 0) {
        return NextResponse.json({ in_stock: 0, low_stock: 0, out_of_stock: 0 });
      }
      variantsQuery = variantsQuery.in("product_id", productIds);
    }

    const { data: variants, error } = await variantsQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const v of variants ?? []) {
      const remaining = (v.stock ?? 0) - (v.reserved_stock ?? 0);
      const threshold = v.stock_warning_threshold ?? 5;
      if (remaining <= 0) outOfStock++;
      else if (remaining <= threshold) lowStock++;
      else inStock++;
    }

    return NextResponse.json({ in_stock: inStock, low_stock: lowStock, out_of_stock: outOfStock });
  } catch (e) {
    console.error("[admin/stock/stats] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
