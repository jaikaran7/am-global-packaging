import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeInvoiceTotals } from "@/lib/invoice-math";
import { mergeCompanySettings } from "@/lib/company-settings-env";
import type { CompanySettingsRow } from "@/lib/company-settings-env";
import { z } from "zod";

async function nextInvoiceNumber(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const { data } = await supabase.from("invoices").select("invoice_number").ilike("invoice_number", `${prefix}%`);
  let max = 0;
  for (const row of data ?? []) {
    const parts = String(row.invoice_number).split("-");
    const n = parseInt(parts[parts.length - 1] ?? "0", 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

function defaultDueDate(fromIsoDate: string): string {
  const d = new Date(fromIsoDate + "T12:00:00");
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function descriptionFromOrderItem(item: {
  product?: { title?: string } | null;
  variant?: { name?: string } | null;
  product_title_snapshot?: string | null;
  variant_name_snapshot?: string | null;
  custom_name?: string | null;
  custom_spec?: string | null;
}): string {
  if (item.custom_name?.trim()) {
    return [item.custom_name, item.custom_spec].filter(Boolean).join(" — ") || "Custom item";
  }
  const v = item.variant_name_snapshot ?? item.variant?.name ?? "";
  const p = item.product_title_snapshot ?? item.product?.title ?? "";
  if (v && p && !v.includes(p)) return `${p} — ${v}`;
  return v || p || "Line item";
}

const lineSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1),
  unit_price: z.number().min(0),
  quantity: z.number().positive(),
  product_id: z.string().uuid().nullable().optional(),
  variant_id: z.string().uuid().nullable().optional(),
});

const putSchema = z.object({
  invoice_date: z.string().optional(),
  due_date: z.string().optional(),
  discount_amount: z.number().min(0).optional(),
  gst_percent: z.number().min(0).max(100).optional(),
  terms_text: z.string().optional().nullable(),
  bill_to_name: z.string().optional().nullable(),
  bill_to_phone: z.string().optional().nullable(),
  bill_to_email: z.string().optional().nullable(),
  bill_to_address: z.string().optional().nullable(),
  status: z.enum(["draft", "generated", "sent", "paid"]).optional(),
  lines: z.array(lineSchema).min(1),
});

/** GET: existing invoice + company settings, or suggested draft from order */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const supabase = createAdminClient();

    const [{ data: settingsRow }, { data: order, error: orderErr }] = await Promise.all([
      supabase.from("company_settings").select("*").limit(1).maybeSingle(),
      supabase.from("orders").select("*, customer:customers(*)").eq("id", orderId).single(),
    ]);

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const company = mergeCompanySettings(settingsRow as Partial<CompanySettingsRow> | null);

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("order_id", orderId)
      .maybeSingle();

    if (invoice) {
      const lines = [...(invoice.invoice_line_items ?? [])].sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
      );
      return NextResponse.json({ company, order, invoice: { ...invoice, invoice_line_items: lines } });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*, product:products(id,title), variant:product_variants(id,name)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    const suggestedLines = (items ?? []).map(
      (item: Record<string, unknown>, idx: number) => {
        const qty = Number(item.quantity ?? 1);
        const unit = Number(item.unit_price ?? 0);
        return {
          sort_order: idx,
          description: descriptionFromOrderItem(item as Parameters<typeof descriptionFromOrderItem>[0]),
          unit_price: unit,
          quantity: qty,
          line_total: Math.round(unit * qty * 100) / 100,
          product_id: item.product_id as string | null,
          variant_id: item.variant_id as string | null,
        };
      }
    );

    const cust = order.customer as Record<string, string | null> | null;
    const today = new Date().toISOString().slice(0, 10);

    return NextResponse.json({
      company,
      order,
      invoice: null,
      suggested: {
        invoice_date: today,
        due_date: defaultDueDate(today),
        discount_amount: 0,
        gst_percent: company.gst_percent_default,
        terms_text: company.invoice_terms_default,
        bill_to_name: cust?.name ?? "",
        bill_to_phone: cust?.phone ?? "",
        bill_to_email: cust?.email ?? "",
        bill_to_address: cust?.address ?? "",
        lines: suggestedLines,
      },
    });
  } catch (e) {
    console.error("[invoice GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST: create invoice row (draft) from current order items */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const supabase = createAdminClient();

    const { data: existing } = await supabase.from("invoices").select("id").eq("order_id", orderId).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Invoice already exists for this order" }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: settingsRow } = await supabase.from("company_settings").select("*").limit(1).maybeSingle();
    const company = mergeCompanySettings(settingsRow as Partial<CompanySettingsRow> | null);

    const { data: items } = await supabase
      .from("order_items")
      .select("*, product:products(id,title), variant:product_variants(id,name)")
      .eq("order_id", orderId);

    if (!items?.length) {
      return NextResponse.json({ error: "Order has no line items" }, { status: 400 });
    }

    const invNo = await nextInvoiceNumber(supabase);
    const today = new Date().toISOString().slice(0, 10);
    const due = defaultDueDate(today);

    const cust = order.customer as Record<string, string | null> | null;

    const lineRows = items.map((item: Record<string, unknown>, idx: number) => {
      const qty = Number(item.quantity ?? 1);
      const unit = Number(item.unit_price ?? 0);
      const lineTotal = Math.round(unit * qty * 100) / 100;
      return {
        sort_order: idx,
        description: descriptionFromOrderItem(item as Parameters<typeof descriptionFromOrderItem>[0]),
        unit_price: unit,
        quantity: qty,
        line_total: lineTotal,
        product_id: item.product_id as string | null,
        variant_id: item.variant_id as string | null,
      };
    });

    const totals = computeInvoiceTotals(
      lineRows.map((l) => l.line_total),
      0,
      company.gst_percent_default
    );

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert([
        {
          order_id: orderId,
          invoice_number: invNo,
          status: "draft",
          invoice_date: today,
          due_date: due,
          discount_amount: 0,
          gst_percent: company.gst_percent_default,
          subtotal: totals.subtotal,
          tax_amount: totals.tax,
          total_amount: totals.total,
          terms_text: company.invoice_terms_default,
          bill_to_name: cust?.name ?? null,
          bill_to_phone: cust?.phone ?? null,
          bill_to_email: cust?.email ?? null,
          bill_to_address: cust?.address ?? null,
        },
      ])
      .select()
      .single();

    if (invErr || !invoice) {
      console.error(invErr);
      return NextResponse.json({ error: invErr?.message ?? "Failed to create invoice" }, { status: 500 });
    }

    const insertLines = lineRows.map((l) => ({
      invoice_id: invoice.id,
      sort_order: l.sort_order,
      description: l.description,
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.line_total,
      product_id: l.product_id,
      variant_id: l.variant_id,
    }));

    const { error: lineErr } = await supabase.from("invoice_line_items").insert(insertLines);
    if (lineErr) {
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json({ error: lineErr.message }, { status: 500 });
    }

    await supabase.from("orders").update({ invoice_status: "draft" }).eq("id", orderId);

    const { data: full } = await supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("id", invoice.id)
      .single();

    return NextResponse.json({ company, invoice: full });
  } catch (e) {
    console.error("[invoice POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PUT: update invoice draft (lines, discount, dates, bill-to, terms) */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const body = await req.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: invoice } = await supabase.from("invoices").select("id").eq("order_id", orderId).maybeSingle();

    if (!invoice) {
      return NextResponse.json({ error: "Create invoice first (POST)" }, { status: 404 });
    }

    const gstPct = parsed.data.gst_percent ?? 10;
    const discount = parsed.data.discount_amount ?? 0;

    const lines = parsed.data.lines.map((l, idx) => {
      const lineTotal = Math.round(l.unit_price * l.quantity * 100) / 100;
      return {
        ...l,
        sort_order: idx,
        line_total: lineTotal,
      };
    });

    const totals = computeInvoiceTotals(
      lines.map((l) => l.line_total),
      discount,
      gstPct
    );

    const invoiceDate = parsed.data.invoice_date ?? new Date().toISOString().slice(0, 10);
    const dueDate = parsed.data.due_date ?? defaultDueDate(invoiceDate);

    const status = parsed.data.status ?? "draft";
    const invUpdate = {
      invoice_date: invoiceDate,
      due_date: dueDate,
      discount_amount: discount,
      gst_percent: gstPct,
      subtotal: totals.subtotal,
      tax_amount: totals.tax,
      total_amount: totals.total,
      terms_text: parsed.data.terms_text ?? null,
      bill_to_name: parsed.data.bill_to_name ?? null,
      bill_to_phone: parsed.data.bill_to_phone ?? null,
      bill_to_email: parsed.data.bill_to_email ?? null,
      bill_to_address: parsed.data.bill_to_address ?? null,
      status,
      updated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabase.from("invoices").update(invUpdate).eq("order_id", orderId);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    await supabase.from("invoice_line_items").delete().eq("invoice_id", invoice.id);

    const lineIns = lines.map((l, idx) => ({
      invoice_id: invoice.id,
      sort_order: idx,
      description: l.description,
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.line_total,
      product_id: l.product_id ?? null,
      variant_id: l.variant_id ?? null,
    }));

    const { error: liErr } = await supabase.from("invoice_line_items").insert(lineIns);
    if (liErr) {
      return NextResponse.json({ error: liErr.message }, { status: 500 });
    }

    const mapStatus: Record<string, "draft" | "generated" | "sent" | "paid" | "none"> = {
      draft: "draft",
      generated: "generated",
      sent: "sent",
      paid: "paid",
    };
    await supabase.from("orders").update({ invoice_status: mapStatus[status] ?? "draft" }).eq("id", orderId);

    const { data: settingsRow } = await supabase.from("company_settings").select("*").limit(1).maybeSingle();
    const company = mergeCompanySettings(settingsRow as Partial<CompanySettingsRow> | null);

    const { data: full } = await supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("order_id", orderId)
      .single();

    return NextResponse.json({ company, invoice: full });
  } catch (e) {
    console.error("[invoice PUT]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
