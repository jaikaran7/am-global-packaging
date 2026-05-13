/**
 * Public catalogue prices for papers are stored in USD. Customer-facing surfaces
 * convert to AUD using USD_TO_AUD_RATE (server env). Defaults to ~market rate if unset.
 */

const DEFAULT_USD_TO_AUD = 1.55;

export function getUsdToAudRate(): number {
  const raw =
    process.env.USD_TO_AUD_RATE ?? process.env.NEXT_PUBLIC_USD_TO_AUD_RATE;
  const n = raw != null && raw !== "" ? Number.parseFloat(String(raw)) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_USD_TO_AUD;
}

/** Round to 2 decimal places for currency display. */
export function usdToAud(usd: number, rate = getUsdToAudRate()): number {
  return Math.round(usd * rate * 100) / 100;
}

/** Convert catalogue variant/listing prices when stored as USD (papers line). */
export function audFromStoredVariant(price: number, currency: string | null | undefined): number {
  const c = (currency ?? "USD").toUpperCase();
  if (c === "USD") return usdToAud(price);
  return price;
}

export function displayCurrencyForStored(currency: string | null | undefined): string {
  const c = (currency ?? "USD").toUpperCase();
  return c === "USD" ? "AUD" : c;
}
