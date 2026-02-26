"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import CustomerSelector from "@/components/admin/orders/CustomerSelector";
import QuotationItemRow from "./QuotationItemRow";
import QuotationStatusBadge from "./QuotationStatusBadge";
import QuotationPDFButton from "./QuotationPDFButton";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";
import { isAustralianPhone } from "@/lib/validation/phone";
import { toast } from "sonner";

type Product = { id: string; title: string; slug: string };
type QuotationItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  description?: string;
  custom_name?: string;
  custom_spec?: string;
  custom_notes?: string;
};

interface QuoteData {
  id: string;
  quote_number: string;
  version?: number;
  parent_quote_id?: string | null;
  customer_id: string | null;
  customer: { id: string; name: string; email: string | null; phone: string | null; company: string | null } | null;
  status: string;
  subtotal: number;
  gst_percent: number;
  tax: number;
  total: number;
  notes: string | null;
  terms_text: string | null;
  valid_until: string | null;
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

interface QuotationEditorFormProps {
  quoteId?: string;
}

export default function QuotationEditorForm({ quoteId }: Readonly<QuotationEditorFormProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!quoteId;

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([
    { product_id: "", variant_id: "", quantity: 1, unit_price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [termsText, setTermsText] = useState(DEFAULT_QUOTE_TERMS);
  const [validUntil, setValidUntil] = useState("");
  const [gstPercent, setGstPercent] = useState(10);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingRevision, setCreatingRevision] = useState(false);

  const { data: quote } = useQuery<QuoteData>({
    queryKey: ["admin-quote", quoteId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/quotations/${quoteId}`);
      if (!res.ok) throw new Error("Failed to fetch quotation");
      return res.json();
    },
    enabled: isEdit,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products?limit=200");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return (json.items ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
      }));
    },
  });

  useEffect(() => {
    if (!quote) return;
    setCustomerId(quote.customer_id);
    setNotes(quote.notes ?? "");
    setTermsText(quote.terms_text ?? DEFAULT_QUOTE_TERMS);
    setValidUntil(quote.valid_until ?? "");
    setGstPercent(Number(quote.gst_percent ?? 10));
    if (quote.items.length > 0) {
      setItems(
        quote.items.map((i) => ({
          product_id: i.product_id ?? "",
          variant_id: i.variant_id ?? "",
          quantity: i.quantity,
          unit_price: i.unit_price,
          custom_name: (i as { custom_name?: string }).custom_name,
          custom_spec: (i as { custom_spec?: string }).custom_spec,
          custom_notes: (i as { custom_notes?: string }).custom_notes,
        }))
      );
    }
  }, [quote]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = subtotal * (gstPercent / 100);
  const total = subtotal + tax;
  const isLocked = ["accepted", "rejected", "expired", "revised", "locked", "cancelled"].includes(
    quote?.status ?? ""
  );

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: "", variant_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    const validItems = items.filter((i) => {
      if (i.product_id === "custom") return Boolean(i.custom_name?.trim());
      return Boolean(i.product_id && i.variant_id);
    });
    if (validItems.length === 0) {
      setError("Add at least one item with a product and variant selected.");
      return;
    }
    if (!customerId && !showNewCustomer) {
      setError("Select a customer or create a new one.");
      return;
    }
    if (showNewCustomer && newCustomer.phone && !isAustralianPhone(newCustomer.phone)) {
      setError("Enter a valid Australian phone number.");
      return;
    }

    setSaving(true);
    try {
      // Normalize items for API: custom rows must send product_id/variant_id "custom" (schema expects UUID or "custom", not "")
      const normalizedItems = validItems.map((i) => {
        const isCustom = i.product_id === "custom" || Boolean(i.custom_name?.trim());
        const base = isCustom
          ? { ...i, product_id: "custom" as const, variant_id: "custom" as const }
          : i;
        // Ensure optional text fields are always strings (never null) so validation sees correct types
        return {
          ...base,
          description: base.description ?? "",
          custom_name: base.custom_name ?? "",
          custom_spec: base.custom_spec ?? "",
          custom_notes: base.custom_notes ?? "",
        };
      });

      const payload: Record<string, unknown> = {
        items: normalizedItems,
        notes,
        terms_text: termsText,
        valid_until: validUntil,
        gst_percent: gstPercent,
      };

      if (showNewCustomer && newCustomer.name) {
        payload.new_customer = newCustomer;
      } else {
        payload.customer_id = customerId && String(customerId).trim() ? customerId : null;
      }

      const url = isEdit ? `/api/admin/quotations/${quoteId}` : "/api/admin/quotations";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          typeof data?.error === "string"
            ? data.error
            : data?.error && typeof data.error === "object"
              ? "Validation failed. Check required fields."
              : "Failed to save quotation";
        throw new Error(errMsg);
      }
      if (isEdit) {
        // For updates we don't need response body; just refresh relevant queries.
        queryClient.invalidateQueries({ queryKey: ["admin-quote", quoteId] });
        queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
        queryClient.invalidateQueries({ queryKey: ["admin-quotations-stats"] });
        toast.success("Quotation updated");
      } else {
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
        queryClient.invalidateQueries({ queryKey: ["admin-quotations-stats"] });
        router.push(`/admin/quotations/${data.id}`);
        toast.success("Quotation created");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to save. Please check your input." : msg);
      toast.error(msg === "[object Object]" ? "Failed to save quotation" : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!quoteId) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotations/${quoteId}/send`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = typeof data?.error === "string" ? data.error : "Failed to send quote";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-quote", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotations-stats"] });
      toast.success("Quotation sent");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to send." : msg);
      toast.error("Failed to send quotation");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!quoteId) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotations/${quoteId}/accept`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = typeof data?.error === "string" ? data.error : "Failed to accept quote";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-quote", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
      router.push(`/admin/orders/${data.order_id}`);
      toast.success("Quotation accepted and converted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to accept." : msg);
      toast.error("Failed to accept quotation");
    } finally {
      setSending(false);
    }
  };

  const handleCreateRevision = async () => {
    if (!quoteId) return;
    setCreatingRevision(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotations/${quoteId}/revision`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = typeof data?.error === "string" ? data.error : "Failed to create revision";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotations-stats"] });
      router.push(`/admin/quotations/${data.id}`);
      toast.success("Revision created (draft). Edit and send to client.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to create revision." : msg);
      toast.error("Failed to create revision");
    } finally {
      setCreatingRevision(false);
    }
  };

  const handleReject = async () => {
    if (!quoteId) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotations/${quoteId}/reject`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = typeof data?.error === "string" ? data.error : "Failed to reject";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-quote", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotations"] });
      toast.success("Quotation rejected");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to reject." : msg);
      toast.error("Failed to reject quotation");
    } finally {
      setSending(false);
    }
  };

  let saveLabel = "Save Draft";
  if (saving) {
    saveLabel = "Saving...";
  } else if (isEdit) {
    saveLabel = "Update Quote";
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/quotations")} className="admin-btn-secondary p-2 rounded-xl">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">
              {isEdit ? `Quote ${quote?.quote_number ?? ""}` : "New Quotation"}
            </h1>
            {isEdit && quote && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <QuotationStatusBadge status={quote.status} size="md" />
                {quote.version != null && quote.version > 1 && (
                  <span className="text-xs text-[#9aa6b0]">v{quote.version}</span>
                )}
                {quote.created_at && (
                  <span className="text-xs text-[#9aa6b0]">
                    Created {new Date(quote.created_at).toLocaleDateString("en-AU")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-primary px-6 py-2.5 text-sm font-medium"
            >
              {saveLabel}
            </button>
          )}
          {isEdit && (
            <>
              <QuotationPDFButton quoteId={quoteId} />
              <button
                onClick={handleSend}
                disabled={sending || isLocked}
                className="admin-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-sm rounded-xl"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Send
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Customer */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Customer</h2>
            {showNewCustomer ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quote-customer-name" className="block text-xs font-medium text-[#9aa6b0] mb-1">Name *</label>
                    <input
                      id="quote-customer-name"
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                      disabled={isLocked}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-customer-company" className="block text-xs font-medium text-[#9aa6b0] mb-1">Company</label>
                    <input
                      id="quote-customer-company"
                      type="text"
                      value={newCustomer.company}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, company: e.target.value }))}
                      disabled={isLocked}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-customer-email" className="block text-xs font-medium text-[#9aa6b0] mb-1">Email</label>
                    <input
                      id="quote-customer-email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                      disabled={isLocked}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-customer-phone" className="block text-xs font-medium text-[#9aa6b0] mb-1">Phone</label>
                    <input
                      id="quote-customer-phone"
                      type="text"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                      disabled={isLocked}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="quote-customer-address" className="block text-xs font-medium text-[#9aa6b0] mb-1">Address</label>
                  <textarea
                    id="quote-customer-address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, address: e.target.value }))}
                    disabled={isLocked}
                    rows={2}
                    className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="text-xs text-[#ff7a2d] hover:underline"
                >
                  Select existing customer instead
                </button>
              </div>
            ) : (
              <CustomerSelector
                selectedCustomerId={customerId}
                onSelect={(c) => setCustomerId(c.id || null)}
                onCreateNew={() => setShowNewCustomer(true)}
                disabled={isLocked}
              />
            )}
          </div>

          {/* Line items */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#2b2f33]">
                Line Items ({items.length})
              </h2>
              {!isLocked && (
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#ff7a2d] hover:underline"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add Item
                </button>
              )}
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <QuotationItemRow
                  key={`${item.product_id}-${item.variant_id}-${i}`}
                  index={i}
                  item={item}
                  products={products ?? []}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                  disabled={isLocked}
                />
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Terms & Conditions</h2>
            <textarea
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              disabled={isLocked}
              rows={8}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Quote Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal</span>
                <span className="font-medium text-[#2b2f33]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-[#6b7280]">GST %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  disabled={isLocked}
                  className="admin-btn-secondary w-20 py-1 px-2 rounded-lg text-sm text-right"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">GST Amount</span>
                <span className="font-medium text-[#2b2f33]">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100/50 pt-2 flex justify-between">
                <span className="font-semibold text-[#2b2f33]">Total</span>
                <span className="font-bold text-lg text-[#ff7a2d]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Validity & Notes</h2>
            <div>
              <label htmlFor="quote-valid-until" className="block text-xs font-medium text-[#9aa6b0] mb-1">Valid Until</label>
              <input
                id="quote-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                disabled={isLocked}
                className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="quote-notes" className="block text-xs font-medium text-[#9aa6b0] mb-1">Notes</label>
              <textarea
                id="quote-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLocked}
                rows={3}
                className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm resize-none"
              />
            </div>
          </div>

          {isEdit && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#2b2f33]">Actions</h2>
              <div className="grid gap-2">
                {/* Only allow accept/convert while quote is still open (not accepted/rejected/etc.) */}
                {!isLocked && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={sending}
                      className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> Mark Accepted & Convert
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={sending}
                      className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl"
                    >
                      <XCircleIcon className="w-4 h-4 text-red-600" /> Mark Rejected
                    </button>
                  </>
                )}

                {/* Revision actions for accepted/sent/revised/locked quotes */}
                {(quote?.status === "accepted" ||
                  quote?.status === "sent" ||
                  quote?.status === "revised" ||
                  quote?.status === "locked") && (
                  <button
                    type="button"
                    onClick={handleCreateRevision}
                    disabled={creatingRevision}
                    className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl"
                  >
                    {creatingRevision ? "Creating…" : "Create Revision (v" + ((quote?.version ?? 1) + 1) + ")"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
