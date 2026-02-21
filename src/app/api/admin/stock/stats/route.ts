import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("stock, reserved_stock, stock_warning_threshold");

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
