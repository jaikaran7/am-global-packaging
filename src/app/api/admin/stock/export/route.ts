import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, product_id, name, sku, stock, reserved_stock, incoming_stock, stock_warning_threshold");

    const productIds = [...new Set((variants ?? []).map((v) => v.product_id))];

    const [productsRes, categoriesRes] = await Promise.all([
      productIds.length
        ? supabase.from("products").select("id, title, category_id").in("id", productIds)
        : Promise.resolve({ data: [] }),
      supabase.from("categories").select("id, name"),
    ]);

    const productMap = Object.fromEntries((productsRes.data ?? []).map((p) => [p.id, p]));
    const categoryMap = Object.fromEntries((categoriesRes.data ?? []).map((c) => [c.id, c]));

    const header = "Category,Product,Variant,SKU,Available,Reserved,Incoming,Remaining,Status\n";
    const rows = (variants ?? []).map((v) => {
      const product = productMap[v.product_id];
      const category = product?.category_id ? categoryMap[product.category_id] : null;
      const available = v.stock ?? 0;
      const reserved = v.reserved_stock ?? 0;
      const incoming = v.incoming_stock ?? 0;
      const remaining = available - reserved;
      const threshold = v.stock_warning_threshold ?? 5;
      let status = "In Stock";
      if (remaining <= 0) status = "Out of Stock";
      else if (remaining <= threshold) status = "Low Stock";

      const escape = (s: string) => `"${(s ?? "").replaceAll('"', '""')}"`;
      return [
        escape(category?.name ?? "Uncategorized"),
        escape(product?.title ?? "Unknown"),
        escape(v.name ?? "Default"),
        escape(v.sku ?? ""),
        available,
        reserved,
        incoming,
        remaining,
        status,
      ].join(",");
    });

    const csv = header + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="stock-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (e) {
    console.error("[admin/stock/export] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
