/** GST on line subtotals; total = subtotal + tax (quotations have no discount). */
export function computeQuotationTotals(
  lineSubtotals: number[],
  gstPercent: number
): { subtotal: number; tax: number; total: number } {
  const subtotal = Math.round(lineSubtotals.reduce((a, b) => a + b, 0) * 100) / 100;
  const tax = Math.round(subtotal * (gstPercent / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

/** GST on (subtotal − discount); total = subtotal − discount + tax */

export function computeInvoiceTotals(
  lineTotals: number[],
  discount: number,
  gstPercent: number
): { subtotal: number; taxableBase: number; tax: number; total: number } {
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const d = Math.max(0, discount);
  const taxableBase = Math.max(0, subtotal - d);
  const tax = Math.round(taxableBase * (gstPercent / 100) * 100) / 100;
  const total = Math.round((taxableBase + tax) * 100) / 100;
  return { subtotal, taxableBase, tax, total };
}
