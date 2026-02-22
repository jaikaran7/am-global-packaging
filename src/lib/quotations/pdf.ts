import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";

type QuoteCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
};

type QuoteItem = {
  product_title: string;
  variant_name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type QuoteData = {
  quote_number: string;
  status: string;
  valid_until?: string | null;
  created_at: string;
  notes?: string | null;
  terms_text?: string | null;
  gst_percent: number;
  subtotal: number;
  tax: number;
  total: number;
  customer: QuoteCustomer;
  items: QuoteItem[];
};

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length * (fontSize * 0.5) > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function getLetterheadPath() {
  return path.join(process.cwd(), "src", "components", "admin", "quotations", "letter head.png");
}

async function drawLetterhead(page: any, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const imgPath = getLetterheadPath();
  if (!fs.existsSync(imgPath)) return;
  const imgBytes = fs.readFileSync(imgPath);
  const png = await pdfDoc.embedPng(imgBytes);
  page.drawImage(png, {
    x: 0,
    y: 0,
    width,
    height,
  });
}

function drawBulletedTerms(
  page: any,
  terms: string,
  startX: number,
  startY: number,
  maxWidth: number,
  font: any,
  fontBold: any
) {
  const lines = terms.split(/\r?\n/);
  let y = startY;
  const bulletIndent = 10;
  const lineHeight = 12;
  const sectionGap = 8;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      y -= sectionGap;
      return;
    }
    const isHeading = line.endsWith(":");
    if (isHeading) {
      page.drawText(line, {
        x: startX,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.24, 0.28),
      });
      y -= lineHeight;
      return;
    }
    page.drawText("•", {
      x: startX,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.34, 0.38),
    });
    const wrapped = wrapText(line, maxWidth - bulletIndent, 9);
    wrapped.forEach((w, i) => {
      page.drawText(w, {
        x: startX + bulletIndent,
        y: y - i * lineHeight,
        size: 9,
        font,
        color: rgb(0.3, 0.34, 0.38),
      });
    });
    y -= lineHeight * wrapped.length;
  });
}

export async function generateQuotationPdf(data: QuoteData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  const contentTop = height - 170;
  const contentBottom = 120;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  await drawLetterhead(page, pdfDoc);

  // Quote metadata (tabular)
  const metaY = contentTop;
  const metaRowHeight = 18;
  const hasValidUntil = Boolean(data.valid_until);
  const metaCols = hasValidUntil ? 3 : 2;
  const metaColWidth = (width - margin * 2) / metaCols;
  const metaLabels = ["Quotation #", "Date"];
  if (hasValidUntil) metaLabels.push("Valid Until");
  const metaValues = [
    data.quote_number,
    new Date(data.created_at).toLocaleDateString("en-AU"),
    ...(hasValidUntil ? [String(data.valid_until)] : []),
  ];

  metaLabels.forEach((label, i) => {
    page.drawText(label, {
      x: margin + i * metaColWidth,
      y: metaY,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.24, 0.28),
    });
    page.drawText(metaValues[i], {
      x: margin + i * metaColWidth,
      y: metaY - 12,
      size: 10,
      font,
      color: rgb(0.35, 0.4, 0.45),
    });
  });

  // Meta table borders
  page.drawLine({
    start: { x: margin, y: metaY + 6 },
    end: { x: width - margin, y: metaY + 6 },
    thickness: 0.6,
    color: rgb(0.85, 0.86, 0.88),
  });
  page.drawLine({
    start: { x: margin, y: metaY - metaRowHeight },
    end: { x: width - margin, y: metaY - metaRowHeight },
    thickness: 0.6,
    color: rgb(0.85, 0.86, 0.88),
  });
  for (let i = 1; i < metaCols; i += 1) {
    page.drawLine({
      start: { x: margin + i * metaColWidth, y: metaY + 6 },
      end: { x: margin + i * metaColWidth, y: metaY - metaRowHeight },
      thickness: 0.6,
      color: rgb(0.9, 0.9, 0.92),
    });
  }

  // Customer block
  const customerY = metaY - 48;
  page.drawText("Customer", { x: margin, y: customerY, size: 11, font: fontBold });
  const customerLines = [
    data.customer.name,
    data.customer.company ? `Company: ${data.customer.company}` : null,
    data.customer.email ? `Email: ${data.customer.email}` : null,
    data.customer.phone ? `Phone: ${data.customer.phone}` : null,
    data.customer.address ? `Address: ${data.customer.address}` : null,
  ].filter(Boolean) as string[];
  customerLines.forEach((line, i) => {
    page.drawText(line, {
      x: margin,
      y: customerY - 16 - i * 14,
      size: 10,
      font,
      color: rgb(0.35, 0.4, 0.45),
    });
  });

  // Items table
  const tableTop = customerY - 90;
  const tableWidth = width - margin * 2;
  const colWidths = [190, 150, 50, 70, 85];
  const colX = [
    margin,
    margin + colWidths[0],
    margin + colWidths[0] + colWidths[1],
    margin + colWidths[0] + colWidths[1] + colWidths[2],
    margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
  ];
  const cellPadding = 6;
  const baseRowHeight = 20;

  function drawItemsHeader(targetPage: any, y: number) {
    targetPage.drawRectangle({
      x: margin,
      y: y - 16,
      width: tableWidth,
      height: 20,
      color: rgb(0.95, 0.96, 0.97),
    });
    targetPage.drawText("Item", { x: colX[0] + cellPadding, y, size: 10, font: fontBold });
    targetPage.drawText("Variant", { x: colX[1] + cellPadding, y, size: 10, font: fontBold });
    targetPage.drawText("Qty", { x: colX[2] + cellPadding, y, size: 10, font: fontBold });
    targetPage.drawText("Unit", { x: colX[3] + cellPadding, y, size: 10, font: fontBold });
    targetPage.drawText("Subtotal", { x: colX[4] + cellPadding, y, size: 10, font: fontBold });
    targetPage.drawLine({
      start: { x: margin, y: y - 6 },
      end: { x: margin + tableWidth, y: y - 6 },
      thickness: 0.6,
      color: rgb(0.85, 0.86, 0.88),
    });
    for (let i = 1; i < colX.length; i += 1) {
      targetPage.drawLine({
        start: { x: colX[i], y: y + 4 },
        end: { x: colX[i], y: y - 16 },
        thickness: 0.4,
        color: rgb(0.9, 0.9, 0.92),
      });
    }
  }

  let rowY = tableTop - 22;
  drawItemsHeader(page, tableTop);

  let currentPage = page;
  for (const item of data.items) {
    const itemLines = wrapText(item.product_title, colWidths[0] - cellPadding * 2, 9);
    const variantLines = wrapText(item.variant_name, colWidths[1] - cellPadding * 2, 9);
    const rowLines = Math.max(itemLines.length, variantLines.length, 1);
    const rowHeight = baseRowHeight + (rowLines - 1) * 12;

    if (rowY - rowHeight < contentBottom + 80) {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      await drawLetterhead(currentPage, pdfDoc);
      rowY = contentTop - 24;
      drawItemsHeader(currentPage, contentTop - 6);
    }
    // Row box
    currentPage.drawRectangle({
      x: margin,
      y: rowY - rowHeight + 4,
      width: tableWidth,
      height: rowHeight,
      borderColor: rgb(0.9, 0.9, 0.92),
      borderWidth: 0.4,
    });
    for (let i = 1; i < colX.length; i += 1) {
      currentPage.drawLine({
        start: { x: colX[i], y: rowY + 4 },
        end: { x: colX[i], y: rowY - rowHeight + 4 },
        thickness: 0.4,
        color: rgb(0.9, 0.9, 0.92),
      });
    }

    itemLines.forEach((line, i) => {
      currentPage.drawText(line, {
        x: colX[0] + cellPadding,
        y: rowY - i * 12,
        size: 9,
        font,
      });
    });
    variantLines.forEach((line, i) => {
      currentPage.drawText(line, {
        x: colX[1] + cellPadding,
        y: rowY - i * 12,
        size: 9,
        font,
      });
    });
    currentPage.drawText(String(item.quantity), {
      x: colX[2] + cellPadding,
      y: rowY,
      size: 9,
      font,
    });
    currentPage.drawText(`$${item.unit_price.toFixed(2)}`, {
      x: colX[3] + cellPadding,
      y: rowY,
      size: 9,
      font,
    });
    currentPage.drawText(`$${item.subtotal.toFixed(2)}`, {
      x: colX[4] + cellPadding,
      y: rowY,
      size: 9,
      font,
    });
    rowY -= rowHeight + 2;
  }

  // Totals
  const totalsY = Math.max(rowY - 10, contentBottom + 60);
  currentPage.drawText(`Subtotal`, { x: colX[3], y: totalsY, size: 10, font });
  currentPage.drawText(`$${data.subtotal.toFixed(2)}`, {
    x: colX[4],
    y: totalsY,
    size: 10,
    font: fontBold,
  });
  currentPage.drawText(`GST (${data.gst_percent.toFixed(2)}%)`, {
    x: colX[3],
    y: totalsY - 14,
    size: 10,
    font,
  });
  currentPage.drawText(`$${data.tax.toFixed(2)}`, {
    x: colX[4],
    y: totalsY - 14,
    size: 10,
    font: fontBold,
  });
  currentPage.drawText("Total", { x: colX[3], y: totalsY - 30, size: 11, font: fontBold });
  currentPage.drawText(`$${data.total.toFixed(2)}`, {
    x: colX[4],
    y: totalsY - 30,
    size: 11,
    font: fontBold,
    color: rgb(1, 0.48, 0.18),
  });

  // Notes
  const notesText = data.notes?.trim();
  if (notesText) {
    const notesLines = wrapText(notesText, width - margin * 2, 9);
    currentPage.drawText("Notes:", { x: margin, y: totalsY - 52, size: 10, font: fontBold });
    notesLines.forEach((line, i) => {
      currentPage.drawText(line, {
        x: margin,
        y: totalsY - 66 - i * 12,
        size: 9,
        font,
        color: rgb(0.35, 0.4, 0.45),
      });
    });
  }

  // Terms page
  const termsPage = pdfDoc.addPage([595.28, 841.89]);
  await drawLetterhead(termsPage, pdfDoc);
  const terms = (data.terms_text?.trim() || DEFAULT_QUOTE_TERMS).trim();
  termsPage.drawText("Terms & Conditions", {
    x: margin,
    y: contentTop,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.18, 0.2),
  });
  drawBulletedTerms(
    termsPage,
    terms,
    margin,
    contentTop - 20,
    width - margin * 2,
    font,
    fontBold
  );

  return await pdfDoc.save();
}
