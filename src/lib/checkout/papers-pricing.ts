/** Line totals for catalogue unit price ex-GST (AUD) and Australian-style GST on the subtotal. */
export function estimatePapersTotals(unitPriceExGstAud: number, quantity: number, gstPercent = 10) {
  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const pct = Number.isFinite(gstPercent) && gstPercent >= 0 ? gstPercent : 10;
  const rate = pct / 100;
  const unit = Math.round(unitPriceExGstAud * 100) / 100;
  const subtotalExGst = Math.round(unit * qty * 100) / 100;
  const gstAmount = Math.round(subtotalExGst * rate * 100) / 100;
  const totalIncGst = Math.round((subtotalExGst + gstAmount) * 100) / 100;
  return {
    quantity: qty,
    unitPriceAud: unit,
    subtotalExGst,
    gstRate: rate,
    gstPercent: pct,
    gstAmount,
    totalIncGst,
  };
}
