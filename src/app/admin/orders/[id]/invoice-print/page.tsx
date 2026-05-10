"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InvoicePreviewPanel from "@/components/admin/invoices/InvoicePreviewPanel";
import { computeInvoiceTotals } from "@/lib/invoice-math";
import type { CompanySettingsRow } from "@/lib/company-settings-env";

type Line = {
  description: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

function InvoicePrintInner({ orderId }: Readonly<{ orderId: string }>) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanySettingsRow | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(10);
  const [terms, setTerms] = useState("");
  const [billName, setBillName] = useState("");
  const [billPhone, setBillPhone] = useState("");
  const [billEmail, setBillEmail] = useState("");
  const [billAddress, setBillAddress] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/orders/${orderId}/invoice`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setCompany(data.company ?? null);
        setOrderNumber(data.order?.order_number != null ? String(data.order.order_number) : "");
        setCurrency(data.company?.currency_default ?? "USD");
        if (data.invoice) {
          const inv = data.invoice;
          setInvoiceNumber(inv.invoice_number);
          setInvoiceDate(String(inv.invoice_date).slice(0, 10));
          setDueDate(String(inv.due_date).slice(0, 10));
          setDiscount(Number(inv.discount_amount ?? 0));
          setGstPercent(Number(inv.gst_percent ?? 10));
          setTerms(inv.terms_text ?? "");
          setBillName(inv.bill_to_name ?? "");
          setBillPhone(inv.bill_to_phone ?? "");
          setBillEmail(inv.bill_to_email ?? "");
          setBillAddress(inv.bill_to_address ?? "");
          const lis = (inv.invoice_line_items ?? []).map(
            (li: Record<string, unknown>) => ({
              description: String(li.description ?? ""),
              unit_price: Number(li.unit_price ?? 0),
              quantity: Number(li.quantity ?? 1),
              line_total: Number(li.line_total ?? 0),
            })
          );
          setLines(lis.length ? lis : [{ description: "", unit_price: 0, quantity: 1, line_total: 0 }]);
        } else if (data.suggested) {
          const s = data.suggested;
          setInvoiceDate(s.invoice_date);
          setDueDate(s.due_date);
          setDiscount(s.discount_amount ?? 0);
          setGstPercent(s.gst_percent ?? 10);
          setTerms(s.terms_text ?? "");
          setBillName(s.bill_to_name ?? "");
          setBillPhone(s.bill_to_phone ?? "");
          setBillEmail(s.bill_to_email ?? "");
          setBillAddress(s.bill_to_address ?? "");
          setLines(
            (s.lines ?? []).map((l: Record<string, unknown>) => ({
              description: String(l.description ?? ""),
              unit_price: Number(l.unit_price ?? 0),
              quantity: Number(l.quantity ?? 1),
              line_total: Number(l.line_total ?? 0),
            }))
          );
          setInvoiceNumber(
            typeof data.next_invoice_number === "string" && data.next_invoice_number.trim()
              ? data.next_invoice_number.trim()
              : `INV-${new Date().getFullYear()}-0001`
          );
        }
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load invoice"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const totals = useMemo(() => {
    const lt = lines.map((l) => Math.round(l.unit_price * l.quantity * 100) / 100);
    return computeInvoiceTotals(lt, discount, gstPercent);
  }, [lines, discount, gstPercent]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("autoprint") === "1") {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [loading, err]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#6b7280]">
        Loading invoice…
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-red-600">{err}</p>
        <Link href={`/admin/orders/${orderId}`} className="mt-4 inline-block text-sm text-[#002B36] underline">
          Back to order
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-print-page px-4 py-6 md:px-8 md:py-8">
      <div className="no-print mx-auto mb-6 flex max-w-[820px] flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="admin-btn-primary px-4 py-2 text-sm rounded-xl"
          >
            Print / Save as PDF
          </button>
          <Link
            href={`/admin/orders/${orderId}`}
            className="admin-btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-xl"
          >
            Back to order
          </Link>
        </div>
        <p className="text-xs text-[#6b7280]">
          Use your browser print dialog and choose &quot;Save as PDF&quot; for a file copy. Links stay clickable in the PDF.
        </p>
      </div>

      <div className="invoice-print-document mx-auto max-w-[820px]">
        <InvoicePreviewPanel
          company={company}
          currency={currency}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          dueDate={dueDate}
          referenceNo={orderNumber}
          discount={discount}
          gstPercent={gstPercent}
          terms={terms}
          billName={billName}
          billPhone={billPhone}
          billEmail={billEmail}
          billAddress={billAddress}
          lines={lines}
          totals={{ subtotal: totals.subtotal, tax: totals.tax, total: totals.total }}
          editable={false}
          dateDisplayStyle="dmy"
        />
      </div>
    </div>
  );
}

export default function InvoicePrintPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9aa6b0]">Loading…</div>}>
      <InvoicePrintInner orderId={id} />
    </Suspense>
  );
}
