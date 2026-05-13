import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderQuotationPdf } from "@/lib/pdf";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";

export async function PATCH(
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
    if (!quote.customer?.email) {
      return NextResponse.json({ error: "Customer email is required to send quote" }, { status: 400 });
    }

    const { data: items } = await supabase
      .from("quotation_items")
      .select("*, product:products(id,title), variant:product_variants(id,name,dimensions)")
      .eq("quotation_id", id);

    const pdfBytes = await renderQuotationPdf({
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
        dimensions_mm: item.variant?.dimensions ?? null,
        quantity: item.quantity,
        unit_price: Number(item.unit_price ?? 0),
        subtotal: Number(item.subtotal ?? 0),
      })),
    });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service is not configured" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "AM Global <no-reply@amglobalpackagingsolutions.com>";

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [quote.customer.email],
      subject: `Your quotation from AM Global Packaging (${quote.quote_number})`,
      html: `
        <p>Hello ${quote.customer.name},</p>
        <p>Thank you for your enquiry. Please find your quotation attached.</p>
        <p>Quote number: <strong>${quote.quote_number}</strong></p>
        <p>Valid until: <strong>${quote.valid_until ?? "N/A"}</strong></p>
        <p>Regards,<br/>AM Global Packaging Solutions</p>
      `,
      attachments: [
        {
          filename: `${quote.quote_number}.pdf`,
          content: Buffer.from(pdfBytes).toString("base64"),
        },
      ],
    });

    if (sendError) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await supabase.from("quotations").update({ status: "sent" }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/quotations/send] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
