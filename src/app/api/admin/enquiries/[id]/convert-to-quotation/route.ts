import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Confirm enquiry and create a draft quotation with customer + all enquiry items.
 * Idempotent: if enquiry already converted, returns existing quotation id.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enquiryId } = await params;
    const supabase = createAdminClient();

    const { data: enquiry, error: fetchErr } = await supabase
      .from("enquiries")
      .select("*, enquiry_items(*)")
      .eq("id", enquiryId)
      .single();

    if (fetchErr || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (enquiry.converted_to_quotation_id) {
      return NextResponse.json(
        { quotation_id: enquiry.converted_to_quotation_id, already_converted: true },
        { status: 200 }
      );
    }

    const items = Array.isArray(enquiry.enquiry_items) ? enquiry.enquiry_items : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: "Enquiry has no products. Add at least one item before converting." },
        { status: 400 }
      );
    }

    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", enquiry.email)
      .limit(1)
      .maybeSingle();

    if (existingCustomer?.id) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({
          name: enquiry.full_name,
          company: enquiry.company_name ?? undefined,
          phone: enquiry.phone ?? null,
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: enquiry.full_name,
          email: enquiry.email,
          phone: enquiry.phone ?? null,
          company: enquiry.company_name ?? null,
          address: null,
        })
        .select("id")
        .single();
      if (custErr) {
        console.error("[convert-to-quotation] customer insert:", custErr);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    const { data: quote, error: quoteErr } = await supabase
      .from("quotations")
      .insert({
        customer_id: customerId,
        status: "draft",
        source_enquiry_id: enquiryId,
        notes: enquiry.project_details ?? null,
      })
      .select("id")
      .single();

    if (quoteErr || !quote) {
      console.error("[convert-to-quotation] quotation insert:", quoteErr);
      return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
    }

    const quotationItems = items.map((item: Record<string, unknown>) => {
      const product_id = item.product_id ?? null;
      const variant_id = item.variant_id ?? null;
      const quantity = Number(item.quantity) || 1;
      const unit_price = 0;
      return {
        quotation_id: quote.id,
        product_id,
        variant_id,
        custom_name: (item.custom_name as string) ?? null,
        custom_spec: (item.custom_spec as string) ?? null,
        custom_notes: (item.custom_notes as string) ?? null,
        description: null,
        quantity,
        unit_price,
        subtotal: quantity * unit_price,
      };
    });

    const { error: itemsErr } = await supabase
      .from("quotation_items")
      .insert(quotationItems);

    if (itemsErr) {
      console.error("[convert-to-quotation] quotation_items insert:", itemsErr);
      await supabase.from("quotations").delete().eq("id", quote.id);
      return NextResponse.json({ error: "Failed to create quotation items" }, { status: 500 });
    }

    const { error: updateErr } = await supabase
      .from("enquiries")
      .update({
        status: "successful",
        converted_to_quotation_id: quote.id,
      })
      .eq("id", enquiryId);

    if (updateErr) {
      console.error("[convert-to-quotation] enquiry update:", updateErr);
    }

    return NextResponse.json({ quotation_id: quote.id, already_converted: false });
  } catch (e) {
    console.error("[admin/enquiries/[id]/convert-to-quotation] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
