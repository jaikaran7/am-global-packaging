import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { quotationSchema } from "@/lib/schemas/quotation";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customer = searchParams.get("customer");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let baseQuery = supabase
      .from("quotations")
      .select("*, customer:customers(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") baseQuery = baseQuery.eq("status", status);
    if (customer) baseQuery = baseQuery.eq("customer_id", customer);
    if (dateFrom) baseQuery = baseQuery.gte("created_at", dateFrom);
    if (dateTo) baseQuery = baseQuery.lte("created_at", `${dateTo}T23:59:59`);

    const { data: quotes, error, count } = await baseQuery.range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = quotes ?? [];

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((qte) => {
        const customerName = qte.customer?.name?.toLowerCase() ?? "";
        const customerEmail = qte.customer?.email?.toLowerCase() ?? "";
        const quoteNo = qte.quote_number?.toLowerCase() ?? "";
        return quoteNo.includes(q) || customerName.includes(q) || customerEmail.includes(q);
      });
    }

    return NextResponse.json({ items, total: count ?? items.length, page, limit });
  } catch (e) {
    console.error("[admin/quotations] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = quotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    let customerId = parsed.data.customer_id;

    if (!customerId && parsed.data.new_customer) {
      const { data: newCust, error: custErr } = await supabase
        .from("customers")
        .insert([
          {
            name: parsed.data.new_customer.name,
            email: parsed.data.new_customer.email || null,
            phone: parsed.data.new_customer.phone || null,
            company: parsed.data.new_customer.company || null,
            address: parsed.data.new_customer.address || null,
          },
        ])
        .select()
        .single();
      if (custErr) {
        return NextResponse.json({ error: custErr.message }, { status: 500 });
      }
      customerId = newCust.id;
    }

    const gstPercent = parsed.data.gst_percent ?? 10;
    const termsText = parsed.data.terms_text?.trim() || DEFAULT_QUOTE_TERMS;

    const { data: quote, error: quoteErr } = await supabase
      .from("quotations")
      .insert([
        {
          customer_id: customerId || null,
          status: "draft",
          notes: parsed.data.notes || null,
          valid_until: parsed.data.valid_until || null,
          gst_percent: gstPercent,
          terms_text: termsText,
        },
      ])
      .select()
      .single();

    if (quoteErr) {
      return NextResponse.json({ error: quoteErr.message }, { status: 500 });
    }

    const itemsToInsert = parsed.data.items.map((item) => {
      const hasCustom = item.product_id === "custom" || Boolean(item.custom_name?.trim());
      return {
        quotation_id: quote.id,
        product_id: hasCustom ? null : item.product_id,
        variant_id: hasCustom ? null : item.variant_id,
        custom_name: item.custom_name || null,
        custom_spec: item.custom_spec || null,
        custom_notes: item.custom_notes || null,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      };
    });

    const { error: itemsErr } = await supabase
      .from("quotation_items")
      .insert(itemsToInsert);

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    const { data: fullQuote } = await supabase
      .from("quotations")
      .select("*, customer:customers(*)")
      .eq("id", quote.id)
      .single();

    return NextResponse.json(fullQuote);
  } catch (e) {
    console.error("[admin/quotations] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
