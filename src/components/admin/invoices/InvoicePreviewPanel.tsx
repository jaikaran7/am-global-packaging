"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  Building2,
  Gem,
  Globe,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";
import type { CompanySettingsRow } from "@/lib/company-settings-env";

/** Brand palette aligned with invoice reference + AM Global letterhead */
export const INV_TEAL = "#002B36";
export const INV_GOLD = "#C5A059";
export const INV_GRAY = "#F5F5F5";

export type InvoicePreviewLine = {
  description: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

type Props = {
  company: CompanySettingsRow | null;
  currency: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  referenceNo: string;
  discount: number;
  gstPercent: number;
  terms: string;
  billName: string;
  billPhone: string;
  billEmail: string;
  billAddress: string;
  lines: InvoicePreviewLine[];
  totals: { subtotal: number; tax: number; total: number };
  /** Editable sections — omit handlers for read-only preview */
  onInvoiceDate?: (v: string) => void;
  onDueDate?: (v: string) => void;
  onDiscount?: (v: number) => void;
  onGstPercent?: (v: number) => void;
  onTerms?: (v: string) => void;
  onBillName?: (v: string) => void;
  onBillPhone?: (v: string) => void;
  onBillEmail?: (v: string) => void;
  onBillAddress?: (v: string) => void;
  onLineChange?: (index: number, field: "description" | "unit_price" | "quantity", value: string | number) => void;
  onAddLine?: () => void;
  onRemoveLine?: (index: number) => void;
  editable?: boolean;
  /** Dates in invoice meta: builder uses short month; print view uses DD/MM/YYYY */
  dateDisplayStyle?: "short-month" | "dmy";
};

function fmtMoney(n: number, cur: string): string {
  const sym = cur === "AUD" ? "$" : cur === "USD" ? "$" : `${cur} `;
  return `${sym}${n.toFixed(2)}`;
}

function formatInvoiceDate(iso: string, style: "short-month" | "dmy"): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  if (style === "dmy") {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function displayWebsite(company: CompanySettingsRow | null): string {
  const env = process.env.NEXT_PUBLIC_COMPANY_WEBSITE?.trim();
  if (env) return env.replace(/^https?:\/\//i, "");
  return "";
}

function telHref(phone: string): string | undefined {
  const t = phone.trim();
  if (!t) return undefined;
  const n = t.replace(/[^\d+]/g, "");
  if (n.replace(/\D/g, "").length < 8) return undefined;
  return `tel:${n}`;
}

function mailtoHref(email: string): string | undefined {
  const e = email.trim();
  if (!e) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return undefined;
  return `mailto:${e}`;
}

function websiteHref(site: string): string | undefined {
  const s = site.trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

const inputCls =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13px] text-[#002B36] outline-none transition hover:border-[#002B36]/15 focus:border-[#C5A059]/80 focus:ring-1 focus:ring-[#C5A059]/30";

function metaRow(label: string, value: ReactNode, mono?: boolean) {
  return (
    <li className="flex items-start gap-2 text-[11px] text-[#002B36]">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#002B36]" aria-hidden />
      <span className="text-[#002B36]/70">{label}</span>
      <span className={`min-w-0 flex-1 text-right font-semibold ${mono ? "tabular-nums" : ""}`}>{value}</span>
    </li>
  );
}

export default function InvoicePreviewPanel({
  company,
  currency,
  invoiceNumber,
  invoiceDate,
  dueDate,
  referenceNo,
  discount,
  gstPercent,
  terms,
  billName,
  billPhone,
  billEmail,
  billAddress,
  lines,
  totals,
  onInvoiceDate,
  onDueDate,
  onDiscount,
  onGstPercent,
  onTerms,
  onBillName,
  onBillPhone,
  onBillEmail,
  onBillAddress,
  onLineChange,
  onAddLine,
  onRemoveLine,
  editable = true,
  dateDisplayStyle = "short-month",
}: Readonly<Props>) {
  const c = company;
  const name = c?.company_name ?? "—";
  const tagline = c?.tagline ?? "";
  const addr = c?.address_line ?? "";
  const phone = c?.phone ?? "";
  const email = c?.email ?? "";
  const abn = c?.abn ?? "";
  const web = displayWebsite(c);
  const bank = c?.bank_name ?? "—";
  const bsb = c?.bsb ?? "—";
  const acct = c?.account_number ?? "—";
  const acctName = c?.company_name ?? "—";

  return (
    <div className="relative mx-auto max-w-[820px] overflow-hidden rounded-xl shadow-[0_12px_40px_rgba(0,43,54,0.12)] ring-1 ring-black/5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[length:100%_auto] bg-top bg-no-repeat opacity-[0.22]"
        style={{ backgroundImage: "url('/Quotation_Template.png')" }}
      />
      <div className="relative bg-white/95 backdrop-blur-[1px]">
        {/* Header */}
        <header className="flex flex-col border-b border-[#002B36]/10 sm:flex-row">
          <div className="relative flex-1 bg-[#002B36] px-5 py-6 sm:pr-10">
            <div className="flex gap-4">
              <div
                className="relative flex h-[76px] w-[92px] shrink-0 items-center justify-center bg-[#001a21]"
                style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
              >
                <div
                  className="relative flex h-[52px] w-[52px] items-center justify-center border-2 border-[#C5A059] bg-[#002B36]"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <Image
                    src="/am-global-logo.png"
                    alt=""
                    width={36}
                    height={36}
                    className="object-contain opacity-95"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-white">{name}</h1>
                {tagline ? (
                  <p className="mt-1 text-[13px] font-medium text-[#C5A059]">{tagline}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/90">
                  {addr ? (
                    <span className="flex max-w-[220px] items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                      <span className="leading-snug">{addr}</span>
                    </span>
                  ) : null}
                  {web ? (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                      {web}
                    </span>
                  ) : null}
                  {phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                      {phone}
                    </span>
                  ) : null}
                  {abn ? (
                    <span className="flex items-center gap-1.5">
                      <IdCard className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                      ABN: {abn}
                    </span>
                  ) : null}
                  {email ? (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                      {mailtoHref(email) ? (
                        <a
                          href={mailtoHref(email)}
                          className="truncate text-white/95 underline decoration-white/30 underline-offset-2 hover:text-white"
                        >
                          {email}
                        </a>
                      ) : (
                        <span className="truncate underline decoration-white/30">{email}</span>
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col bg-white px-6 py-6 sm:w-[248px]">
            <h2 className="text-[26px] font-bold uppercase leading-none tracking-wide text-[#002B36]">
              Invoice
            </h2>
            <div className="mt-2 h-0.5 w-full bg-[#C5A059]" />
            <ul className="mt-5 space-y-2.5">
              {metaRow("Invoice No.", invoiceNumber || "—", true)}
              {metaRow(
                "Invoice Date",
                editable && onInvoiceDate ? (
                  <span className="inline-flex w-full justify-end">
                    <input
                      type="date"
                      className={`${inputCls} max-w-[9.5rem] text-right text-[11px]`}
                      value={invoiceDate}
                      onChange={(e) => onInvoiceDate(e.target.value)}
                    />
                  </span>
                ) : (
                  formatInvoiceDate(invoiceDate, dateDisplayStyle)
                ),
                true
              )}
              {metaRow(
                "Due Date",
                editable && onDueDate ? (
                  <span className="inline-flex w-full justify-end">
                    <input
                      type="date"
                      className={`${inputCls} max-w-[9.5rem] text-right text-[11px]`}
                      value={dueDate}
                      onChange={(e) => onDueDate(e.target.value)}
                    />
                  </span>
                ) : (
                  formatInvoiceDate(dueDate, dateDisplayStyle)
                ),
                true
              )}
              {metaRow("Reference", referenceNo || "—")}
              {!(editable && (onGstPercent || onDiscount)) ? (
                <>
                  {metaRow("GST %", String(gstPercent))}
                  {metaRow(`Discount (${currency})`, fmtMoney(discount, currency))}
                </>
              ) : null}
            </ul>
            {editable && (onDiscount || onGstPercent) ? (
              <div className="mt-4 space-y-2 border-t border-[#002B36]/10 pt-3 text-[10px] text-[#002B36]/70">
                {onGstPercent ? (
                  <label className="flex items-center justify-between gap-2">
                    GST %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={`${inputCls} w-16 text-right tabular-nums`}
                      value={gstPercent}
                      onChange={(e) => onGstPercent(Number(e.target.value))}
                    />
                  </label>
                ) : null}
                {onDiscount ? (
                  <label className="flex items-center justify-between gap-2">
                    Discount ({currency})
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={`${inputCls} w-24 text-right tabular-nums`}
                      value={discount}
                      onChange={(e) => onDiscount(Number(e.target.value))}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <div className="space-y-6 px-5 py-6">
          {/* Bill To */}
          <div className="relative overflow-hidden rounded-xl bg-[#F5F5F5] ring-1 ring-[#002B36]/8">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#002B36]/[0.04]"
            />
            <div className="relative flex flex-wrap items-stretch gap-0">
              <div className="flex items-center gap-2 rounded-br-xl bg-[#002B36] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
                <Gem className="h-3.5 w-3.5 text-[#C5A059]" aria-hidden />
                Bill To
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap gap-4 p-4 sm:flex-nowrap sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#002B36]/20 bg-white">
                  <UserRound className="h-8 w-8 text-[#002B36]/25" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-2 text-[13px]">
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#002B36]/55" aria-hidden />
                    {editable && onBillName ? (
                      <input
                        className={inputCls}
                        placeholder="Customer name"
                        value={billName}
                        onChange={(e) => onBillName(e.target.value)}
                      />
                    ) : (
                      <span className="font-semibold text-[#002B36]">{billName || "—"}</span>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#002B36]/55" aria-hidden />
                    {editable && onBillPhone ? (
                      <input
                        className={inputCls}
                        placeholder="Phone"
                        value={billPhone}
                        onChange={(e) => onBillPhone(e.target.value)}
                      />
                    ) : (
                      (() => {
                        const href = telHref(billPhone);
                        return href ? (
                          <a
                            href={href}
                            className="text-[#002B36]/85 underline decoration-[#002B36]/35 underline-offset-2 hover:text-[#002B36]"
                          >
                            {billPhone}
                          </a>
                        ) : (
                          <span className="text-[#002B36]/85">{billPhone || "—"}</span>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#002B36]/55" aria-hidden />
                    {editable && onBillEmail ? (
                      <input
                        className={inputCls}
                        placeholder="Email"
                        value={billEmail}
                        onChange={(e) => onBillEmail(e.target.value)}
                      />
                    ) : (
                      (() => {
                        const href = mailtoHref(billEmail);
                        return href ? (
                          <a
                            href={href}
                            className="text-[#002B36]/85 underline decoration-[#002B36]/35 underline-offset-2 hover:text-[#002B36]"
                          >
                            {billEmail}
                          </a>
                        ) : (
                          <span className="text-[#002B36]/85">{billEmail || "—"}</span>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#002B36]/55" aria-hidden />
                    {editable && onBillAddress ? (
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        placeholder="Address"
                        value={billAddress}
                        onChange={(e) => onBillAddress(e.target.value)}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap text-[#002B36]/85">{billAddress || "—"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-hidden rounded-t-xl ring-1 ring-[#002B36]/12">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#002B36] text-left text-[11px] font-bold uppercase tracking-wide text-white">
                    <th className="w-10 px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">Item Description</th>
                    <th className="w-28 px-3 py-3 text-right">Unit Price</th>
                    <th className="w-20 px-3 py-3 text-center">Qty</th>
                    <th className="w-28 px-3 py-3 text-right">Total</th>
                    {editable ? <th className="w-10 px-1 py-3" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]/80"}
                    >
                      <td className="border-t border-[#002B36]/8 px-3 py-2.5 text-center text-[#002B36]/55 tabular-nums">
                        {i + 1}
                      </td>
                      <td className="border-t border-[#002B36]/8 px-3 py-2.5">
                        {editable && onLineChange ? (
                          <input
                            className={inputCls}
                            value={line.description}
                            onChange={(e) => onLineChange(i, "description", e.target.value)}
                          />
                        ) : (
                          line.description
                        )}
                      </td>
                      <td className="border-t border-[#002B36]/8 px-3 py-2.5 text-right tabular-nums text-[#002B36]/90">
                        {editable && onLineChange ? (
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            className={`${inputCls} text-right tabular-nums`}
                            value={line.unit_price}
                            onChange={(e) => onLineChange(i, "unit_price", Number(e.target.value))}
                          />
                        ) : (
                          fmtMoney(line.unit_price, currency)
                        )}
                      </td>
                      <td className="border-t border-[#002B36]/8 px-3 py-2.5 text-center tabular-nums text-[#002B36]/90">
                        {editable && onLineChange ? (
                          <input
                            type="number"
                            min={0.0001}
                            step={0.0001}
                            className={`${inputCls} text-center tabular-nums`}
                            value={line.quantity}
                            onChange={(e) => onLineChange(i, "quantity", Number(e.target.value))}
                          />
                        ) : (
                          line.quantity
                        )}
                      </td>
                      <td className="border-t border-[#002B36]/8 px-3 py-2.5 text-right font-semibold tabular-nums text-[#002B36]">
                        {fmtMoney(line.line_total, currency)}
                      </td>
                      {editable && onRemoveLine ? (
                        <td className="border-t border-[#002B36]/8 px-1 py-2.5 text-center">
                          <button
                            type="button"
                            className="text-[#002B36]/35 hover:text-red-500"
                            onClick={() => onRemoveLine(i)}
                            aria-label={`Remove line ${i + 1}`}
                          >
                            ×
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {editable && onAddLine ? (
              <div className="border-t border-[#002B36]/10 bg-[#F5F5F5]/50 px-3 py-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#C5A059] hover:text-[#002B36]"
                  onClick={onAddLine}
                >
                  + Add line
                </button>
              </div>
            ) : null}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-[280px] space-y-0 overflow-hidden rounded-xl bg-[#F5F5F5] ring-1 ring-[#002B36]/10">
              <div className="space-y-2 px-4 py-3 text-[13px]">
                <div className="flex justify-between gap-6 text-[#002B36]/75">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#002B36]">
                    {fmtMoney(totals.subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-6 text-[#002B36]/75">
                  <span>Discount</span>
                  <span className="tabular-nums font-medium text-[#002B36]">
                    −{fmtMoney(discount, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-6 text-[#002B36]/75">
                  <span>
                    GST ({gstPercent}%)
                  </span>
                  <span className="tabular-nums font-medium text-[#002B36]">{fmtMoney(totals.tax, currency)}</span>
                </div>
              </div>
              <div className="flex justify-between gap-4 bg-[#002B36] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white">
                <span>Grand Total ({currency})</span>
                <span className="tabular-nums">{fmtMoney(totals.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment + Terms */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl bg-[#F5F5F5] pl-4 ring-1 ring-[#002B36]/10">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#002B36]" aria-hidden />
              <div className="p-4 pl-5">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#002B36]">
                  <Building2 className="h-4 w-4 text-[#C5A059]" aria-hidden />
                  Payment Information
                </div>
                <dl className="space-y-2 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#002B36]/55">Bank Name</dt>
                    <dd className="text-right font-medium text-[#002B36]">{bank}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#002B36]/55">BSB / Sort Code</dt>
                    <dd className="text-right font-medium tabular-nums text-[#002B36]">{bsb}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#002B36]/55">Account Number</dt>
                    <dd className="text-right font-medium tabular-nums text-[#002B36]">{acct}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#002B36]/55">Account Name</dt>
                    <dd className="text-right font-medium text-[#002B36]">{acctName}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-[#F5F5F5] pr-4 ring-1 ring-[#002B36]/10">
              <div className="absolute bottom-0 right-0 top-0 w-1.5 bg-[#C5A059]" aria-hidden />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 bottom-0 top-0 w-32 opacity-[0.06]"
                style={{
                  background:
                    "radial-gradient(circle at center, #002B36 0%, transparent 70%)",
                }}
              />
              <div className="p-4 pr-6">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#002B36]">
                  <Shield className="h-4 w-4 text-[#C5A059]" aria-hidden />
                  Terms &amp; Conditions
                </div>
                {editable && onTerms ? (
                  <textarea
                    className={`${inputCls} min-h-[100px] w-full resize-y bg-white/60 text-[12px] leading-relaxed`}
                    rows={5}
                    value={terms}
                    onChange={(e) => onTerms(e.target.value)}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#002B36]/80">{terms || "—"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Closing footer */}
        <footer className="relative overflow-hidden bg-[#002B36] px-5 py-8">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-0 h-6 bg-[#002B36]"
            style={{
              borderRadius: "0 0 50% 50% / 0 0 24px 24px",
              transform: "translateY(-40%)",
            }}
          />
          <div className="relative text-center">
            <p className="text-[15px] text-white">
              <span className="font-serif italic text-[#C5A059]">Thank you</span>{" "}
              <span className="font-semibold uppercase tracking-[0.2em] text-white/95">for your business</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/10 pt-5 text-[11px] text-white/85">
              {web ? (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                  {websiteHref(web) ? (
                    <a
                      href={websiteHref(web)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/85 underline decoration-white/25 underline-offset-2 hover:text-white"
                    >
                      {web}
                    </a>
                  ) : (
                    web
                  )}
                </span>
              ) : null}
              {phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                  {telHref(phone) ? (
                    <a
                      href={telHref(phone)}
                      className="text-white/85 underline decoration-white/25 underline-offset-2 hover:text-white"
                    >
                      {phone}
                    </a>
                  ) : (
                    phone
                  )}
                </span>
              ) : null}
              {email ? (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#C5A059]" aria-hidden />
                  {mailtoHref(email) ? (
                    <a
                      href={mailtoHref(email)}
                      className="text-white/85 underline decoration-white/25 underline-offset-2 hover:text-white"
                    >
                      {email}
                    </a>
                  ) : (
                    email
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
