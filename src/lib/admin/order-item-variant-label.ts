/**
 * Short label for order/quotation line-item variant dropdowns.
 * Prefers physical size (DB `size_label` or parsed dimensions) over repeating the full product-style `name`.
 */
export type VariantForSelectLabel = {
  name: string;
  sku: string | null;
  size_label?: string | null;
  gsm?: number | null;
  ply?: number | null;
  dimensions?: unknown;
};

function dimensionsMmLabel(dim: unknown): string | null {
  if (dim == null) return null;
  let parsed: unknown = dim;
  if (typeof dim === "string" && dim.trim()) {
    try {
      parsed = JSON.parse(dim) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as { length_mm?: number; width_mm?: number; height_mm?: number };
  const { length_mm: L, width_mm: W, height_mm: H } = o;
  if (L != null && W != null && H != null) return `${L} × ${W} × ${H} mm`;
  if (L != null && W != null) return `${L} × ${W} mm`;
  return null;
}

export function formatVariantSelectLabel(v: VariantForSelectLabel): string {
  const bits: string[] = [];
  const size = v.size_label?.trim() || dimensionsMmLabel(v.dimensions);
  if (size) bits.push(size);
  if (v.gsm != null && Number.isFinite(v.gsm)) bits.push(`${v.gsm} GSM`);
  if (v.ply != null && Number.isFinite(v.ply)) bits.push(`${v.ply}-Ply`);
  const core = bits.join(" · ");
  if (core) {
    return v.sku?.trim() ? `${core} · ${v.sku.trim()}` : core;
  }
  return v.sku?.trim() ? `${v.name} (${v.sku.trim()})` : v.name;
}
