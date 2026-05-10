/** Types for quotation PDF generation – shared with API layer */

export type QuoteCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  /** Contact person (e.g. "Mr. John Matthews") */
  contact_person?: string | null;
  /** Account number or short identifier */
  account_number?: string | null;
};

export type QuoteItem = {
  product_title: string;
  variant_name: string;
  description?: string | null;
  dimensions_mm?: { length_mm?: number; width_mm?: number; height_mm?: number } | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type QuoteData = {
  quote_number: string;
  status: string;
  valid_until?: string | null;
  created_at: string;
  notes?: string | null;
  terms_text?: string | null;
  gst_percent: number;
  subtotal: number;
  tax: number;
  total: number;
  customer: QuoteCustomer;
  items: QuoteItem[];
  /** Table/PDF column label (catalogue PDFs use AUD for all product lines). */
  currency_label?: string;
};

export type InvoiceLinePdf = {
  description: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type InvoicePdfData = {
  invoice_number: string;
  /** Order / PO reference shown on PDF */
  reference_no?: string | null;
  invoice_date: string;
  due_date: string;
  gst_percent: number;
  subtotal: number;
  discount_amount: number;
  taxable_base: number;
  tax: number;
  total: number;
  terms_text: string | null;
  company: {
    name: string;
    tagline: string | null;
    abn: string | null;
    bank_name: string | null;
    bsb: string | null;
    account_number: string | null;
    address_line: string | null;
    phone: string | null;
    email: string | null;
    gst_note: string | null;
    /** Public site hostname or URL (e.g. from NEXT_PUBLIC_COMPANY_WEBSITE) */
    website_url?: string | null;
  };
  bill_to: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  lines: InvoiceLinePdf[];
  currency_label: string;
};
