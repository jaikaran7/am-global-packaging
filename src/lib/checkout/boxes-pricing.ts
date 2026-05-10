import type { Product } from "@/data/products";

/** Parse lowest quantity threshold from tier labels like "500 units", "1,500+ units". */
function tierMinQty(label: string): number {
  const normalized = label.replace(/,/g, "");
  const plus = normalized.match(/(\d+)\s*\+/i);
  if (plus) return Number(plus[1]);
  const m = normalized.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Pick applicable unit price AUD from catalogue tiers or flat priceAud. */
export function estimateBoxesUnitPriceAud(product: Product, quantity: number): number {
  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  if (product.pricingTiers?.length) {
    const sorted = [...product.pricingTiers]
      .map((t) => ({ ...t, min: tierMinQty(t.label) }))
      .sort((a, b) => a.min - b.min);
    let unit = sorted[0]?.priceAud ?? 0;
    for (const t of sorted) {
      if (qty >= t.min) unit = t.priceAud;
    }
    return Math.round(unit * 100) / 100;
  }
  if (product.priceAud != null) return Math.round(product.priceAud * 100) / 100;
  return 0;
}

const GST_RATE = 0.1;

export function estimateBoxesTotals(unitPriceAud: number, quantity: number) {
  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const subtotalExGst = Math.round(unitPriceAud * qty * 100) / 100;
  const gstAmount = Math.round(subtotalExGst * GST_RATE * 100) / 100;
  const totalIncGst = Math.round((subtotalExGst + gstAmount) * 100) / 100;
  return {
    quantity: qty,
    unitPriceAud,
    subtotalExGst,
    gstRate: GST_RATE,
    gstPercent: 10,
    gstAmount,
    totalIncGst,
  };
}
