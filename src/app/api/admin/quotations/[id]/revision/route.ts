import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Create a new quotation revision (version) from an accepted (or sent) quote.
 * New quote is a draft with parent_quote_id set and version = parent.version + 1.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: parent } = await supabase
      .from("quotations")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (!parent) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const allowedStatuses = ["accepted", "sent", "revised", "locked"];
    if (!allowedStatuses.includes(parent.status)) {
      return NextResponse.json(
        { error: "Only accepted, sent, revised or locked quotations can be revised" },
        { status: 400 }
      );
    }

    const parentVersion = Number(parent.version ?? 1);
    const newVersion = parentVersion + 1;

    const { data: newQuote, error: quoteErr } = await supabase
      .from("quotations")
      .insert([
        {
          customer_id: parent.customer_id,
          status: "draft",
          parent_quote_id: id,
          version: newVersion,
          notes: parent.notes ?? null,
          terms_text: parent.terms_text ?? null,
          valid_until: parent.valid_until ?? null,
          gst_percent: parent.gst_percent ?? 10,
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      ])
      .select()
      .single();

    if (quoteErr) {
      return NextResponse.json({ error: quoteErr.message }, { status: 500 });
    }

    const { data: items } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id);

    if (items && items.length > 0) {
      const newItems = items.map((item) => ({
        quotation_id: newQuote.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        description: item.description ?? null,
        custom_name: (item as { custom_name?: string }).custom_name ?? null,
        custom_spec: (item as { custom_spec?: string }).custom_spec ?? null,
        custom_notes: (item as { custom_notes?: string }).custom_notes ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));
      const { error: itemsErr } = await supabase.from("quotation_items").insert(newItems);
      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
      }
    }

    const { data: fullQuote } = await supabase
      .from("quotations")
      .select("*, customer:customers(*)")
      .eq("id", newQuote.id)
      .single();

    return NextResponse.json(fullQuote);
  } catch (e) {
    console.error("[admin/quotations/revision] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
