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

export async function generateQuotationPdf(data: QuoteData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 40;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText("AM Global Packaging Solutions", {
    x: margin,
    y: height - margin - 10,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.18, 0.2),
  });
  page.drawText("Quotation", {
    x: width - margin - 90,
    y: height - margin - 10,
    size: 14,
    font: fontBold,
    color: rgb(1, 0.48, 0.18),
  });

  // Quote metadata
  const metaY = height - margin - 40;
  page.drawText(`Quote #: ${data.quote_number}`, {
    x: margin,
    y: metaY,
    size: 11,
    font: fontBold,
  });
  page.drawText(`Date: ${new Date(data.created_at).toLocaleDateString("en-AU")}`, {
    x: margin + 220,
    y: metaY,
    size: 11,
    font,
  });
  page.drawText(`Valid Until: ${data.valid_until ?? "-"}`, {
    x: margin + 420,
    y: metaY,
    size: 11,
    font,
  });

  // Customer block
  const customerY = metaY - 30;
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
  const tableTop = customerY - 100;
  const colX = [margin, margin + 210, margin + 330, margin + 390, margin + 460];
  page.drawText("Item", { x: colX[0], y: tableTop, size: 10, font: fontBold });
  page.drawText("Variant", { x: colX[1], y: tableTop, size: 10, font: fontBold });
  page.drawText("Qty", { x: colX[2], y: tableTop, size: 10, font: fontBold });
  page.drawText("Unit", { x: colX[3], y: tableTop, size: 10, font: fontBold });
  page.drawText("Subtotal", { x: colX[4], y: tableTop, size: 10, font: fontBold });

  let rowY = tableTop - 18;
  for (const item of data.items) {
    const itemLabel = item.product_title;
    const variantLabel = item.variant_name;
    page.drawText(itemLabel, { x: colX[0], y: rowY, size: 9, font });
    page.drawText(variantLabel, { x: colX[1], y: rowY, size: 9, font });
    page.drawText(String(item.quantity), { x: colX[2], y: rowY, size: 9, font });
    page.drawText(`$${item.unit_price.toFixed(2)}`, {
      x: colX[3],
      y: rowY,
      size: 9,
      font,
    });
    page.drawText(`$${item.subtotal.toFixed(2)}`, {
      x: colX[4],
      y: rowY,
      size: 9,
      font,
    });
    rowY -= 16;
  }

  // Totals
  const totalsY = rowY - 10;
  page.drawText(`Subtotal`, { x: colX[3], y: totalsY, size: 10, font });
  page.drawText(`$${data.subtotal.toFixed(2)}`, {
    x: colX[4],
    y: totalsY,
    size: 10,
    font: fontBold,
  });
  page.drawText(`GST (${data.gst_percent.toFixed(2)}%)`, {
    x: colX[3],
    y: totalsY - 14,
    size: 10,
    font,
  });
  page.drawText(`$${data.tax.toFixed(2)}`, {
    x: colX[4],
    y: totalsY - 14,
    size: 10,
    font: fontBold,
  });
  page.drawText("Total", { x: colX[3], y: totalsY - 30, size: 11, font: fontBold });
  page.drawText(`$${data.total.toFixed(2)}`, {
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
    page.drawText("Notes:", { x: margin, y: totalsY - 60, size: 10, font: fontBold });
    notesLines.forEach((line, i) => {
      page.drawText(line, {
        x: margin,
        y: totalsY - 74 - i * 12,
        size: 9,
        font,
        color: rgb(0.35, 0.4, 0.45),
      });
    });
  }

  // Terms page
  const termsPage = pdfDoc.addPage([595.28, 841.89]);
  const terms = (data.terms_text?.trim() || DEFAULT_QUOTE_TERMS).trim();
  termsPage.drawText("Terms & Conditions", {
    x: margin,
    y: height - margin - 10,
    size: 14,
    font: fontBold,
  });
  const termsLines = wrapText(terms, width - margin * 2, 9);
  termsLines.forEach((line, i) => {
    termsPage.drawText(line, {
      x: margin,
      y: height - margin - 34 - i * 12,
      size: 9,
      font,
      color: rgb(0.3, 0.34, 0.38),
    });
  });

  // Optional terms image overlay
  try {
    const imgPath = path.join(process.cwd(), "assets", "c__Users_aruka_AppData_Roaming_Cursor_User_workspaceStorage_40ac7b784cb9c6972dc8107c5366d323_images_image-4e8988eb-f60b-4330-a3cf-228509d179e0.png");
    if (fs.existsSync(imgPath)) {
      const imgBytes = fs.readFileSync(imgPath);
      const png = await pdfDoc.embedPng(imgBytes);
      const imgWidth = width - margin * 2;
      const imgHeight = (png.height / png.width) * imgWidth;
      termsPage.drawImage(png, {
        x: margin,
        y: margin,
        width: imgWidth,
        height: imgHeight,
        opacity: 0.15,
      });
    }
  } catch {
    // ignore image errors
  }

  return await pdfDoc.save();
}
