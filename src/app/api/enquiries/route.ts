import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { isAustralianPhone } from "@/lib/validation/phone";

const resend = new Resend(process.env.RESEND_API_KEY);

const REQUIRED_CUSTOMER = ["full_name", "email"] as const;

type EnquiryItemPayload = {
  product_category: string;
  product: string;
  quantity?: number | null;
  ply_preference?: string | null;
  custom_name?: string | null;
  custom_spec?: string | null;
  custom_notes?: string | null;
  product_id?: string | null;
  variant_id?: string | null;
};

function normalizeItem(item: Record<string, unknown>): EnquiryItemPayload {
  const product_category = String(item.product_category ?? "").trim();
  const product = String(item.product ?? "").trim();
  const hasCustom = Boolean(String(item.custom_name ?? "").trim());
  return {
    product_category: product_category || (hasCustom ? "Custom" : ""),
    product: product || (hasCustom ? "Custom" : ""),
    quantity:
      item.quantity != null && item.quantity !== ""
        ? Number(item.quantity) || null
        : null,
    ply_preference: item.ply_preference ? String(item.ply_preference).trim() : null,
    custom_name: item.custom_name ? String(item.custom_name).trim() : null,
    custom_spec: item.custom_spec ? String(item.custom_spec).trim() : null,
    custom_notes: item.custom_notes ? String(item.custom_notes).trim() : null,
    product_id: item.product_id ? String(item.product_id).trim() || null : null,
    variant_id: item.variant_id ? String(item.variant_id).trim() || null : null,
  };
}

function validateItem(item: EnquiryItemPayload): string | null {
  const hasCustom = Boolean(item.custom_name?.trim());
  if (hasCustom) return null;
  if (!item.product_category || !item.product) return "Each product row must have Category and Product (or Custom name).";
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    for (const field of REQUIRED_CUSTOMER) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { error: `${field.replaceAll("_", " ")} is required` },
          { status: 400 }
        );
      }
    }

    if (body.phone && !isAustralianPhone(String(body.phone))) {
      return NextResponse.json({ error: "Invalid Australian phone number" }, { status: 400 });
    }

    const itemsRaw = Array.isArray(body.items) ? body.items : [];
    const hasMultiProduct = itemsRaw.length > 0;

    let items: EnquiryItemPayload[];
    let enquiryPayload: {
      full_name: string;
      company_name: string | null;
      email: string;
      phone: string | null;
      product_category: string;
      product: string;
      quantity: number | null;
      ply_preference: string | null;
      custom_name: string | null;
      custom_spec: string | null;
      custom_notes: string | null;
      project_details: string | null;
    };

    if (hasMultiProduct) {
      items = itemsRaw.map((i) => normalizeItem(i as Record<string, unknown>));
      for (let i = 0; i < items.length; i++) {
        const err = validateItem(items[i]);
        if (err) {
          return NextResponse.json(
            { error: `Product ${i + 1}: ${err}` },
            { status: 400 }
          );
        }
      }
      if (items.every((i) => !i.product_category && !i.product && !i.custom_name)) {
        return NextResponse.json(
          { error: "At least one product row must have Category and Product (or Custom name)." },
          { status: 400 }
        );
      }
      const first = items[0];
      enquiryPayload = {
        full_name: String(body.full_name).trim(),
        company_name: body.company_name ? String(body.company_name).trim() : null,
        email: String(body.email).trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        product_category: first.product_category || "—",
        product: first.product || "—",
        quantity: first.quantity ?? null,
        ply_preference: first.ply_preference ?? null,
        custom_name: first.custom_name ?? null,
        custom_spec: first.custom_spec ?? null,
        custom_notes: first.custom_notes ?? null,
        project_details: body.project_details ? String(body.project_details).trim() : null,
      };
    } else {
      const product_category = String(body.product_category ?? "").trim();
      const product = String(body.product ?? "").trim();
      if (!product_category || !product) {
        return NextResponse.json(
          { error: "Product category and product are required" },
          { status: 400 }
        );
      }
      const single: EnquiryItemPayload = normalizeItem({
        product_category: body.product_category,
        product: body.product,
        quantity: body.quantity,
        ply_preference: body.ply_preference,
        custom_name: body.custom_name,
        custom_spec: body.custom_spec,
        custom_notes: body.custom_notes,
      });
      items = [single];
      enquiryPayload = {
        full_name: String(body.full_name).trim(),
        company_name: body.company_name ? String(body.company_name).trim() : null,
        email: String(body.email).trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        product_category: single.product_category || "—",
        product: single.product || "—",
        quantity: single.quantity ?? null,
        ply_preference: single.ply_preference ?? null,
        custom_name: single.custom_name ?? null,
        custom_spec: single.custom_spec ?? null,
        custom_notes: single.custom_notes ?? null,
        project_details: body.project_details ? String(body.project_details).trim() : null,
      };
    }

    const supabase = createAdminClient();

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .insert([
        {
          full_name: enquiryPayload.full_name,
          company_name: enquiryPayload.company_name,
          email: enquiryPayload.email,
          phone: enquiryPayload.phone,
          product_category: enquiryPayload.product_category,
          product: enquiryPayload.product,
          quantity: enquiryPayload.quantity,
          ply_preference: enquiryPayload.ply_preference,
          custom_name: enquiryPayload.custom_name,
          custom_spec: enquiryPayload.custom_spec,
          custom_notes: enquiryPayload.custom_notes,
          project_details: enquiryPayload.project_details,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[enquiries] DB insert error:", error);
      return NextResponse.json(
        { error: "Failed to save enquiry. Please try again." },
        { status: 500 }
      );
    }

    const enquiryItemsRows = items.map((item) => ({
      enquiry_id: enquiry.id,
      product_category: item.product_category || "—",
      product: item.product || "—",
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      quantity: item.quantity ?? 1,
      ply_preference: item.ply_preference ?? null,
      custom_name: item.custom_name ?? null,
      custom_spec: item.custom_spec ?? null,
      custom_notes: item.custom_notes ?? null,
    }));

    const { error: itemsError } = await supabase.from("enquiry_items").insert(enquiryItemsRows);
    if (itemsError) {
      console.error("[enquiries] enquiry_items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to save enquiry items. Please try again." },
        { status: 500 }
      );
    }

    const adminEmail =
      process.env.ADMIN_NOTIFY_EMAIL ||
      "manikantadb963@amglobalpackagingsolutions.com";
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "AM Global <no-reply@amglobalpackagingsolutions.com>";

    if (process.env.RESEND_API_KEY) {
      try {
        const itemsList = items
          .map(
            (item, i) =>
              `<li>${escapeHtml(item.product_category)} / ${escapeHtml(item.product)} — Qty: ${item.quantity ?? "—"} ${item.ply_preference ? `(${escapeHtml(item.ply_preference)})` : ""}</li>`
          )
          .join("");
        await resend.emails.send({
          from: fromEmail,
          to: [adminEmail],
          subject: "📦 New Enquiry Received",
          html: `
            <h2>New Enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(enquiryPayload.full_name)}</p>
            <p><strong>Company:</strong> ${escapeHtml(enquiryPayload.company_name ?? "")}</p>
            <p><strong>Email:</strong> ${escapeHtml(enquiryPayload.email)}</p>
            <p><strong>Phone:</strong> ${enquiryPayload.phone ? escapeHtml(enquiryPayload.phone) : "-"}</p>
            <h3>Products (${items.length})</h3>
            <ul>${itemsList}</ul>
            <p><strong>Details:</strong><br/>${enquiryPayload.project_details ? escapeHtml(enquiryPayload.project_details) : "-"}</p>
          `,
        });
      } catch (err) {
        console.error("[enquiries] Resend error (enquiry still saved):", err);
      }
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (e) {
    console.error("[enquiries] Error:", e);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
