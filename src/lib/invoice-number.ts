import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Next sequential invoice number for the current calendar year.
 * Format: INV-{YYYY}-{NNNN} (e.g. INV-2026-0001). Must match POST create in invoice route.
 */
export async function nextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
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
