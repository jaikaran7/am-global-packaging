import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productLine = searchParams.get("product_line");

    const supabase = createAdminClient();

    // Use `any` to avoid TS "type instantiation is excessively deep" with Supabase
    // chained query-builder generics.
    const applyLine = (q: any): any => {
      if (productLine === "papers" || productLine === "boxes") {
        return q.eq("product_line", productLine);
      }
      return q;
    };

    const [totalRes, newRes, contactRes, cancelledRes, successfulRes, followUpRes] = await Promise.all([
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true })),
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new")),
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["contact", "contacted"])),
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["cancelled", "closed"])),
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "successful")),
      applyLine(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "follow_up")),
    ]);

    return NextResponse.json({
      total: totalRes.count ?? 0,
      new: newRes.count ?? 0,
      contact: contactRes.count ?? 0,
      cancelled: cancelledRes.count ?? 0,
      successful: successfulRes.count ?? 0,
      follow_up: followUpRes.count ?? 0,
    });
  } catch (e) {
    console.error("[api/admin/enquiries/stats] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
