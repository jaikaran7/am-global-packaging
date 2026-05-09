import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { InvoicePdfData } from "./types";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 48;
const TEXT_DARK = rgb(0.15, 0.17, 0.2);
const TEXT_MID = rgb(0.35, 0.38, 0.42);
const TEAL = rgb(0.12, 0.35, 0.36);
const BORDER = rgb(0.85, 0.87, 0.88);

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([A4.width, A4.height]);
  const { width, height } = page.getSize();
  let y = height - MARGIN;

  const cur = data.currency_label || "USD";

  // Logo placeholder (top right)
  page.drawRectangle({
    x: width - MARGIN - 72,
    y: y - 48,
    width: 72,
    height: 48,
    borderColor: BORDER,
    borderWidth: 1,
    color: rgb(0.97, 0.97, 0.98),
  });
  page.drawText("Logo", {
    x: width - MARGIN - 48,
    y: y - 28,
    size: 8,
    font,
    color: TEXT_MID,
  });

  // INVOICE title (top left)
  page.drawText("INVOICE", {
    x: MARGIN,
    y,
    size: 22,
    font: bold,
    color: TEAL,
  });
  y -= 28;

  page.drawText(data.company.name, {
    x: MARGIN,
    y,
    size: 11,
    font: bold,
    color: TEXT_DARK,
  });
  y -= 14;
  if (data.company.tagline) {
    page.drawText(data.company.tagline, { x: MARGIN, y, size: 9, font, color: TEXT_MID });
    y -= 13;
  }

  y -= 12;

  // Meta block (right)
  let metaY = height - MARGIN - 56;
  const metaX = width - MARGIN - 200;
  const metaRows = [
    ["Invoice No", data.invoice_number],
    ["Date", fmtDate(data.invoice_date)],
    ["Due Date", fmtDate(data.due_date)],
    ["Currency", cur],
  ];
  for (const [lab, val] of metaRows) {
    page.drawText(`${lab}:`, { x: metaX, y: metaY, size: 9, font, color: TEXT_MID });
    page.drawText(val, { x: metaX + 78, y: metaY, size: 9, font: bold, color: TEXT_DARK });
    metaY -= 14;
  }

  if (data.company.gst_note) {
    page.drawText(data.company.gst_note, {
      x: MARGIN,
      y,
      size: 8,
      font,
      color: TEAL,
    });
    y -= 14;
  }

  y -= 10;

  // Invoice To / Invoice From columns
  const colW = (width - MARGIN * 3) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN * 2 + colW;
  const boxTop = y;

  page.drawRectangle({
    x: leftX,
    y: boxTop - 120,
    width: colW,
    height: 120,
    borderColor: BORDER,
    borderWidth: 0.75,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({
    x: rightX,
    y: boxTop - 120,
    width: colW,
    height: 120,
    borderColor: BORDER,
    borderWidth: 0.75,
    color: rgb(0.99, 0.995, 1),
  });

  page.drawText("Invoice To", {
    x: leftX + 8,
    y: boxTop - 18,
    size: 10,
    font: bold,
    color: TEAL,
  });
  let ly = boxTop - 34;
  const billLines = [
    data.bill_to.name,
    data.bill_to.phone ?? "",
    data.bill_to.email ?? "",
    data.bill_to.address ?? "",
  ].filter(Boolean);
  for (const line of billLines) {
    page.drawText(line.slice(0, 80), { x: leftX + 8, y: ly, size: 9, font, color: TEXT_DARK });
    ly -= 12;
  }

  page.drawText("Invoice From", {
    x: rightX + 8,
    y: boxTop - 18,
    size: 10,
    font: bold,
    color: TEAL,
  });
  let ry = boxTop - 34;
  const fromLines = [
    data.company.name,
    data.company.abn ? `ABN: ${data.company.abn}` : "",
    data.company.bank_name && data.company.bsb && data.company.account_number
      ? `Bank: ${data.company.bank_name} · BSB: ${data.company.bsb} · A/C: ${data.company.account_number}`
      : "",
  ].filter(Boolean);
  for (const line of fromLines) {
    page.drawText(line.slice(0, 95), { x: rightX + 8, y: ry, size: 8.5, font, color: TEXT_DARK });
    ry -= 12;
  }

  y = boxTop - 132;

  // Table header
  const cols = [28, 260, 72, 52, 72];
  const tableLeft = MARGIN;
  page.drawRectangle({
    x: tableLeft,
    y: y - 22,
    width: cols.reduce((a, b) => a + b, 0),
    height: 22,
    color: TEAL,
  });
  const headers = ["SL", "Item Description", `Unit (${cur})`, "Qty", `Total (${cur})`];
  let cx = tableLeft + 6;
  const hy = y - 15;
  page.drawText(headers[0], { x: cx, y: hy, size: 9, font: bold, color: rgb(1, 1, 1) });
  cx += cols[0];
  page.drawText(headers[1], { x: cx, y: hy, size: 9, font: bold, color: rgb(1, 1, 1) });
  cx += cols[1];
  page.drawText(headers[2], { x: cx, y: hy, size: 9, font: bold, color: rgb(1, 1, 1) });
  cx += cols[2];
  page.drawText(headers[3], { x: cx, y: hy, size: 9, font: bold, color: rgb(1, 1, 1) });
  cx += cols[3];
  page.drawText(headers[4], { x: cx, y: hy, size: 9, font: bold, color: rgb(1, 1, 1) });

  y -= 22;

  let rowNum = 1;
  for (const line of data.lines) {
    const rowH = 22;
    page.drawRectangle({
      x: tableLeft,
      y: y - rowH,
      width: cols.reduce((a, b) => a + b, 0),
      height: rowH,
      borderColor: BORDER,
      borderWidth: 0.5,
      color: rowNum % 2 === 0 ? rgb(0.99, 0.99, 0.995) : rgb(1, 1, 1),
    });
    const midY = y - rowH / 2 - 3;
    page.drawText(String(rowNum), { x: tableLeft + 8, y: midY, size: 9, font, color: TEXT_MID });
    page.drawText(line.description.slice(0, 58), {
      x: tableLeft + cols[0] + 6,
      y: midY,
      size: 9,
      font,
      color: TEXT_DARK,
    });
    page.drawText(fmtMoney(line.unit_price), {
      x: tableLeft + cols[0] + cols[1] + 8,
      y: midY,
      size: 9,
      font,
      color: TEXT_MID,
    });
    page.drawText(String(line.quantity), {
      x: tableLeft + cols[0] + cols[1] + cols[2] + 10,
      y: midY,
      size: 9,
      font,
      color: TEXT_MID,
    });
    page.drawText(fmtMoney(line.line_total), {
      x: tableLeft + cols[0] + cols[1] + cols[2] + cols[3] + 8,
      y: midY,
      size: 9,
      font: bold,
      color: TEXT_DARK,
    });
    y -= rowH;
    rowNum++;
  }

  y -= 16;

  // Totals (right-aligned block)
  const labelCol = width - MARGIN - 190;
  let ty = y;
  const rowGap = 14;

  page.drawText("Subtotal:", { x: labelCol, y: ty, size: 9, font, color: TEXT_DARK });
  page.drawText(fmtMoney(data.subtotal), {
    x: width - MARGIN - font.widthOfTextAtSize(fmtMoney(data.subtotal), 9),
    y: ty,
    size: 9,
    font,
    color: TEXT_MID,
  });
  ty -= rowGap;

  page.drawText("Discount:", { x: labelCol, y: ty, size: 9, font, color: TEXT_DARK });
  page.drawText(data.discount_amount > 0 ? `− ${fmtMoney(data.discount_amount)}` : fmtMoney(0), {
    x: width - MARGIN - font.widthOfTextAtSize(fmtMoney(data.discount_amount), 9),
    y: ty,
    size: 9,
    font,
    color: TEXT_MID,
  });
  ty -= rowGap;

  page.drawText(`GST (${data.gst_percent}%):`, { x: labelCol, y: ty, size: 9, font, color: TEXT_DARK });
  page.drawText(fmtMoney(data.tax), {
    x: width - MARGIN - font.widthOfTextAtSize(fmtMoney(data.tax), 9),
    y: ty,
    size: 9,
    font,
    color: TEXT_MID,
  });
  ty -= rowGap + 2;

  const totalStr = fmtMoney(data.total);
  page.drawText("Total:", { x: labelCol, y: ty, size: 11, font: bold, color: TEXT_DARK });
  page.drawText(totalStr, {
    x: width - MARGIN - bold.widthOfTextAtSize(totalStr, 11),
    y: ty,
    size: 11,
    font: bold,
    color: TEAL,
  });

  ty -= 28;

  // Payment info (bottom left)
  page.drawText("Payment Information", {
    x: MARGIN,
    y: ty,
    size: 10,
    font: bold,
    color: TEAL,
  });
  ty -= 16;
  const pay = [
    `Account No: ${data.company.account_number ?? "—"}`,
    `A/C Name: ${data.company.name}`,
    `Branch / BSB: ${data.company.bsb ?? "—"}`,
    `Bank: ${data.company.bank_name ?? "—"}`,
    `ABN: ${data.company.abn ?? "—"}`,
  ];
  for (const p of pay) {
    page.drawText(p, { x: MARGIN, y: ty, size: 8.5, font, color: TEXT_MID });
    ty -= 12;
  }

  ty -= 16;

  page.drawText("Terms & Conditions", {
    x: MARGIN,
    y: ty,
    size: 10,
    font: bold,
    color: TEAL,
  });
  ty -= 14;
  const terms = (data.terms_text ?? "").slice(0, 1200);
  const words = terms.split(/\s+/);
  let line = "";
  const termLines: string[] = [];
  const maxW = width - MARGIN * 2;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, 8) > maxW) {
      termLines.push(line);
      line = w;
    } else line = next;
  }
  if (line) termLines.push(line);
  for (const tl of termLines.slice(0, 14)) {
    page.drawText(tl, { x: MARGIN, y: ty, size: 8, font, color: TEXT_MID });
    ty -= 11;
  }

  ty -= 16;
  page.drawText("Get in Touch", { x: MARGIN, y: ty, size: 9, font: bold, color: TEXT_DARK });
  ty -= 12;
  const foot = [data.company.phone, data.company.address_line, data.company.email].filter(Boolean).join(" · ");
  page.drawText(foot.slice(0, 120), { x: MARGIN, y: ty, size: 8, font, color: TEXT_MID });

  ty -= 36;
  page.drawText("Authorised Signature", { x: MARGIN, y: ty, size: 9, font, color: TEXT_MID });
  page.drawLine({
    start: { x: MARGIN, y: ty - 8 },
    end: { x: MARGIN + 160, y: ty - 8 },
    thickness: 0.5,
    color: BORDER,
  });

  return pdf.save();
}
