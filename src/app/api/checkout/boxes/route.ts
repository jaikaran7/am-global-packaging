import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductBySlug } from "@/data/products";
import { boxesCheckoutRequestSchema } from "@/lib/checkout/schemas/boxes-checkout";
import { estimateBoxesTotals, estimateBoxesUnitPriceAud } from "@/lib/checkout/boxes-pricing";
import { generateEnquiryReference } from "@/lib/checkout/enquiry-reference";
import { isValidCheckoutPhone } from "@/lib/checkout/checkout-phone";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = boxesCheckoutRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { product: pIn, customer } = parsed.data;
    const product = getProductBySlug(pIn.slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.plyOptions.includes(pIn.ply)) {
      return NextResponse.json({ error: "Invalid ply for this product" }, { status: 400 });
    }

    if (!isValidCheckoutPhone(customer.phone, customer.country)) {
      return NextResponse.json(
        { error: "Invalid phone number for the selected country" },
        { status: 400 }
      );
    }

    const moqMatch = product.moq.match(/\d+/);
    const moq = moqMatch ? Number(moqMatch[0]) : 1;
    const qty = Math.max(moq, customer.quantity_requirement, pIn.quantity);

    const unitPriceAud = estimateBoxesUnitPriceAud(product, qty);
    const totals = estimateBoxesTotals(unitPriceAud, qty);

    const reference_number = generateEnquiryReference();
    const variantSummary = `${pIn.ply} · ${product.gsmRange} · ${product.dimensions}`;
    const deliverySummary = `${customer.delivery_address}, ${customer.city} ${customer.state_region} ${customer.postal_code}`;

    const checkout_metadata = {
      source: "boxes_checkout_v1",
      product_slug: product.slug,
      ply: pIn.ply,
      catalogue_unit_price_aud: unitPriceAud,
      quantity_requested: customer.quantity_requirement,
      quantity_line: qty,
      totals,
      pricing_note: "Indicative catalogue estimate — final quote may differ.",
    };

    const project_details = [
      `Checkout inquiry — ${reference_number}`,
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

    const supabase = createAdminClient();

    const insertRow: Record<string, unknown> = {
      full_name: customer.full_name.trim(),
      company_name: customer.company_name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone.trim(),
      product_category: product.categoryLabel,
      product: product.name,
      quantity: qty,
      ply_preference: pIn.ply,
      project_details,
      custom_notes,
      notes: JSON.stringify(checkout_metadata),
      product_line: "boxes",
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
        console.error("[checkout/boxes] DB schema may need migration 20260510120000_enquiries_checkout_fields.sql:", error.message);
      } else {
        console.error("[checkout/boxes] enquiries insert:", error);
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
            product_line: "boxes",
          },
        ])
        .select()
        .single();

      if (fallbackWithoutCheckoutCols.error) {
        console.error("[checkout/boxes] fallback insert:", fallbackWithoutCheckoutCols.error);
        return NextResponse.json({ error: "Failed to save inquiry. Try again shortly." }, { status: 500 });
      }

      const enq = fallbackWithoutCheckoutCols.data;
      const itemRow = {
        enquiry_id: enq.id,
        product_category: product.categoryLabel,
        product: product.name,
        product_id: null,
        variant_id: null,
        quantity: qty,
        ply_preference: pIn.ply,
        custom_spec: JSON.stringify({
          gsm_range: product.gsmRange,
          dimensions: product.dimensions,
          indicative_unit_aud: unitPriceAud,
          ...totals,
        }),
        custom_notes: insertRow.custom_notes,
      };

      const { error: itemErr } = await supabase.from("enquiry_items").insert([itemRow]);
      if (itemErr) console.error("[checkout/boxes] enquiry_items:", itemErr);

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
      product_category: product.categoryLabel,
      product: product.name,
      product_id: null,
      variant_id: null,
      quantity: qty,
      ply_preference: pIn.ply,
      custom_spec: JSON.stringify({
        gsm_range: product.gsmRange,
        dimensions: product.dimensions,
        indicative_unit_aud: unitPriceAud,
        ...totals,
      }),
      custom_notes: insertRow.custom_notes,
    };

    const { error: itemErr } = await supabase.from("enquiry_items").insert([itemRow]);
    if (itemErr) {
      console.error("[checkout/boxes] enquiry_items insert:", itemErr);
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
    console.error("[checkout/boxes]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
