import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { isAustralianPhone } from "@/lib/validation/phone";

const resend = new Resend(process.env.RESEND_API_KEY);

const REQUIRED_FIELDS = ["full_name", "email", "product_category", "product"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    for (const field of REQUIRED_FIELDS) {
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

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("enquiries")
      .insert([
        {
          full_name: String(body.full_name).trim(),
          company_name: body.company_name ? String(body.company_name).trim() : null,
          custom_name: body.custom_name ? String(body.custom_name).trim() : null,
          custom_spec: body.custom_spec ? String(body.custom_spec).trim() : null,
          custom_notes: body.custom_notes ? String(body.custom_notes).trim() : null,
          email: String(body.email).trim(),
          phone: body.phone ? String(body.phone).trim() : null,
          product_category: String(body.product_category).trim(),
          product: String(body.product).trim(),
          quantity:
            body.quantity != null && body.quantity !== ""
              ? Number(body.quantity) || null
              : null,
          ply_preference: body.ply_preference
            ? String(body.ply_preference).trim()
            : null,
          project_details: body.project_details
            ? String(body.project_details).trim()
            : null,
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

    const adminEmail =
      process.env.ADMIN_NOTIFY_EMAIL ||
      "manikantadb963@amglobalpackagingsolutions.com";
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "AM Global <no-reply@amglobalpackagingsolutions.com>";

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [adminEmail],
          subject: "📦 New Enquiry Received",
          html: `
            <h2>New Enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(body.full_name)}</p>
            <p><strong>Company:</strong> ${escapeHtml(body.company_name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
            <p><strong>Phone:</strong> ${body.phone ? escapeHtml(body.phone) : "-"}</p>
            <p><strong>Category:</strong> ${escapeHtml(body.product_category)}</p>
            <p><strong>Product:</strong> ${escapeHtml(body.product)}</p>
            <p><strong>Quantity:</strong> ${body.quantity ?? "-"}</p>
            <p><strong>Ply:</strong> ${body.ply_preference ? escapeHtml(body.ply_preference) : "-"}</p>
            <p><strong>Details:</strong><br/>${body.project_details ? escapeHtml(body.project_details) : "-"}</p>
          `,
        });
      } catch (err) {
        console.error("[enquiries] Resend error (enquiry still saved):", err);
      }
    }

    return NextResponse.json({ success: true, enquiry: data });
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
