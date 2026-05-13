/**
 * @deprecated Use renderQuotationPdf from @/lib/pdf instead.
 * This file re-exports for backwards compatibility.
 */
import { renderQuotationPdf } from "@/lib/pdf";
import type { QuoteData } from "@/lib/pdf";

export async function generateQuotationPdf(data: QuoteData) {
  return renderQuotationPdf(data);
}
