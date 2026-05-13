import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productLine = searchParams.get("product_line");

    const supabase = createAdminClient();

    let query = supabase.from("orders").select("status");
    if (productLine === "papers" || productLine === "boxes") {
      query = query.eq("product_line", productLine);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts: Record<string, number> = {
      all: 0,
      draft: 0,
      pending_confirmation: 0,
      confirmed: 0,
      in_production: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      obsolete: 0,
    };

    for (const o of orders ?? []) {
      counts.all++;
      if (counts[o.status] !== undefined) counts[o.status]++;
    }

    return NextResponse.json(counts);
  } catch (e) {
    console.error("[admin/orders/stats] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
