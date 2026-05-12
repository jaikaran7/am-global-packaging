"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { computeInvoiceTotals } from "@/lib/invoice-math";
import type { CompanySettingsRow } from "@/lib/company-settings-env";
import { toast } from "sonner";
import InvoicePreviewPanel from "./InvoicePreviewPanel";

type Line = {
  id?: string;
  description: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  product_id?: string | null;
  variant_id?: string | null;
};

type Props = {
  orderId: string;
  open: boolean;
  onClose: () => void;
};

export default function InvoiceBuilderModal({ orderId, open, onClose }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const [invStatus, setInvStatus] = useState<string>("draft");
  const [currency, setCurrency] = useState("AUD");
  const [company, setCompany] = useState<CompanySettingsRow | null>(null);

  const totals = useMemo(() => {
    const lt = lines.map((l) => Math.round(l.unit_price * l.quantity * 100) / 100);
    return computeInvoiceTotals(lt, discount, gstPercent);
  }, [lines, discount, gstPercent]);

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    fetch(`/api/admin/orders/${orderId}/invoice`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const cur = data.company?.currency_default ?? "AUD";
        setCurrency(cur);
        setCompany(data.company ?? null);
        if (data.invoice) {
          const inv = data.invoice;
          setInvoiceNumber(inv.invoice_number);
          setInvoiceDate(String(inv.invoice_date).slice(0, 10));
          setDueDate(inv.due_date ? String(inv.due_date).slice(0, 10) : "");
          setDiscount(Number(inv.discount_amount ?? 0));
          setGstPercent(Number(inv.gst_percent ?? 10));
          setTerms(inv.terms_text ?? "");
          setBillName(inv.bill_to_name ?? "");
          setBillPhone(inv.bill_to_phone ?? "");
          setBillEmail(inv.bill_to_email ?? "");
          setBillAddress(inv.bill_to_address ?? "");
          setInvStatus(inv.status ?? "draft");
          const lis = (inv.invoice_line_items ?? []).map(
            (li: Record<string, unknown>) => ({
              id: li.id as string,
              description: String(li.description ?? ""),
              unit_price: Number(li.unit_price ?? 0),
              quantity: Number(li.quantity ?? 1),
              line_total: Number(li.line_total ?? 0),
              product_id: li.product_id as string | null,
              variant_id: li.variant_id as string | null,
            })
          );
          setLines(lis.length ? lis : [{ description: "", unit_price: 0, quantity: 1, line_total: 0 }]);
        } else if (data.suggested) {
          const s = data.suggested;
          setInvoiceDate(s.invoice_date);
          setDueDate(s.due_date ? String(s.due_date).slice(0, 10) : "");
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
              product_id: l.product_id as string | null,
              variant_id: l.variant_id as string | null,
            }))
          );
          setInvoiceNumber(
            typeof data.next_invoice_number === "string" && data.next_invoice_number.trim()
              ? data.next_invoice_number.trim()
              : `INV-${new Date().getFullYear()}-0001`
          );
          setInvStatus("none");
        }
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [open, orderId]);

  async function ensureInvoiceExists(): Promise<boolean> {
    const check = await fetch(`/api/admin/orders/${orderId}/invoice`);
    const data = await check.json();
    if (data.invoice) return true;
    const post = await fetch(`/api/admin/orders/${orderId}/invoice`, { method: "POST" });
    if (!post.ok) {
      const err = await post.json().catch(() => ({}));
      toast.error(typeof err?.error === "string" ? err.error : "Could not create invoice");
      return false;
    }
    toast.success("Invoice draft created");
    setLoading(true);
    const reload = await fetch(`/api/admin/orders/${orderId}/invoice`).then((r) => r.json());
    if (reload.invoice) {
      setInvoiceNumber(reload.invoice.invoice_number);
      setInvStatus(reload.invoice.status);
      const lis = (reload.invoice.invoice_line_items ?? []).map((li: Record<string, unknown>) => ({
        id: li.id as string,
        description: String(li.description ?? ""),
        unit_price: Number(li.unit_price ?? 0),
        quantity: Number(li.quantity ?? 1),
        line_total: Number(li.line_total ?? 0),
        product_id: li.product_id as string | null,
        variant_id: li.variant_id as string | null,
      }));
      setLines(lis);
    }
    setLoading(false);
    return true;
  }

  async function handleSave(mark?: "generated" | "sent" | "paid") {
    setSaving(true);
    try {
      const ok = await ensureInvoiceExists();
      if (!ok) return;
      const resolvedStatus =
        mark ??
        (invStatus === "none"
          ? "draft"
          : ["draft", "generated", "sent", "paid"].includes(invStatus)
            ? invStatus
            : "draft");
      const payload = {
        invoice_date: invoiceDate,
        due_date: dueDate,
        discount_amount: discount,
        gst_percent: gstPercent,
        terms_text: terms,
        bill_to_name: billName,
        bill_to_phone: billPhone,
        bill_to_email: billEmail,
        bill_to_address: billAddress,
        status: resolvedStatus,
        lines: lines.map((l) => ({
          description: l.description,
          unit_price: l.unit_price,
          quantity: l.quantity,
          product_id: l.product_id ?? null,
          variant_id: l.variant_id ?? null,
        })),
      };
      const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err?.error === "string" ? err.error : "Save failed");
      }
      toast.success("Invoice saved");
      setInvStatus(mark ?? resolvedStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateLine(i: number, field: keyof Line, val: string | number) {
    setLines((prev) =>
      prev.map((row, idx) => {
        if (idx !== i) return row;
        const next = { ...row, [field]: val };
        if (field === "unit_price" || field === "quantity") {
          next.line_total =
            Math.round(Number(next.unit_price) * Number(next.quantity) * 100) / 100;
        }
        return next;
      })
    );
  }

  function addLine() {
    setLines((p) => [...p, { description: "", unit_price: 0, quantity: 1, line_total: 0 }]);
  }

  function removeLine(i: number) {
    setLines((p) => {
      const next = p.filter((_, idx) => idx !== i);
      return next.length > 0 ? next : p;
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40">
      <div className="flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#002B36]">Invoice builder</h2>
            <p className="text-xs text-[#6b7280]">
              {invoiceNumber} · {currency} · GST {gstPercent}% on (subtotal − discount)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-[#6b7280] hover:bg-gray-100 hover:text-[#002B36]"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#e8edf0]">
          {loading ? (
            <p className="py-16 text-center text-sm text-[#6b7280]">Loading…</p>
          ) : (
            <div className="mx-auto max-w-[880px] px-3 py-5 sm:px-6 sm:py-7">
              <InvoicePreviewPanel
                company={company}
                currency={currency}
                invoiceNumber={invoiceNumber}
                invoiceDate={invoiceDate}
                dueDate={dueDate}
                discount={discount}
                gstPercent={gstPercent}
                terms={terms}
                billName={billName}
                billPhone={billPhone}
                billEmail={billEmail}
                billAddress={billAddress}
                lines={lines}
                totals={{ subtotal: totals.subtotal, tax: totals.tax, total: totals.total }}
                onInvoiceDate={setInvoiceDate}
                onDueDate={setDueDate}
                onDiscount={setDiscount}
                onGstPercent={setGstPercent}
                onTerms={setTerms}
                onBillName={setBillName}
                onBillPhone={setBillPhone}
                onBillEmail={setBillEmail}
                onBillAddress={setBillAddress}
                onLineChange={(i, field, value) => updateLine(i, field, value)}
                onAddLine={addLine}
                onRemoveLine={removeLine}
              />
              <p className="mt-4 text-center text-[11px] text-[#6b7280]">
                Status: <strong className="text-[#002B36]">{invStatus}</strong>. Save updates line totals and GST.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => handleSave()}
            className="admin-btn-primary px-4 py-2 text-sm rounded-xl"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={async () => {
              await handleSave("generated");
              window.open(`/admin/orders/${orderId}/invoice-print`, "_blank", "noopener,noreferrer");
            }}
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Save &amp; open printable invoice
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              window.open(`/admin/orders/${orderId}/invoice-print`, "_blank", "noopener,noreferrer")
            }
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Printable invoice (PDF)
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => handleSave("sent")}
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Mark as sent
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => handleSave("paid")}
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Mark as paid
          </button>
          <button type="button" disabled className="opacity-50 px-4 py-2 text-sm rounded-xl border border-dashed border-gray-200">
            Send to client (soon)
          </button>
        </div>
      </div>
    </div>
  );
}
