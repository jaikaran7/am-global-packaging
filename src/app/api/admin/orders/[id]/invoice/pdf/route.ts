import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderInvoicePdf } from "@/lib/pdf/renderInvoicePdf";
import { mergeCompanySettings } from "@/lib/company-settings-env";
import type { CompanySettingsRow } from "@/lib/company-settings-env";
import type { InvoicePdfData } from "@/lib/pdf/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = createAdminClient();

    const [{ data: invoice }, { data: settingsRow }, { data: order }] = await Promise.all([
      supabase.from("invoices").select("*, invoice_line_items(*)").eq("order_id", orderId).maybeSingle(),
      supabase.from("company_settings").select("*").limit(1).maybeSingle(),
      supabase.from("orders").select("order_number").eq("id", orderId).maybeSingle(),
    ]);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found — create it first" }, { status: 404 });
    }

    const company = mergeCompanySettings(settingsRow as Partial<CompanySettingsRow> | null);
    const lines = [...(invoice.invoice_line_items ?? [])].sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    );

    const discount = Number(invoice.discount_amount ?? 0);
    const gstPct = Number(invoice.gst_percent ?? 10);

    const websiteEnv = process.env.NEXT_PUBLIC_COMPANY_WEBSITE?.trim();
    const websiteDisplay = websiteEnv?.replace(/^https?:\/\//i, "") ?? null;

    const pdfData: InvoicePdfData = {
      invoice_number: invoice.invoice_number,
      reference_no: null,
      invoice_date: String(invoice.invoice_date),
      due_date: invoice.due_date ? String(invoice.due_date).slice(0, 10) : null,
      gst_percent: gstPct,
      subtotal: Number(invoice.subtotal ?? 0),
      discount_amount: discount,
      taxable_base: Math.max(0, Number(invoice.subtotal ?? 0) - discount),
      tax: Number(invoice.tax_amount ?? 0),
      total: Number(invoice.total_amount ?? 0),
      terms_text: invoice.terms_text ?? company.invoice_terms_default,
      company: {
        name: company.company_name,
        tagline: company.tagline,
        abn: company.abn,
        bank_name: company.bank_name,
        bsb: company.bsb,
        account_number: company.account_number,
        address_line: company.address_line,
        phone: company.phone,
        email: company.email,
        gst_note: company.gst_note,
        website_url: websiteDisplay,
      },
      bill_to: {
        name: invoice.bill_to_name ?? "Customer",
        phone: invoice.bill_to_phone,
        email: invoice.bill_to_email,
        address: invoice.bill_to_address,
      },
      lines: lines.map((l: { description: string; unit_price: number; quantity: number; line_total: number }) => ({
        description: l.description,
        unit_price: Number(l.unit_price),
        quantity: Number(l.quantity),
        line_total: Number(l.line_total),
      })),
      currency_label: company.currency_default ?? "AUD",
    };

    const pdfBytes = await renderInvoicePdf(pdfData);

    await supabase
      .from("invoices")
      .update({ status: "generated", updated_at: new Date().toISOString() })
      .eq("id", invoice.id);
    await supabase.from("orders").update({ invoice_status: "generated" }).eq("id", orderId);

    const bytes = Buffer.from(pdfBytes);
    const fn = `${invoice.invoice_number}${order?.order_number ? `-${order.order_number}` : ""}.pdf`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fn}"`,
      },
    });
  } catch (e) {
    console.error("[invoice pdf]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
