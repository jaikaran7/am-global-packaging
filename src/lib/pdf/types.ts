/** Types for quotation PDF generation – shared with API layer */

export type QuoteCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
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
};
