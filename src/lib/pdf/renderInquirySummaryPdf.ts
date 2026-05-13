import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type InquirySummaryPdfData = {
  reference: string;
  createdAtIso: string;
  customer_name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string;
  delivery_summary: string;
  product_title: string;
  variant_summary: string;
  quantity: number;
  unit_price_aud: number;
  subtotal_ex_gst_aud: number;
  gst_percent: number;
  gst_aud: number;
  total_inc_gst_aud: number;
};

const TEXT_DARK = rgb(26 / 255, 26 / 255, 26 / 255);
const TEXT_MUTED = rgb(107 / 255, 101 / 255, 96 / 255);
const ACCENT = rgb(27 / 255, 58 / 255, 45 / 255);

export async function renderInquirySummaryPdf(data: InquirySummaryPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const line = 14;

  const draw = (text: string, bold = false, size = 11, color = TEXT_DARK) => {
    page.drawText(text, { x: left, y, size, font: bold ? fontBold : font, color });
    y -= line;
  };

  draw("AM Global Packaging Solutions", true, 16, ACCENT);
  y -= 4;
  draw("Purchase inquiry summary", false, 10, TEXT_MUTED);
  y -= 16;

  draw(`Reference: ${data.reference}`, true, 12);
  draw(`Date: ${new Date(data.createdAtIso).toLocaleString("en-AU")}`, false, 10, TEXT_MUTED);
  y -= 10;

  draw("Bill / ship to", true, 11, ACCENT);
  draw(`${data.customer_name} · ${data.company_name}`);
  draw(data.email);
  draw(data.phone);
  draw(`${data.country} — ${data.delivery_summary}`, false, 10);
  y -= 14;

  draw("Product", true, 11, ACCENT);
  draw(data.product_title);
  draw(data.variant_summary, false, 10);
  y -= 14;

  draw("Estimate (indicative, ex-GST unit shown)", true, 11, ACCENT);
  draw(`Qty: ${data.quantity}  ×  AUD ${data.unit_price_aud.toFixed(2)}`);
  draw(`Subtotal (ex GST): AUD ${data.subtotal_ex_gst_aud.toFixed(2)}`);
  draw(`GST (${data.gst_percent}%): AUD ${data.gst_aud.toFixed(2)}`);
  draw(`Total (inc GST): AUD ${data.total_inc_gst_aud.toFixed(2)}`, true, 12, ACCENT);
  y -= 20;

  draw(
    "This document is not a tax invoice. Our team will confirm pricing, tooling, freight,",
    false,
    9,
    TEXT_MUTED,
  );
  draw("lead times and any minimums before invoicing.", false, 9, TEXT_MUTED);

  return doc.save();
}
