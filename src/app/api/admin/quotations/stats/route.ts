import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: quotes, error } = await supabase
      .from("quotations")
      .select("status")
      .is("deleted_at", null);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const counts: Record<string, number> = {
      all: 0,
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      revised: 0,
      locked: 0,
      cancelled: 0,
    };
    for (const q of quotes ?? []) {
      counts.all++;
      if (counts[q.status] !== undefined) counts[q.status]++;
    }
    return NextResponse.json(counts);
  } catch (e) {
    console.error("[admin/quotations/stats] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
