"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { computeInvoiceTotals } from "@/lib/invoice-math";
import { toast } from "sonner";

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
  const [currency, setCurrency] = useState("USD");

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
        const cur = data.company?.currency_default ?? "USD";
        setCurrency(cur);
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
              product_id: l.product_id as string | null,
              variant_id: l.variant_id as string | null,
            }))
          );
          setInvoiceNumber("(will assign on create)");
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
    setLines((p) => p.filter((_, idx) => idx !== i));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-[#2b2f33]">Invoice</h2>
            <p className="text-xs text-[#9aa6b0]">
              {invoiceNumber} · {currency} · GST {gstPercent}% on (subtotal − discount)
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[#9aa6b0] hover:text-[#2b2f33]">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <p className="text-sm text-[#9aa6b0] text-center py-12">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="text-xs font-medium text-[#6b7280]">
                  Invoice date
                  <input
                    type="date"
                    className="mt-1 w-full admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </label>
                <label className="text-xs font-medium text-[#6b7280]">
                  Due date
                  <input
                    type="date"
                    className="mt-1 w-full admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </label>
                <label className="text-xs font-medium text-[#6b7280]">
                  Discount ({currency})
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1 w-full admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </label>
                <label className="text-xs font-medium text-[#6b7280]">
                  GST %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="Bill to — Name"
                  className="admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                />
                <input
                  placeholder="Phone"
                  className="admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                  value={billPhone}
                  onChange={(e) => setBillPhone(e.target.value)}
                />
                <input
                  placeholder="Email"
                  className="admin-btn-secondary py-2 px-3 rounded-xl text-sm"
                  value={billEmail}
                  onChange={(e) => setBillEmail(e.target.value)}
                />
                <textarea
                  placeholder="Address"
                  rows={2}
                  className="admin-btn-secondary py-2 px-3 rounded-xl text-sm resize-none md:col-span-2"
                  value={billAddress}
                  onChange={(e) => setBillAddress(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#2b2f33]">Line items</span>
                  <button type="button" onClick={addLine} className="text-xs font-medium text-[#ff7a2d]">
                    + Add line
                  </button>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs text-[#6b7280]">
                      <tr>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 w-24">Unit</th>
                        <th className="px-3 py-2 w-20">Qty</th>
                        <th className="px-3 py-2 w-24">Total</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-3 py-2">
                            <input
                              className="w-full admin-btn-secondary py-1.5 px-2 rounded-lg text-xs"
                              value={line.description}
                              onChange={(e) => updateLine(i, "description", e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step={0.01}
                              min={0}
                              className="w-full admin-btn-secondary py-1.5 px-2 rounded-lg text-xs"
                              value={line.unit_price}
                              onChange={(e) => updateLine(i, "unit_price", Number(e.target.value))}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0.0001}
                              step={0.0001}
                              className="w-full admin-btn-secondary py-1.5 px-2 rounded-lg text-xs"
                              value={line.quantity}
                              onChange={(e) => updateLine(i, "quantity", Number(e.target.value))}
                            />
                          </td>
                          <td className="px-3 py-2 text-xs font-medium">{line.line_total.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="text-red-400 text-xs"
                              onClick={() => removeLine(i)}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-6 text-sm">
                <div className="text-right space-y-1">
                  <div className="flex justify-between gap-12">
                    <span className="text-[#6b7280]">Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-12">
                    <span className="text-[#6b7280]">Discount</span>
                    <span>− ${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-12">
                    <span className="text-[#6b7280]">GST ({gstPercent}%)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-12 font-bold text-[#ff7a2d] pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <label className="block text-xs font-medium text-[#6b7280]">
                Terms &amp; conditions
                <textarea
                  rows={4}
                  className="mt-1 w-full admin-btn-secondary py-2 px-3 rounded-xl text-sm resize-none"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </label>

              <p className="text-[11px] text-[#9aa6b0]">
                Invoice status: <strong>{invStatus}</strong>. Saving updates totals (subtotal → discount → GST →
                total).
              </p>
            </>
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
              window.open(`/api/admin/orders/${orderId}/invoice/pdf`, "_blank");
            }}
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Save &amp; download PDF
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => window.open(`/api/admin/orders/${orderId}/invoice/pdf`, "_blank")}
            className="admin-btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Download PDF
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
