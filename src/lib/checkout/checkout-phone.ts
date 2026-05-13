import { isAustralianPhone, normalizePhone } from "@/lib/validation/phone";

export function isValidCheckoutPhone(phone: string, country: string): boolean {
  const t = phone.trim();
  if (!t) return false;
  const c = country.trim().toLowerCase();
  if (c === "australia" || c === "au") {
    return normalizePhone(t).length >= 8 && isAustralianPhone(t);
  }
  return /^[\d+\s().-]{8,32}$/.test(t);
}
