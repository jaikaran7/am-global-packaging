import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { papersCheckoutRequestSchema } from "@/lib/checkout/schemas/papers-checkout";
import { estimatePapersTotals } from "@/lib/checkout/papers-pricing";
import { generateEnquiryReference } from "@/lib/checkout/enquiry-reference";
import { isValidCheckoutPhone } from "@/lib/checkout/checkout-phone";
import { audFromStoredVariant } from "@/lib/currency-usd-aud";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = papersCheckoutRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { product: pIn, customer } = parsed.data;

    if (!isValidCheckoutPhone(customer.phone, customer.country)) {
      return NextResponse.json(
        { error: "Invalid phone number for the selected country" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, title, slug, category_id, product_line, active")
      .eq("slug", pIn.slug.trim())
      .eq("product_line", "papers")
      .eq("active", true)
      .single();

    if (productErr || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { data: variant, error: variantErr } = await supabase
      .from("product_variants")
      .select(
        "id, product_id, name, sku, price, currency, tax_rate_percent, stock, is_available, min_order_quantity, moq, gsm, size_label, unit_label"
      )
      .eq("id", pIn.variant_id)
      .eq("product_id", product.id)
      .single();

    if (variantErr || !variant) {
      return NextResponse.json({ error: "Variant not found for this product" }, { status: 404 });
    }

    if (!variant.is_available) {
      return NextResponse.json({ error: "This variant is not available for order" }, { status: 400 });
    }

    const stock = variant.stock ?? 0;
    if (stock <= 0) {
      return NextResponse.json({ error: "This variant is out of stock" }, { status: 400 });
    }

    const moq = Math.max(1, variant.min_order_quantity ?? variant.moq ?? 1);
    const qty = Math.max(moq, customer.quantity_requirement, pIn.quantity);

    if (qty > stock) {
      return NextResponse.json(
        { error: `Quantity exceeds available stock (${stock} units).` },
        { status: 400 }
      );
    }

    const unitPriceAud = Math.round(audFromStoredVariant(Number(variant.price), variant.currency) * 100) / 100;
    const gstPct = variant.tax_rate_percent != null ? Number(variant.tax_rate_percent) : 10;
    const totals = estimatePapersTotals(unitPriceAud, qty, gstPct);

    const { data: categoryRow } = await supabase
      .from("categories")
      .select("name")
      .eq("id", product.category_id ?? "")
      .maybeSingle();

    const productCategory = categoryRow?.name?.trim() || "Papers";

    const reference_number = generateEnquiryReference();
    const variantSummary = [
      variant.name,
      variant.gsm != null ? `${variant.gsm} GSM` : null,
      variant.size_label,
      variant.unit_label ? `per ${variant.unit_label}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const deliverySummary = `${customer.delivery_address}, ${customer.city} ${customer.state_region} ${customer.postal_code}`;

    const checkout_metadata = {
      source: "papers_checkout_v1",
      product_slug: product.slug,
      variant_id: variant.id,
      variant_sku: variant.sku,
      catalogue_unit_price_ex_gst_aud: unitPriceAud,
      quantity_requested: customer.quantity_requirement,
      quantity_line: qty,
      totals,
      pricing_note: "Indicative catalogue estimate — final quote may differ.",
    };

    const project_details = [
      `Papers checkout inquiry — ${reference_number}`,
      `Delivery: ${deliverySummary}, ${customer.country}`,
      customer.tax_id ? `Tax ID: ${customer.tax_id}` : null,
      customer.preferred_contact_method
        ? `Preferred contact: ${customer.preferred_contact_method}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const custom_notes = [
      customer.custom_notes?.trim() || null,
      `Variant: ${variantSummary}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const insertRow: Record<string, unknown> = {
      full_name: customer.full_name.trim(),
      company_name: customer.company_name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone.trim(),
      product_category: productCategory,
      product: product.title.trim(),
      quantity: qty,
      ply_preference: variant.name?.trim() || null,
      project_details,
      custom_notes,
      notes: JSON.stringify(checkout_metadata),
      product_line: "papers",
      reference_number,
      country: customer.country.trim(),
      delivery_address: customer.delivery_address.trim(),
      city: customer.city.trim(),
      state_region: customer.state_region.trim(),
      postal_code: customer.postal_code.trim(),
      tax_id: customer.tax_id?.trim() || null,
      preferred_contact_method: customer.preferred_contact_method ?? "either",
      checkout_metadata,
    };

    const { data: enquiry, error } = await supabase.from("enquiries").insert([insertRow]).select().single();

    if (error) {
      if (error.message?.includes("reference_number") || error.code === "42703") {
        console.error(
          "[checkout/papers] DB schema may need migration 20260510120000_enquiries_checkout_fields.sql:",
          error.message
        );
      } else {
        console.error("[checkout/papers] enquiries insert:", error);
      }

      const fallbackWithoutCheckoutCols = await supabase
        .from("enquiries")
        .insert([
          {
            full_name: insertRow.full_name,
            company_name: insertRow.company_name,
            email: insertRow.email,
            phone: insertRow.phone,
            product_category: insertRow.product_category,
            product: insertRow.product,
            quantity: insertRow.quantity,
            ply_preference: insertRow.ply_preference,
            project_details: `${project_details}\n\ncheckout_metadata:${JSON.stringify(checkout_metadata)}`,
            custom_notes: insertRow.custom_notes,
            notes: insertRow.notes,
            product_line: "papers",
          },
        ])
        .select()
        .single();

      if (fallbackWithoutCheckoutCols.error) {
        console.error("[checkout/papers] fallback insert:", fallbackWithoutCheckoutCols.error);
        return NextResponse.json({ error: "Failed to save inquiry. Try again shortly." }, { status: 500 });
      }

      const enq = fallbackWithoutCheckoutCols.data;
      const itemRow = {
        enquiry_id: enq.id,
        product_category: productCategory,
        product: product.title.trim(),
        product_id: product.id,
        variant_id: variant.id,
        quantity: qty,
        ply_preference: variant.name?.trim() || null,
        custom_spec: JSON.stringify({
          unit_ex_gst_aud: unitPriceAud,
          gst_percent: gstPct,
          ...totals,
        }),
        custom_notes: insertRow.custom_notes,
      };

      const { error: itemErr } = await supabase.from("enquiry_items").insert([itemRow]);
      if (itemErr) console.error("[checkout/papers] enquiry_items:", itemErr);

      return NextResponse.json({
        success: true,
        enquiry: enq,
        reference_number: undefined,
        reference_fallback: reference_number,
        totals,
        variant_summary: variantSummary,
      });
    }

    const itemRow = {
      enquiry_id: enquiry.id,
      product_category: productCategory,
      product: product.title.trim(),
      product_id: product.id,
      variant_id: variant.id,
      quantity: qty,
      ply_preference: variant.name?.trim() || null,
      custom_spec: JSON.stringify({
        unit_ex_gst_aud: unitPriceAud,
        gst_percent: gstPct,
        ...totals,
      }),
      custom_notes: insertRow.custom_notes,
    };

    const { error: itemErr } = await supabase.from("enquiry_items").insert([itemRow]);
    if (itemErr) {
      console.error("[checkout/papers] enquiry_items insert:", itemErr);
      return NextResponse.json({ error: "Saved inquiry but failed to attach line details." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enquiry,
      reference_number,
      totals,
      variant_summary: variantSummary,
      created_at: enquiry.created_at,
    });
  } catch (e) {
    console.error("[checkout/papers]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
