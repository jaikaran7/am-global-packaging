import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/products/import-csv
 * Body: multipart form with "file" (CSV) or raw text/csv.
 * CSV columns: title, slug, sku, category_slug, short_description, price, moq, active
 * Optional: description, length_mm, width_mm, height_mm, gsm, ply
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let text: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: "No file" }, { status: 400 });
      }
      text = await file.text();
    } else {
      text = await req.text();
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have header + at least one row" }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const titleIdx = headers.indexOf("title");
    if (titleIdx < 0) {
      return NextResponse.json({ error: "CSV must include a 'title' column" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: categories } = await supabase.from("categories").select("id, slug");
    const slugToId = Object.fromEntries((categories ?? []).map((c) => [c.slug, c.id]));

    let created = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const title = values[titleIdx]?.trim();
      if (!title) continue;

      const slug = getCol(headers, values, "slug")?.trim() || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const categorySlug = getCol(headers, values, "category_slug")?.trim();
      const category_id = categorySlug ? slugToId[categorySlug] ?? null : null;
      const price = Number(getCol(headers, values, "price")) || 0;
      const moq = Number(getCol(headers, values, "moq")) || 1;
      const active = (getCol(headers, values, "active") ?? "true").toLowerCase() !== "false";

      const dimensions = (() => {
        const l = Number(getCol(headers, values, "length_mm"));
        const w = Number(getCol(headers, values, "width_mm"));
        const h = Number(getCol(headers, values, "height_mm"));
        if (Number.isNaN(l) && Number.isNaN(w) && Number.isNaN(h)) return null;
        return { length_mm: l || undefined, width_mm: w || undefined, height_mm: h || undefined };
      })();

      const gsm = Number(getCol(headers, values, "gsm")) || null;
      const ply = Number(getCol(headers, values, "ply")) || null;

      const { error } = await supabase.from("products").insert([{
        title,
        slug,
        sku: getCol(headers, values, "sku") || null,
        category_id,
        short_description: getCol(headers, values, "short_description") || null,
        description: getCol(headers, values, "description") || null,
        price,
        moq,
        active,
        dimensions,
        gsm: Number.isNaN(gsm) ? null : gsm,
        ply: Number.isNaN(ply) ? null : ply,
      }]);

      if (error) errors.push(`Row ${i + 1}: ${error.message}`);
      else created++;
    }

    return NextResponse.json({ created, errors });
  } catch (e) {
    console.error("[admin/products/import-csv] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function getCol(headers: string[], values: string[], name: string): string | undefined {
  const idx = headers.indexOf(name.toLowerCase());
  return idx >= 0 ? values[idx] : undefined;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}
