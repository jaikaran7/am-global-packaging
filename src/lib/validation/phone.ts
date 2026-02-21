export function normalizePhone(raw: string) {
  return raw.replaceAll(/[^\d+]/g, "");
}

export function isAustralianPhone(raw: string) {
  const value = normalizePhone(raw);
  if (!value) return true;
  let normalized = value;
  if (normalized.startsWith("+61")) {
    normalized = "0" + normalized.slice(3);
  }
  return /^0[23478]\d{8}$/.test(normalized) || /^04\d{8}$/.test(normalized);
}
