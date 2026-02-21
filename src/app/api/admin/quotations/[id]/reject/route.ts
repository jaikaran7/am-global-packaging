import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: quote } = await supabase
      .from("quotations")
      .select("status")
      .eq("id", id)
      .single();

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (quote.status === "accepted") {
      return NextResponse.json({ error: "Accepted quotations cannot be rejected" }, { status: 400 });
    }

    await supabase.from("quotations").update({ status: "rejected" }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/quotations/reject] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
