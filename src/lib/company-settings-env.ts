/** Fallback when DB row is unavailable (boot / migrations). */

export const COMPANY_ENV_DEFAULTS = {
  company_name: process.env.COMPANY_LEGAL_NAME ?? "AM Global Parcel Packaging Solutions",
  legal_name: process.env.COMPANY_LEGAL_NAME ?? "AM Global Parcel Packaging Solutions",
  abn: process.env.COMPANY_ABN ?? "70 503 268 103",
  bank_name: process.env.COMPANY_BANK_NAME ?? "B&B Bank",
  bsb: process.env.COMPANY_BSB ?? "062-268",
  account_number: process.env.COMPANY_ACCOUNT_NUMBER ?? "10631463",
  tagline: process.env.COMPANY_TAGLINE ?? "Premium handmade papers & packaging — globally shipped",
  address_line: process.env.COMPANY_ADDRESS ?? "",
  phone: process.env.COMPANY_PHONE ?? "",
  email: process.env.COMPANY_EMAIL ?? "",
  gst_note: "GST Registered — 10% GST applied",
  currency_default: "USD",
  gst_percent_default: 10,
  invoice_terms_default:
    "Payment is due within 30 days of invoice date. Please include the invoice number in your payment reference. Goods remain the property of AM Global Parcel Packaging Solutions until payment is received in full.",
} as const;

export type CompanySettingsRow = {
  id: string;
  company_name: string;
  legal_name: string | null;
  abn: string | null;
  bank_name: string | null;
  bsb: string | null;
  account_number: string | null;
  tagline: string | null;
  address_line: string | null;
  phone: string | null;
  email: string | null;
  gst_note: string | null;
  currency_default: string;
  gst_percent_default: number;
  invoice_terms_default: string | null;
};

export function mergeCompanySettings(row: Partial<CompanySettingsRow> | null): CompanySettingsRow {
  const e = COMPANY_ENV_DEFAULTS;
  return {
    id: row?.id ?? "00000000-0000-4000-8000-000000000001",
    company_name: row?.company_name ?? e.company_name,
    legal_name: row?.legal_name ?? e.legal_name,
    abn: row?.abn ?? e.abn,
    bank_name: row?.bank_name ?? e.bank_name,
    bsb: row?.bsb ?? e.bsb,
    account_number: row?.account_number ?? e.account_number,
    tagline: row?.tagline ?? e.tagline,
    address_line: row?.address_line ?? e.address_line,
    phone: row?.phone ?? e.phone,
    email: row?.email ?? e.email,
    gst_note: row?.gst_note ?? e.gst_note,
    currency_default: row?.currency_default ?? e.currency_default,
    gst_percent_default: row?.gst_percent_default ?? e.gst_percent_default,
    invoice_terms_default: row?.invoice_terms_default ?? e.invoice_terms_default,
  };
}
