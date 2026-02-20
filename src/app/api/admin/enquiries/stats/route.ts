import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [totalRes, newRes, contactRes, cancelledRes, successfulRes, followUpRes] = await Promise.all([
      supabase.from("enquiries").select("id", { count: "exact", head: true }),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["contact", "contacted"]),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["cancelled", "closed"]),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "successful"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "follow_up"),
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
