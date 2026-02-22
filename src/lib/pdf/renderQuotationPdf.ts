import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";
import type { QuoteData, QuoteItem } from "./types";

// ============================================================================
// Layout constants (A4: 595.28 x 841.89 pt)
// ============================================================================
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 48;
const HEADER_RESERVE = 140; // Space for template header
const FOOTER_RESERVE = 120; // Space for template footer
const CONTENT_TOP = A4.height - HEADER_RESERVE;
const CONTENT_BOTTOM = FOOTER_RESERVE;

// Table column widths: # | Description | Quantity | Unit Price | Subtotal
// Total must fit content width (A4 - 2*margin = ~499pt)
const COL_NO = 24;
const COL_DESC = 225;
const COL_QTY = 70;
const COL_UNIT = 88;
const COL_SUB = 92;
const TABLE_WIDTH = COL_NO + COL_DESC + COL_QTY + COL_UNIT + COL_SUB;
const CELL_PAD = 6;
const ROW_HEIGHT_BASE = 20;
const TOTALS_RESERVE = 100;

// Colors (reference design)
const TEAL_HEADER = rgb(0.12, 0.35, 0.36); // #1f575a
const ORANGE_ACCENT = rgb(1, 0.48, 0.18);
const ORANGE_BG = rgb(1, 0.93, 0.86);
const TEXT_DARK = rgb(0.2, 0.24, 0.28);
const TEXT_MID = rgb(0.35, 0.4, 0.45);
const TEXT_LIGHT = rgb(0.45, 0.5, 0.55);
const BOX_LIGHT = rgb(0.96, 0.965, 0.97);
const ROW_ALT = rgb(0.985, 0.988, 0.99);

// ============================================================================
// Helpers
// ============================================================================

function getTemplatePath(): string {
  const lower = path.join(process.cwd(), "public", "quotation_template.png");
  const upper = path.join(process.cwd(), "public", "Quotation_Template.png");
  if (fs.existsSync(lower)) return lower;
  return upper;
}

function formatDate(val: string | Date): string {
  const d = typeof val === "string" ? new Date(val) : val;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatOrdinal(n: number): string {
  const s = String(n);
  const last = s.slice(-1);
  const last2 = s.slice(-2);
  if (last2 === "11" || last2 === "12" || last2 === "13") return `${s}th`;
  if (last === "1") return `${s}st`;
  if (last === "2") return `${s}nd`;
  if (last === "3") return `${s}rd`;
  return `${s}th`;
}

function formatDateLong(val: string | Date): string {
  const d = typeof val === "string" ? new Date(val) : val;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${formatOrdinal(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatQuantity(n: number): string {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatDimensions(d?: { length_mm?: number; width_mm?: number; height_mm?: number } | null): string | null {
  if (!d) return null;
  const l = d.length_mm ?? 0;
  const w = d.width_mm ?? 0;
  const h = d.height_mm ?? 0;
  if (!l && !w && !h) return null;
  return `${l} (L) x ${w} (W) x ${h} (H) mm`;
}

function buildDescription(item: QuoteItem): string[] {
  const parts: string[] = [item.product_title];
  if (item.variant_name) parts.push(`— ${item.variant_name}`);
  const dims = formatDimensions(item.dimensions_mm);
  if (dims) parts.push(`(${dims})`);
  if (item.description) parts.push(`— ${item.description}`);
  const full = parts.join(" ");
  return full ? [full] : ["—"];
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    const w = font.widthOfTextAtSize(next, fontSize);
    if (w > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type PdfCtx = {
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  width: number;
  height: number;
  margin: number;
  contentTop: number;
  contentBottom: number;
};

// ============================================================================
// Template (full-page background)
// ============================================================================

async function drawTemplate(page: PDFPage, pdfDoc: PDFDocument): Promise<void> {
  const imgPath = getTemplatePath();
  if (!fs.existsSync(imgPath)) return;
  const imgBytes = fs.readFileSync(imgPath);
  const png = await pdfDoc.embedPng(imgBytes);
  const { width, height } = page.getSize();
  page.drawImage(png, { x: 0, y: 0, width, height });
}

// ============================================================================
// Quotation metadata block
// ============================================================================

function drawMeta(page: PDFPage, ctx: PdfCtx, data: QuoteData): number {
  let y = ctx.contentTop;

  page.drawText("QUOTATION", {
    x: ctx.margin,
    y: y,
    size: 18,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });
  y -= 8;

  page.drawLine({
    start: { x: ctx.margin, y: y },
    end: { x: ctx.margin + 100, y },
    thickness: 2,
    color: ORANGE_ACCENT,
  });
  y -= 20;

  const metaRows: { label: string; value: string }[] = [
    { label: "Quote No", value: data.quote_number },
    { label: "Date", value: formatDateLong(data.created_at) },
  ];
  if (data.valid_until) {
    metaRows.push({ label: "Valid Until", value: formatDateLong(data.valid_until) });
  }

  const labelX = ctx.margin;
  const valueX = ctx.margin + 78;

  metaRows.forEach((row) => {
    page.drawText(`${row.label} :`, {
      x: labelX,
      y,
      size: 9,
      font: ctx.font,
      color: TEXT_LIGHT,
    });
    page.drawText(row.value, {
      x: valueX,
      y,
      size: 9,
      font: ctx.font,
      color: TEXT_MID,
    });
    y -= 16;
  });

  return y - 8;
}

// ============================================================================
// Customer details block
// ============================================================================

function drawCustomer(page: PDFPage, ctx: PdfCtx, data: QuoteData, startY: number): number {
  const boxHeight = 90;
  const boxY = startY - boxHeight;

  page.drawRectangle({
    x: ctx.margin,
    y: boxY,
    width: ctx.width - ctx.margin * 2,
    height: boxHeight,
    color: BOX_LIGHT,
  });

  page.drawText("Customer Details", {
    x: ctx.margin + 10,
    y: boxY + boxHeight - 18,
    size: 10,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });

  const leftX = ctx.margin + 10;
  const rightX = ctx.margin + 260;
  let rowY = boxY + boxHeight - 36;
  const rowGap = 14;

  const leftRows: { label: string; value: string }[] = [
    { label: "Client Name", value: data.customer.name },
  ];
  if (data.customer.company) leftRows.push({ label: "Company", value: data.customer.company });
  if (data.customer.email) leftRows.push({ label: "Email", value: data.customer.email });
  if (data.customer.phone) leftRows.push({ label: "Phone", value: data.customer.phone });

  leftRows.forEach((row) => {
    page.drawText(`${row.label} :`, {
      x: leftX,
      y: rowY,
      size: 8.5,
      font: ctx.font,
      color: TEXT_LIGHT,
    });
    const valLines = wrapText(row.value, 200, 8.5, ctx.font);
    valLines.slice(0, 2).forEach((line, i) => {
      page.drawText(line, {
        x: leftX + 72,
        y: rowY - i * 12,
        size: 8.5,
        font: ctx.font,
        color: TEXT_MID,
      });
    });
    rowY -= rowGap;
  });

  if (data.customer.address) {
    rowY = boxY + boxHeight - 36;
    page.drawText("Address :", {
      x: rightX,
      y: rowY,
      size: 8.5,
      font: ctx.font,
      color: TEXT_LIGHT,
    });
    const addrLines = wrapText(
      data.customer.address,
      ctx.width - rightX - ctx.margin - 20,
      8.5,
      ctx.font
    );
    addrLines.forEach((line, i) => {
      page.drawText(line, {
        x: rightX + 58,
        y: rowY - i * 12,
        size: 8.5,
        font: ctx.font,
        color: TEXT_MID,
      });
    });
  }

  return boxY - 16;
}

// ============================================================================
// Items table (with page breaks)
// ============================================================================

function drawTableHeader(page: PDFPage, ctx: PdfCtx, topY: number): void {
  const colX = [
    ctx.margin,
    ctx.margin + COL_NO,
    ctx.margin + COL_NO + COL_DESC,
    ctx.margin + COL_NO + COL_DESC + COL_QTY,
    ctx.margin + COL_NO + COL_DESC + COL_QTY + COL_UNIT,
  ];

  page.drawRectangle({
    x: ctx.margin,
    y: topY - 18,
    width: TABLE_WIDTH,
    height: 22,
    color: TEAL_HEADER,
  });

  const hSize = 9;
  page.drawText("#", {
    x: colX[0] + CELL_PAD,
    y: topY - 14,
    size: hSize,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Description", {
    x: colX[1] + CELL_PAD,
    y: topY - 14,
    size: hSize,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Quantity", {
    x: colX[3] - CELL_PAD - ctx.fontBold.widthOfTextAtSize("Quantity", hSize),
    y: topY - 14,
    size: hSize,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Unit Price (AUD)", {
    x: colX[4] - CELL_PAD - ctx.fontBold.widthOfTextAtSize("Unit Price (AUD)", hSize),
    y: topY - 14,
    size: hSize,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Subtotal (AUD)", {
    x: colX[4] + COL_SUB - CELL_PAD - ctx.fontBold.widthOfTextAtSize("Subtotal (AUD)", hSize),
    y: topY - 14,
    size: hSize,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
}

function drawItemsTable(
  page: PDFPage,
  ctx: PdfCtx,
  data: QuoteData,
  tableTop: number,
  drawTemplateFn: (p: PDFPage) => Promise<void>
): { lastPage: PDFPage; lastRowY: number } {
  const colX = [
    ctx.margin,
    ctx.margin + COL_NO,
    ctx.margin + COL_NO + COL_DESC,
    ctx.margin + COL_NO + COL_DESC + COL_QTY,
    ctx.margin + COL_NO + COL_DESC + COL_QTY + COL_UNIT,
  ];

  const descMaxW = COL_DESC - CELL_PAD * 2;
  let currentPage = page;
  let rowY = tableTop - 24;

  drawTableHeader(currentPage, ctx, tableTop);

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const descLines = wrapText(
      buildDescription(item).join(" "),
      descMaxW,
      9,
      ctx.font
    );
    const rowLines = Math.max(descLines.length, 1);
    const rowHeight = ROW_HEIGHT_BASE + (rowLines - 1) * 12;
    const isLast = i === data.items.length - 1;
    const minY = ctx.contentBottom + (isLast ? TOTALS_RESERVE : 24);

    if (rowY - rowHeight < minY) {
      currentPage = ctx.pdfDoc.addPage([A4.width, A4.height]);
      drawTemplateFn(currentPage);
      rowY = ctx.contentTop - 24;
      drawTableHeader(currentPage, ctx, ctx.contentTop - 6);
    }

    const rowColor = i % 2 === 0 ? rgb(1, 1, 1) : ROW_ALT;
    currentPage.drawRectangle({
      x: ctx.margin,
      y: rowY - rowHeight + 1,
      width: TABLE_WIDTH,
      height: rowHeight + 2,
      color: rowColor,
    });

    currentPage.drawText(String(i + 1), {
      x: colX[0] + CELL_PAD,
      y: rowY - 12,
      size: 9,
      font: ctx.font,
      color: TEXT_MID,
    });

    descLines.forEach((line, li) => {
      currentPage.drawText(line, {
        x: colX[1] + CELL_PAD,
        y: rowY - 4 - li * 12,
        size: 9,
        font: ctx.font,
        color: TEXT_MID,
      });
    });

    const qtyStr = formatQuantity(item.quantity);
    const unitStr = formatCurrency(item.unit_price);
    const subStr = formatCurrency(item.subtotal);
    const f9 = 9;

    currentPage.drawText(qtyStr, {
      x: colX[3] - CELL_PAD - ctx.font.widthOfTextAtSize(qtyStr, f9),
      y: rowY - 12,
      size: f9,
      font: ctx.font,
      color: TEXT_MID,
    });

    currentPage.drawText(unitStr, {
      x: colX[4] - CELL_PAD - ctx.font.widthOfTextAtSize(unitStr, f9),
      y: rowY - 12,
      size: f9,
      font: ctx.font,
      color: TEXT_MID,
    });

    currentPage.drawText(subStr, {
      x: colX[4] + COL_SUB - CELL_PAD - ctx.font.widthOfTextAtSize(subStr, f9),
      y: rowY - 12,
      size: f9,
      font: ctx.fontBold,
      color: TEXT_MID,
    });

    rowY -= rowHeight + 2;
  }

  return { lastPage: currentPage, lastRowY: rowY };
}

// ============================================================================
// Notes (left) + Totals (right)
// ============================================================================

function drawTotalsAndNotes(
  page: PDFPage,
  ctx: PdfCtx,
  data: QuoteData,
  rowY: number
): void {
  const totalsY = Math.max(rowY - 16, ctx.contentBottom + 72);
  const totalsX = ctx.margin + COL_NO + COL_DESC + COL_QTY - 8;
  const totalsW = COL_UNIT + COL_SUB + 16;

  page.drawRectangle({
    x: totalsX,
    y: totalsY - 50,
    width: totalsW,
    height: 54,
    color: BOX_LIGHT,
  });

  page.drawText("Subtotal", {
    x: totalsX + 8,
    y: totalsY,
    size: 9,
    font: ctx.font,
    color: TEXT_MID,
  });
  page.drawText(formatCurrency(data.subtotal), {
    x: totalsX + totalsW - 8 - ctx.font.widthOfTextAtSize(formatCurrency(data.subtotal), 9),
    y: totalsY,
    size: 9,
    font: ctx.fontBold,
    color: TEXT_MID,
  });

  page.drawText(`GST (${Math.round(data.gst_percent)}%)`, {
    x: totalsX + 8,
    y: totalsY - 16,
    size: 9,
    font: ctx.font,
    color: TEXT_MID,
  });
  page.drawText(formatCurrency(data.tax), {
    x: totalsX + totalsW - 8 - ctx.font.widthOfTextAtSize(formatCurrency(data.tax), 9),
    y: totalsY - 16,
    size: 9,
    font: ctx.fontBold,
    color: TEXT_MID,
  });

  page.drawRectangle({
    x: totalsX,
    y: totalsY - 42,
    width: totalsW,
    height: 22,
    color: ORANGE_BG,
  });
  page.drawText("Total (AUD)", {
    x: totalsX + 8,
    y: totalsY - 36,
    size: 10,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });
  page.drawText(formatCurrency(data.total), {
    x: totalsX + totalsW - 8 - ctx.font.widthOfTextAtSize(formatCurrency(data.total), 10),
    y: totalsY - 36,
    size: 10,
    font: ctx.fontBold,
    color: ORANGE_ACCENT,
  });

  if (data.notes?.trim()) {
    const notesLines = wrapText(
      data.notes.trim(),
      ctx.width - ctx.margin * 2 - 80,
      8.5,
      ctx.font
    );
    page.drawText("Notes:", {
      x: ctx.margin,
      y: totalsY - 76,
      size: 9,
      font: ctx.fontBold,
      color: TEXT_DARK,
    });
    notesLines.forEach((line, i) => {
      page.drawText(line, {
        x: ctx.margin,
        y: totalsY - 90 - i * 12,
        size: 8.5,
        font: ctx.font,
        color: TEXT_MID,
      });
    });
  }
}

// ============================================================================
// Terms & Conditions (always new last page)
// ============================================================================

type TermsSection = { title: string; body: string };

function parseTerms(terms: string): TermsSection[] {
  const blocks = terms.split(/\n\s*\n/);
  const sections: TermsSection[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const title = lines[0].endsWith(":") ? lines[0].slice(0, -1) : lines[0];
    const body = lines.slice(1).join(" ");
    sections.push({ title, body });
  }
  return sections;
}

function drawTermsPage(page: PDFPage, ctx: PdfCtx, termsText?: string | null): void {
  const terms = (termsText?.trim() || DEFAULT_QUOTE_TERMS).trim();
  const sections = parseTerms(terms);

  page.drawText("AM Global Packaging Solutions – Terms & Conditions", {
    x: ctx.margin,
    y: ctx.contentTop,
    size: 14,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });

  let y = ctx.contentTop - 28;
  const bodyWidth = ctx.width - ctx.margin * 2;
  const lineHeight = 12;

  for (const section of sections) {
    if (y < ctx.contentBottom + 30) continue;

    page.drawText(section.title, {
      x: ctx.margin,
      y,
      size: 10,
      font: ctx.fontBold,
      color: TEXT_DARK,
    });
    y -= 14;

    const bodyLines = wrapText(section.body, bodyWidth, 9, ctx.font);
    for (const line of bodyLines) {
      if (y < ctx.contentBottom + 20) break;
      page.drawText(line, {
        x: ctx.margin,
        y,
        size: 9,
        font: ctx.font,
        color: TEXT_MID,
      });
      y -= lineHeight;
    }
    y -= 10;
  }
}

// ============================================================================
// Main entry
// ============================================================================

export async function renderQuotationPdf(data: QuoteData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4.width, A4.height]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ctx: PdfCtx = {
    pdfDoc,
    font,
    fontBold,
    width: A4.width,
    height: A4.height,
    margin: MARGIN,
    contentTop: CONTENT_TOP,
    contentBottom: CONTENT_BOTTOM,
  };

  const drawTmpl = (p: PDFPage) => drawTemplate(p, pdfDoc);

  await drawTmpl(page);

  const metaBottom = drawMeta(page, ctx, data);
  const tableTop = drawCustomer(page, ctx, data, metaBottom);
  const { lastPage, lastRowY } = drawItemsTable(page, ctx, data, tableTop, drawTmpl);
  drawTotalsAndNotes(lastPage, ctx, data, lastRowY);

  // Terms & Conditions – always on a new last page
  const termsPage = pdfDoc.addPage([A4.width, A4.height]);
  await drawTmpl(termsPage);
  drawTermsPage(termsPage, ctx, data.terms_text);

  return await pdfDoc.save();
}
