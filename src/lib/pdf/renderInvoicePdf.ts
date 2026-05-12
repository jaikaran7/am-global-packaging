import fs from "node:fs";
import path from "node:path";
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { InvoicePdfData } from "./types";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN_X = 36;
const MARGIN_TOP = 36;
const R_CARD = 10;
const R_TABLE_TOP = 8;

/** Match InvoicePreviewPanel / screenshot */
const INV_TEAL = rgb(0 / 255, 43 / 255, 54 / 255);
const INV_TEAL_DEEP = rgb(0 / 255, 26 / 255, 33 / 255);
const INV_GOLD = rgb(197 / 255, 160 / 255, 89 / 255);
const INV_GRAY = rgb(244 / 255, 244 / 255, 244 / 255);
const TEXT_ON_WHITE = rgb(0 / 255, 43 / 255, 54 / 255);
const TEXT_MUTED = rgb(95 / 255, 110 / 255, 118 / 255);
const WHITE = rgb(1, 1, 1);

const HEADER_H = 132;
const SPLIT_FRAC = 0.55;
const ROW_H = 23;
const FOOTER_H = 78;
const FINAL_BLOCK_MIN_Y = FOOTER_H + 218;
const CONTINUE_BLOCK_MIN_Y = FOOTER_H + 36;
const BORDER_LIGHT = rgb(0.88, 0.9, 0.91);

function getLogoPath(): string {
  return path.join(process.cwd(), "public", "am-global-logo.png");
}

/** SVG path: rounded rect, origin bottom-left, y increases upward (PDF-style path for drawSvgPath) */
function roundedRectPath(w: number, h: number, r: number): string {
  const s = Math.min(r, w / 2, h / 2);
  return `M ${s},0 L ${w - s},0 Q ${w},0 ${w},${s} L ${w},${h - s} Q ${w},${h} ${w - s},${h} L ${s},${h} Q 0,${h} 0,${h - s} L 0,${s} Q 0,0 ${s},0 Z`;
}

/** Teal table header with rounded top corners */
function roundedTopRectPath(w: number, h: number, r: number): string {
  const s = Math.min(r, w / 2, h);
  return `M ${s},0 Q 0,0 0,${s} L 0,${h} L ${w},${h} L ${w},${s} Q ${w},0 ${w - s},0 L ${s},0 Z`;
}

function wrapWords(text: string, maxWidth: number, fontSize: number, font: PDFFont): string[] {
  const words = pdfSafeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** DD/MM/YYYY like screenshot */
function fmtDateNumeric(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function fmtMoney(n: number, cur: string): string {
  const sym = cur === "AUD" || cur === "USD" ? "$" : `${cur} `;
  return `${sym}${n.toFixed(2)}`;
}

function pdfSafeText(input: string): string {
  return input
    .replace(/\u25cf/gi, "*")
    .replace(/\u2022/g, "*")
    .replace(/\u2013|\u2014|\u2212/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\t\n\r\x20-\x7e\xa0-\xff]/g, "?");
}

/** Clean white page — full-page template wash made the PDF look muddy vs the modal */
async function drawPageBackground(page: PDFPage): Promise<void> {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE });
}

function drawSplitHeader(
  page: PDFPage,
  data: InvoicePdfData,
  font: PDFFont,
  bold: PDFFont,
  logo: Awaited<ReturnType<PDFDocument["embedPng"]>> | null,
  topY: number,
  cur: string
): number {
  const { width } = page.getSize();
  const splitX = width * SPLIT_FRAC;
  const headerBottom = topY - HEADER_H;

  page.drawRectangle({
    x: 0,
    y: headerBottom,
    width: splitX,
    height: HEADER_H,
    color: INV_TEAL,
  });
  page.drawRectangle({
    x: splitX,
    y: headerBottom,
    width: width - splitX,
    height: HEADER_H,
    color: WHITE,
  });

  const logoCX = 48;
  const logoCY = headerBottom + HEADER_H / 2 - 2;
  const boxR = 8;
  const boxW = 56;
  const boxH = 56;
  page.drawSvgPath(roundedRectPath(boxW, boxH, boxR), {
    x: logoCX - boxW / 2,
    y: logoCY - boxH / 2,
    color: INV_TEAL_DEEP,
    borderColor: INV_GOLD,
    borderWidth: 0.75,
  });
  const imgS = 40;
  if (logo) {
    page.drawImage(logo, {
      x: logoCX - imgS / 2,
      y: logoCY - imgS / 2,
      width: imgS,
      height: imgS,
    });
  }

  let tx = logoCX + boxW / 2 + 14;
  let ty = topY - 30;
  const nameSize = 14;
  page.drawText(pdfSafeText(data.company.name).slice(0, 44), {
    x: tx,
    y: ty,
    size: nameSize,
    font: bold,
    color: WHITE,
  });
  ty -= nameSize + 5;
  if (data.company.tagline) {
    page.drawText(pdfSafeText(data.company.tagline).slice(0, 56), {
      x: tx,
      y: ty,
      size: 9,
      font: bold,
      color: INV_GOLD,
    });
    ty -= 11;
  }

  ty -= 8;
  const infoSize = 7.5;
  const infoLines: string[] = [];
  if (data.company.address_line) infoLines.push(data.company.address_line);
  if (data.company.website_url) infoLines.push(data.company.website_url);
  if (data.company.abn) infoLines.push(`ABN: ${data.company.abn}`);
  if (data.company.phone) infoLines.push(data.company.phone);
  if (data.company.email) infoLines.push(data.company.email);
  for (const il of infoLines.slice(0, 6)) {
    page.drawText(pdfSafeText(il).slice(0, 74), {
      x: tx,
      y: ty,
      size: infoSize,
      font,
      color: rgb(0.96, 0.97, 0.98),
    });
    ty -= infoSize + 3;
  }

  const invTitleX = splitX + 20;
  let iy = topY - 28;
  page.drawText("INVOICE", {
    x: invTitleX,
    y: iy,
    size: 24,
    font: bold,
    color: INV_TEAL,
  });
  iy -= 10;
  page.drawLine({
    start: { x: invTitleX, y: iy },
    end: { x: width - MARGIN_X, y: iy },
    thickness: 1.5,
    color: INV_GOLD,
  });
  iy -= 20;

  const metaRight = width - MARGIN_X - 6;
  const dotX = invTitleX + 6;
  const labX = invTitleX + 18;
  const metaRows: [string, string][] = [
    ["Invoice No.", pdfSafeText(data.invoice_number)],
    ["Invoice Date", fmtDateNumeric(data.invoice_date)],
  ];
  if (data.due_date && String(data.due_date).trim()) {
    metaRows.push(["Due Date", fmtDateNumeric(data.due_date)]);
  }
  metaRows.push(["GST %", String(data.gst_percent)]);
  const labelCur = cur === "USD" ? "AUD" : cur;
  if (Number(data.discount_amount) > 0) {
    metaRows.push([`Discount (${labelCur})`, fmtMoney(data.discount_amount, cur)]);
  }
  for (const [lab, val] of metaRows) {
    page.drawCircle({ x: dotX, y: iy + 3, size: 4, color: INV_TEAL });
    page.drawText(lab, {
      x: labX,
      y: iy,
      size: 8,
      font,
      color: TEXT_MUTED,
    });
    const vw = bold.widthOfTextAtSize(val, 8);
    page.drawText(val.slice(0, 30), {
      x: metaRight - vw,
      y: iy,
      size: 8,
      font: bold,
      color: TEXT_ON_WHITE,
    });
    iy -= 13;
  }

  return headerBottom - 18;
}

function drawBillTo(page: PDFPage, data: InvoicePdfData, font: PDFFont, bold: PDFFont, topY: number): number {
  const { width } = page.getSize();
  const cardW = width - MARGIN_X * 2;
  const cardH = 108;
  const bottomY = topY - cardH;

  page.drawSvgPath(roundedRectPath(cardW, cardH, R_CARD), {
    x: MARGIN_X,
    y: bottomY,
    color: INV_GRAY,
    borderColor: BORDER_LIGHT,
    borderWidth: 0.75,
  });

  const tabW = 118;
  const tabH = 24;
  page.drawRectangle({
    x: MARGIN_X,
    y: topY - tabH,
    width: tabW,
    height: tabH,
    color: INV_TEAL,
  });
  page.drawText("BILL TO", {
    x: MARGIN_X + 12,
    y: topY - tabH + 7,
    size: 9,
    font: bold,
    color: WHITE,
  });

  let ly = topY - tabH - 16;
  const lx = MARGIN_X + 18;
  const labelW = 76;
  const rows: [string, string][] = [
    ["Name", data.bill_to.name || "-"],
    ["Phone", data.bill_to.phone ?? "-"],
    ["Email", data.bill_to.email ?? "-"],
    ["Address", (data.bill_to.address ?? "-").replace(/\n/g, ", ")],
  ];
  for (const [lab, val] of rows) {
    page.drawText(`${lab}:`, { x: lx, y: ly, size: 8.5, font: bold, color: TEXT_MUTED });
    const wrapped = wrapWords(val, cardW - labelW - 48, 8.5, font);
    const vx = lx + labelW;
    for (let i = 0; i < Math.min(wrapped.length, 2); i++) {
      page.drawText(wrapped[i]!.slice(0, 92), {
        x: vx,
        y: ly - i * 11,
        size: 8.5,
        font,
        color: TEXT_ON_WHITE,
      });
    }
    ly -= wrapped.length > 1 ? 24 : 13;
  }

  return bottomY - 14;
}

function drawTableAndTotals(
  page: PDFPage,
  data: InvoicePdfData,
  font: PDFFont,
  bold: PDFFont,
  startY: number,
  cur: string,
  lineStart: number,
  lineEnd: number
): number {
  const { width } = page.getSize();
  const tableLeft = MARGIN_X;
  const tableW = width - MARGIN_X * 2;
  const cols = [28, tableW - 28 - 82 - 46 - 82, 82, 46, 82];
  const headerH = 24;

  let y = startY;

  page.drawSvgPath(roundedTopRectPath(tableW, headerH, R_TABLE_TOP), {
    x: tableLeft,
    y: y - headerH,
    color: INV_TEAL,
  });

  let cx = tableLeft + 10;
  const hy = y - 16;
  const headers = ["#", "ITEM DESCRIPTION", "UNIT PRICE", "QTY", "TOTAL"];
  page.drawText(headers[0], { x: cx, y: hy, size: 8.5, font: bold, color: WHITE });
  cx += cols[0];
  page.drawText(headers[1], { x: cx, y: hy, size: 8.5, font: bold, color: WHITE });
  cx += cols[1];
  page.drawText(headers[2], { x: cx, y: hy, size: 8.5, font: bold, color: WHITE });
  cx += cols[2];
  page.drawText(headers[3], { x: cx + 6, y: hy, size: 8.5, font: bold, color: WHITE });
  cx += cols[3];
  page.drawText(headers[4], { x: cx, y: hy, size: 8.5, font: bold, color: WHITE });

  y -= headerH;

  for (let idx = lineStart; idx < lineEnd; idx++) {
    const line = data.lines[idx]!;
    const rowBg = idx % 2 === 0 ? WHITE : INV_GRAY;
    page.drawRectangle({
      x: tableLeft,
      y: y - ROW_H,
      width: tableW,
      height: ROW_H,
      color: rowBg,
      borderColor: BORDER_LIGHT,
      borderWidth: 0.45,
    });
    const mid = y - ROW_H / 2 - 3;
    page.drawText(String(idx + 1), {
      x: tableLeft + 12,
      y: mid,
      size: 9,
      font,
      color: TEXT_MUTED,
    });
    page.drawText(pdfSafeText(line.description).slice(0, 52), {
      x: tableLeft + cols[0] + 6,
      y: mid,
      size: 9,
      font,
      color: TEXT_ON_WHITE,
    });
    const up = fmtMoney(line.unit_price, cur);
    const uw = font.widthOfTextAtSize(up, 9);
    page.drawText(up, {
      x: tableLeft + cols[0] + cols[1] + cols[2] - uw - 4,
      y: mid,
      size: 9,
      font,
      color: TEXT_ON_WHITE,
    });
    page.drawText(String(line.quantity), {
      x: tableLeft + cols[0] + cols[1] + cols[2] + 20,
      y: mid,
      size: 9,
      font,
      color: TEXT_ON_WHITE,
    });
    const lt = fmtMoney(line.line_total, cur);
    const lw = bold.widthOfTextAtSize(lt, 9);
    page.drawText(lt, {
      x: tableLeft + tableW - lw - 12,
      y: mid,
      size: 9,
      font: bold,
      color: TEXT_ON_WHITE,
    });
    y -= ROW_H;
  }

  if (lineEnd >= data.lines.length) {
    y -= 14;

    const totalsW = 236;
    const totalsRight = width - MARGIN_X;
    const totalsLeft = totalsRight - totalsW;
    const totalsTop = y;
    const boxH = 82;
    const gtH = 28;
    const boxBottom = totalsTop - boxH;

    page.drawRectangle({
      x: totalsLeft,
      y: boxBottom + gtH,
      width: totalsW,
      height: boxH - gtH,
      color: INV_GRAY,
      borderColor: BORDER_LIGHT,
      borderWidth: 0.6,
    });

    let ty = totalsTop - 20;
    const lx = totalsLeft + 14;
    const rx = totalsRight - 16;

    const rowTot = (label: string, val: string) => {
      page.drawText(label, { x: lx, y: ty, size: 9.5, font, color: TEXT_MUTED });
      const vw = font.widthOfTextAtSize(val, 9.5);
      page.drawText(val, { x: rx - vw, y: ty, size: 9.5, font: bold, color: TEXT_ON_WHITE });
      ty -= 15;
    };

    rowTot("Subtotal", fmtMoney(data.subtotal, cur));
    if (Number(data.discount_amount) > 0) {
      rowTot("Discount", `-${fmtMoney(data.discount_amount, cur)}`);
    }
    rowTot(`GST (${data.gst_percent}%)`, fmtMoney(data.tax, cur));

    page.drawRectangle({
      x: totalsLeft,
      y: boxBottom,
      width: totalsW,
      height: gtH,
      color: INV_TEAL,
    });
    const labelCur = cur === "USD" ? "AUD" : cur;
    const gtOneLine = `GRAND TOTAL (${labelCur})   ${fmtMoney(data.total, cur)}`;
    const gw = bold.widthOfTextAtSize(gtOneLine, 9.5);
    page.drawText(gtOneLine, {
      x: totalsLeft + (totalsW - gw) / 2,
      y: boxBottom + 9,
      size: 9.5,
      font: bold,
      color: WHITE,
    });

    y = boxBottom - 20;

    const colGap = 16;
    const half = (tableW - colGap) / 2;
    const payH = 96;

    page.drawSvgPath(roundedRectPath(half, payH, R_CARD), {
      x: tableLeft,
      y: y - payH,
      color: rgb(0.99, 0.97, 0.93),
      borderColor: rgb(0.82, 0.72, 0.52),
      borderWidth: 0.85,
    });
    page.drawRectangle({
      x: tableLeft,
      y: y - payH,
      width: 5,
      height: payH,
      color: INV_TEAL,
    });

    page.drawText("PAYMENT INFORMATION", {
      x: tableLeft + 16,
      y: y - 20,
      size: 9.5,
      font: bold,
      color: INV_TEAL,
    });
    let py = y - 38;
    const payRows: [string, string][] = [
      ["Bank Name", data.company.bank_name ?? "-"],
      ["BSB / Sort Code", data.company.bsb ?? "-"],
      ["Account Number", data.company.account_number ?? "-"],
      ["Account Name", pdfSafeText(data.company.name).slice(0, 38)],
    ];
    const valX = tableLeft + half - 14;
    for (const [k, v] of payRows) {
      page.drawText(k, { x: tableLeft + 16, y: py, size: 8.5, font, color: TEXT_MUTED });
      const vs = pdfSafeText(v).slice(0, 42);
      const vw = bold.widthOfTextAtSize(vs, 9);
      page.drawText(vs, {
        x: valX - vw,
        y: py - 0.5,
        size: 9,
        font: bold,
        color: INV_TEAL,
      });
      py -= 13;
    }

    const termsX = tableLeft + half + colGap;
    page.drawSvgPath(roundedRectPath(half, payH, R_CARD), {
      x: termsX,
      y: y - payH,
      color: INV_GRAY,
      borderColor: BORDER_LIGHT,
      borderWidth: 0.6,
    });
    page.drawRectangle({
      x: termsX + half - 5,
      y: y - payH,
      width: 5,
      height: payH,
      color: INV_GOLD,
    });

    page.drawText("TERMS & CONDITIONS", {
      x: termsX + 14,
      y: y - 20,
      size: 9.5,
      font: bold,
      color: INV_TEAL,
    });
    const terms = (data.terms_text ?? "").trim();
    let tY = y - 36;
    const termLines = wrapWords(terms || "-", half - 28, 8, font);
    for (const tl of termLines.slice(0, 7)) {
      page.drawText(tl.slice(0, 125), {
        x: termsX + 14,
        y: tY,
        size: 8,
        font,
        color: TEXT_MUTED,
      });
      tY -= 11;
    }

    y = y - payH - 14;
  }

  return y;
}

function drawFooter(page: PDFPage, data: InvoicePdfData, font: PDFFont, bold: PDFFont): void {
  const { width } = page.getSize();
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: FOOTER_H,
    color: INV_TEAL,
  });

  const partGold = "Thank you ";
  const partWhite = "for your business";
  const wGold = bold.widthOfTextAtSize(partGold, 11);
  const startX = width / 2 - (wGold + bold.widthOfTextAtSize(partWhite, 9)) / 2;
  const ty = FOOTER_H - 38;
  page.drawText(partGold, {
    x: startX,
    y: ty,
    size: 11,
    font: bold,
    color: INV_GOLD,
  });
  page.drawText(partWhite, {
    x: startX + wGold,
    y: ty + 1,
    size: 9,
    font: bold,
    color: rgb(0.98, 0.98, 0.98),
  });

  const parts: string[] = [];
  if (data.company.website_url) parts.push(data.company.website_url);
  if (data.company.phone) parts.push(data.company.phone);
  if (data.company.email) parts.push(data.company.email);
  const foot = pdfSafeText(parts.join("   |   ").slice(0, 140));
  const fw = font.widthOfTextAtSize(foot, 8);
  page.drawText(foot, {
    x: width / 2 - fw / 2,
    y: 16,
    size: 8,
    font,
    color: rgb(0.92, 0.94, 0.95),
  });
}

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cur = data.currency_label || "AUD";

  let logoImg: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
  const logoPath = getLogoPath();
  if (fs.existsSync(logoPath)) {
    logoImg = await pdf.embedPng(fs.readFileSync(logoPath));
  }

  const addPage = (): PDFPage => pdf.addPage([A4.width, A4.height]);

  let page = addPage();
  await drawPageBackground(page);

  const { height } = page.getSize();
  let y = height - MARGIN_TOP;

  y = drawSplitHeader(page, data, font, bold, logoImg, y, cur);
  y = drawBillTo(page, data, font, bold, y);

  let lineIdx = 0;
  const allLines = data.lines;

  function tableRowsThatFit(yStart: number, reserveForTotalsBlock: boolean): number {
    const minY = reserveForTotalsBlock ? FINAL_BLOCK_MIN_Y : CONTINUE_BLOCK_MIN_Y;
    return Math.floor((yStart - 24 - minY) / ROW_H);
  }

  while (lineIdx < allLines.length) {
    const remaining = allLines.length - lineIdx;
    const midCap = tableRowsThatFit(y, false);
    const finalCap = tableRowsThatFit(y, true);

    if (midCap < 1 && finalCap < 1) {
      page = addPage();
      await drawPageBackground(page);
      y = height - MARGIN_TOP - 30;
      page.drawText(`Invoice ${pdfSafeText(data.invoice_number)} (continued)`, {
        x: MARGIN_X,
        y,
        size: 10,
        font: bold,
        color: INV_TEAL,
      });
      y -= 24;
      continue;
    }

    let chunk: number;
    if (remaining <= midCap) {
      chunk = Math.min(remaining, Math.max(1, finalCap));
    } else {
      chunk = Math.max(1, midCap);
    }

    const lineEnd = lineIdx + chunk;
    y = drawTableAndTotals(page, data, font, bold, y, cur, lineIdx, lineEnd);
    lineIdx = lineEnd;

    if (lineIdx < allLines.length) {
      page = addPage();
      await drawPageBackground(page);
      y = height - MARGIN_TOP - 30;
      page.drawText(`Invoice ${pdfSafeText(data.invoice_number)} (continued)`, {
        x: MARGIN_X,
        y,
        size: 10,
        font: bold,
        color: INV_TEAL,
      });
      y -= 24;
    }
  }

  if (allLines.length === 0) {
    y = drawTableAndTotals(page, data, font, bold, y, cur, 0, 0);
  }

  drawFooter(page, data, font, bold);

  return pdf.save();
}
