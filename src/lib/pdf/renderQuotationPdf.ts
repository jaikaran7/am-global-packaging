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
const CELL_BORDER = rgb(0.87, 0.87, 0.87); // #ddd - thin borders
const BORDER_THICKNESS = 0.75; // ~1px
const CARD_RADIUS = 3;
const TABLE_RADIUS = 5;
const CUSTOMER_HEADING_BG = rgb(0.14, 0.4, 0.45); // teal

// ============================================================================
// Helpers
// ============================================================================

/** SVG path for rounded rect – for drawSvgPath (y is flipped) */
function roundedRectPath(w: number, h: number, r: number): string {
  const s = Math.min(r, w / 2, h / 2);
  return `M ${s},0 L ${w - s},0 Q ${w},0 ${w},${s} L ${w},${h - s} Q ${w},${h} ${w - s},${h} L ${s},${h} Q 0,${h} 0,${h - s} L 0,${s} Q 0,0 ${s},0 Z`;
}

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
  // Line 1: Product name - Variant name (e.g. "A4 Carton - Small")
  const line1Parts: string[] = [item.product_title];
  if (item.variant_name && item.variant_name !== "Custom Spec") {
    line1Parts.push(`- ${item.variant_name}`);
  }
  const line1 = line1Parts.join(" ").trim() || "—";
  // Line 2: Dimensions only (e.g. "319 (L) x 224 (W) x 241 (H) mm")
  const dims = formatDimensions(item.dimensions_mm);
  if (dims) {
    return [line1, dims];
  }
  if (item.description) {
    return [line1, item.description];
  }
  return [line1];
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
// Customer details block (compact, professional)
// ============================================================================

function drawCustomer(page: PDFPage, ctx: PdfCtx, data: QuoteData, startY: number): number {
  const boxHeight = 62;
  const headingH = 20;
  const cardW = ctx.width - ctx.margin * 2;
  const blockTopY = startY - 4;
  const cardTopY = blockTopY - headingH;
  const cardBottomY = cardTopY - boxHeight;

  // Short accent bar (20% width) - not full-width
  const accentW = cardW * 0.2;
  page.drawRectangle({
    x: ctx.margin,
    y: cardTopY,
    width: accentW,
    height: headingH,
    color: CUSTOMER_HEADING_BG,
  });
  page.drawText("Customer Details", {
    x: ctx.margin + 10,
    y: cardTopY + 6,
    size: 9.5,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });

  // Card body (white, flush with heading, light border)
  page.drawRectangle({
    x: ctx.margin,
    y: cardBottomY,
    width: cardW,
    height: boxHeight,
    color: rgb(1, 1, 1),
    borderColor: CELL_BORDER,
    borderWidth: BORDER_THICKNESS,
  });

  const leftX = ctx.margin + 10;
  const rightX = ctx.margin + 240;
  const labelW = 88;
  const leftValX = leftX + labelW;
  let leftRowY = cardTopY - 16;
  const rowGap = 10;

  // Left: Client Name, Contact Person, Email, Phone
  page.drawText("Client Name :", {
    x: leftX,
    y: leftRowY,
    size: 8.5,
    font: ctx.font,
    color: TEXT_LIGHT,
  });
  page.drawText(data.customer.name, {
    x: leftValX,
    y: leftRowY,
    size: 8.5,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });
  leftRowY -= rowGap;

  if (data.customer.contact_person) {
    page.drawText("Contact Person :", { x: leftX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_LIGHT });
    page.drawText(data.customer.contact_person, { x: leftValX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_MID });
    leftRowY -= rowGap;
  }
  if (data.customer.email) {
    page.drawText("Email :", { x: leftX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_LIGHT });
    page.drawText(data.customer.email, { x: leftValX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_MID });
    leftRowY -= rowGap;
  }
  if (data.customer.phone) {
    page.drawText("Phone :", { x: leftX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_LIGHT });
    page.drawText(data.customer.phone, { x: leftValX, y: leftRowY, size: 8.5, font: ctx.font, color: TEXT_MID });
  }

  // Right: Company, Address
  let rightRowY = cardTopY - 16;
  const rightLabelW = 52;
  const rightValX = rightX + rightLabelW;
  if (data.customer.company) {
    page.drawText("Company :", {
      x: rightX,
      y: rightRowY,
      size: 8.5,
      font: ctx.font,
      color: TEXT_LIGHT,
    });
    page.drawText(data.customer.company, {
      x: rightValX,
      y: rightRowY,
      size: 8.5,
      font: ctx.fontBold,
      color: TEXT_DARK,
    });
    rightRowY -= rowGap;
  }
  if (data.customer.address) {
    page.drawText("Address :", {
      x: rightX,
      y: rightRowY,
      size: 8.5,
      font: ctx.font,
      color: TEXT_LIGHT,
    });
    const addrLines = wrapText(
      data.customer.address,
      ctx.width - rightValX - ctx.margin - 16,
      8.5,
      ctx.font
    );
    addrLines.forEach((line, i) => {
      page.drawText(line, {
        x: rightValX,
        y: rightRowY - i * 10,
        size: 8,
        font: ctx.font,
        color: TEXT_MID,
      });
    });
  }

  return cardBottomY - 20;
}

// ============================================================================
// Items table (with page breaks)
// ============================================================================

function drawCellBorders(
  page: PDFPage,
  leftX: number,
  topY: number,
  colWidths: number[],
  rowHeight: number
): void {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const rightX = leftX + totalW;
  const bottomY = topY - rowHeight;

  // Vertical lines (including left and right edges)
  let x = leftX;
  page.drawLine({
    start: { x, y: topY },
    end: { x, y: bottomY },
    thickness: BORDER_THICKNESS,
    color: CELL_BORDER,
  });
  for (let i = 0; i < colWidths.length - 1; i++) {
    x += colWidths[i];
    page.drawLine({
      start: { x, y: topY },
      end: { x, y: bottomY },
      thickness: BORDER_THICKNESS,
      color: CELL_BORDER,
    });
  }
  page.drawLine({
    start: { x: rightX, y: topY },
    end: { x: rightX, y: bottomY },
    thickness: BORDER_THICKNESS,
    color: CELL_BORDER,
  });

  // Top and bottom horizontal lines
  page.drawLine({
    start: { x: leftX, y: topY },
    end: { x: rightX, y: topY },
    thickness: BORDER_THICKNESS,
    color: CELL_BORDER,
  });
  page.drawLine({
    start: { x: leftX, y: bottomY },
    end: { x: rightX, y: bottomY },
    thickness: BORDER_THICKNESS,
    color: CELL_BORDER,
  });
}

/** Rounded top corners for table header */
function roundedTopRectPath(w: number, h: number, r: number): string {
  const s = Math.min(r, w / 2, h);
  return `M ${s},0 Q 0,0 0,${s} L 0,${h} L ${w},${h} L ${w},${s} Q ${w},0 ${w - s},0 L ${s},0 Z`;
}

function drawTableHeader(page: PDFPage, ctx: PdfCtx, topY: number): void {
  const colX = [
    ctx.margin,
    ctx.margin + COL_NO,
    ctx.margin + COL_NO + COL_DESC,
    ctx.margin + COL_NO + COL_DESC + COL_QTY,
    ctx.margin + COL_NO + COL_DESC + COL_QTY + COL_UNIT,
  ];

  const headerH = 22;
  page.drawSvgPath(roundedTopRectPath(TABLE_WIDTH, headerH, TABLE_RADIUS), {
    x: ctx.margin,
    y: topY - 18 + headerH,
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

  const colWidths = [COL_NO, COL_DESC, COL_QTY, COL_UNIT, COL_SUB];
  const headerTop = topY - 18 + 22;
  drawCellBorders(page, ctx.margin, headerTop, colWidths, 22);
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
  let rowY = tableTop - 21;

  drawTableHeader(currentPage, ctx, tableTop);

  const NO_COL_BG = rgb(0.96, 0.965, 0.97); // Light grey for # column
  const ROW_BG = rgb(1, 1, 1); // White for data columns

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const rawDescLines = buildDescription(item);
    const descLines: string[] = [];
    for (const raw of rawDescLines) {
      descLines.push(...wrapText(raw, descMaxW, 9, ctx.font));
    }
    if (descLines.length === 0) descLines.push("—");
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

    // # column: light grey background
    currentPage.drawRectangle({
      x: ctx.margin,
      y: rowY - rowHeight + 1,
      width: COL_NO,
      height: rowHeight + 2,
      color: NO_COL_BG,
    });
    // Description, Qty, Unit, Subtotal: white background
    currentPage.drawRectangle({
      x: ctx.margin + COL_NO,
      y: rowY - rowHeight + 1,
      width: TABLE_WIDTH - COL_NO,
      height: rowHeight + 2,
      color: ROW_BG,
    });

    // Center # vertically in variable-height rows
    const rowHeightTotal = rowHeight + 2;
    const numY = rowY - rowHeightTotal / 2 - 3;
    currentPage.drawText(String(i + 1), {
      x: colX[0] + CELL_PAD,
      y: numY,
      size: 9,
      font: ctx.font,
      color: TEXT_MID,
    });

    // Vertically center description (no icons)
    const cellTop = rowY - rowHeight + 1 + rowHeightTotal;
    const descBlockHeight = descLines.length * 12;
    const descTopPadding = (rowHeightTotal - descBlockHeight) / 2;
    const firstDescY = cellTop - descTopPadding - 9;
    descLines.forEach((line, li) => {
      currentPage.drawText(line, {
        x: colX[1] + CELL_PAD,
        y: firstDescY - li * 12,
        size: 9,
        font: li === 0 ? ctx.fontBold : ctx.font,
        color: li === 0 ? TEXT_DARK : TEXT_MID,
      });
    });

    const qtyStr = formatQuantity(item.quantity);
    const unitStr = formatCurrency(item.unit_price);
    const subStr = formatCurrency(item.subtotal);
    const f9 = 9;

    currentPage.drawText(qtyStr, {
      x: colX[3] - CELL_PAD - ctx.font.widthOfTextAtSize(qtyStr, f9),
      y: numY,
      size: f9,
      font: ctx.font,
      color: TEXT_MID,
    });

    currentPage.drawText(unitStr, {
      x: colX[4] - CELL_PAD - ctx.font.widthOfTextAtSize(unitStr, f9),
      y: numY,
      size: f9,
      font: ctx.font,
      color: TEXT_MID,
    });

    currentPage.drawText(subStr, {
      x: colX[4] + COL_SUB - CELL_PAD - ctx.font.widthOfTextAtSize(subStr, f9),
      y: numY,
      size: f9,
      font: ctx.fontBold,
      color: TEXT_MID,
    });

    const colWidths = [COL_NO, COL_DESC, COL_QTY, COL_UNIT, COL_SUB];
    const rowTop = rowY - rowHeight + 1 + rowHeight + 2;
    drawCellBorders(currentPage, ctx.margin, rowTop, colWidths, rowHeight + 2);

    rowY -= rowHeight + 2;
  }

  return { lastPage: currentPage, lastRowY: rowY };
}

// ============================================================================
// Notes (left) + Totals (merged with items table)
// ============================================================================

const TOTALS_ROW_H = 14;
const TOTAL_ROW_HIGHLIGHT = rgb(0.98, 0.95, 0.88);

function drawTotalsAndNotes(
  page: PDFPage,
  ctx: PdfCtx,
  data: QuoteData,
  rowY: number
): void {
  const totalsTop = rowY + 3;
  const totalsLeft = ctx.margin + COL_NO + COL_DESC + COL_QTY;
  const colWidths = [COL_UNIT, COL_SUB];
  const LABEL_COL_X = totalsLeft;
  const SUB_COL_X = totalsLeft + COL_UNIT;

  // Backgrounds: Subtotal/GST white, Total row highlighted (Unit Price + Subtotal columns only)
  page.drawRectangle({
    x: totalsLeft,
    y: totalsTop - TOTALS_ROW_H * 3,
    width: COL_UNIT + COL_SUB,
    height: TOTALS_ROW_H * 2,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({
    x: totalsLeft,
    y: totalsTop - TOTALS_ROW_H * 3,
    width: COL_UNIT + COL_SUB,
    height: TOTALS_ROW_H,
    color: TOTAL_ROW_HIGHLIGHT,
  });

  // Totals: aligned with Unit Price + Subtotal columns only (no table on the left)
  for (let r = 0; r < 3; r++) {
    const rowTop = totalsTop - r * TOTALS_ROW_H;
    drawCellBorders(page, totalsLeft, rowTop, colWidths, TOTALS_ROW_H);
  }

  const centerY = (row: number) => totalsTop - row * TOTALS_ROW_H - TOTALS_ROW_H / 2 - 3;

  // Labels in left column, values in Subtotal column (aligned with items table)
  page.drawText("Subtotal", { x: LABEL_COL_X + CELL_PAD, y: centerY(0), size: 8, font: ctx.font, color: TEXT_MID });
  const subStr = formatCurrency(data.subtotal);
  page.drawText(subStr, {
    x: SUB_COL_X + COL_SUB - CELL_PAD - ctx.font.widthOfTextAtSize(subStr, 8),
    y: centerY(0),
    size: 8,
    font: ctx.font,
    color: TEXT_MID,
  });

  page.drawText(`GST (${Math.round(data.gst_percent)}%)`, { x: LABEL_COL_X + CELL_PAD, y: centerY(1), size: 8, font: ctx.font, color: TEXT_MID });
  const taxStr = formatCurrency(data.tax);
  page.drawText(taxStr, {
    x: SUB_COL_X + COL_SUB - CELL_PAD - ctx.font.widthOfTextAtSize(taxStr, 8),
    y: centerY(1),
    size: 8,
    font: ctx.font,
    color: TEXT_MID,
  });

  page.drawText("Total (AUD)", { x: LABEL_COL_X + CELL_PAD, y: centerY(2), size: 9, font: ctx.fontBold, color: TEXT_DARK });
  const totalStr = formatCurrency(data.total);
  page.drawText(totalStr, {
    x: SUB_COL_X + COL_SUB - CELL_PAD - ctx.fontBold.widthOfTextAtSize(totalStr, 9),
    y: centerY(2),
    size: 9,
    font: ctx.fontBold,
    color: TEXT_DARK,
  });

  // Notes: bulleted list format
  const notesText = data.notes?.trim();
  if (notesText) {
    const notesWidth = ctx.width - ctx.margin * 2 - 80;
    const bullet = "• ";
    const lines = notesText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const notesLines: string[] = [];
    for (const line of lines) {
      const stripped = line.replace(/^[•\-*]\s*/, "");
      const bulletW = ctx.font.widthOfTextAtSize(bullet, 8.5);
      const wrapped = wrapText(stripped, notesWidth - bulletW, 8.5, ctx.font);
      if (wrapped.length > 0) {
        notesLines.push(bullet + wrapped[0]);
        for (let j = 1; j < wrapped.length; j++) {
          notesLines.push("  " + wrapped[j]);
        }
      } else {
        notesLines.push(bullet);
      }
    }
    if (notesLines.length > 0) {
      const notesTop = totalsTop - TOTALS_ROW_H * 3 - 24;
      page.drawText("Notes:", {
        x: ctx.margin,
        y: notesTop,
        size: 9,
        font: ctx.fontBold,
        color: TEXT_DARK,
      });
      notesLines.forEach((line, i) => {
        page.drawText(line, {
          x: ctx.margin,
          y: notesTop - 14 - i * 12,
          size: 8.5,
          font: ctx.font,
          color: TEXT_MID,
        });
      });
    }
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
