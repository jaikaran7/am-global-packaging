import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data, error, count } = await supabase
      .from("stock_movements")
      .select("*", { count: "exact" })
      .eq("variant_id", variantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [], total: count ?? 0, page, limit });
  } catch (e) {
    console.error("[admin/stock/movements] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
