/**
 * Default invoice terms use "within 30 days of invoice date". When an invoice has a
 * concrete due date, swap that phrase for an explicit calendar date in UI/PDF.
 */

const DUE_WITHIN_30_RE = /Payment is due within 30 days of invoice date\.?/gi;

export function formatDateForInvoiceTerms(iso: string, style: "short-month" | "dmy"): string {
  const raw = iso?.trim().slice(0, 10);
  if (!raw) return "";
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  if (style === "dmy") {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

/** If `dueDateIso` is set, replace the standard 30-day clause with "on or before &lt;date&gt;". */
export function resolveInvoiceTermsWithDueDate(
  terms: string | null | undefined,
  dueDateIso: string | null | undefined,
  dateStyle: "short-month" | "dmy" = "dmy"
): string {
  const t = (terms ?? "").trim();
  if (!t) return "";
  const due = dueDateIso?.trim();
  if (!due) return t;
  const formatted = formatDateForInvoiceTerms(due, dateStyle);
  return t.replace(DUE_WITHIN_30_RE, `Payment is due on or before ${formatted}`);
}
