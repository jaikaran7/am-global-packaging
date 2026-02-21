import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuotationPdf } from "@/lib/quotations/pdf";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: quote } = await supabase
      .from("quotations")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single();

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("quotation_items")
      .select("*, product:products(id,title), variant:product_variants(id,name)")
      .eq("quotation_id", id);

    const pdfBytes = await generateQuotationPdf({
      quote_number: quote.quote_number,
      status: quote.status,
      created_at: quote.created_at,
      valid_until: quote.valid_until,
      notes: quote.notes,
      terms_text: quote.terms_text || DEFAULT_QUOTE_TERMS,
      gst_percent: Number(quote.gst_percent ?? 10),
      subtotal: Number(quote.subtotal ?? 0),
      tax: Number(quote.tax ?? 0),
      total: Number(quote.total ?? 0),
      customer: {
        name: quote.customer?.name ?? "Customer",
        email: quote.customer?.email ?? null,
        phone: quote.customer?.phone ?? null,
        company: quote.customer?.company ?? null,
        address: quote.customer?.address ?? null,
      },
      items: (items ?? []).map((item) => ({
        product_title: item.product?.title ?? item.custom_name ?? "Custom",
        variant_name: item.variant?.name ?? item.custom_spec ?? "Custom Spec",
        description: item.description ?? item.custom_notes ?? null,
        quantity: item.quantity,
        unit_price: Number(item.unit_price ?? 0),
        subtotal: Number(item.subtotal ?? 0),
      })),
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quote.quote_number}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[admin/quotations/pdf] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
