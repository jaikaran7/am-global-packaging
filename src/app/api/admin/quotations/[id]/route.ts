import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { quotationSchema } from "@/lib/schemas/quotation";
import { DEFAULT_QUOTE_TERMS } from "@/lib/quotation-terms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const [quoteRes, itemsRes] = await Promise.all([
      supabase
        .from("quotations")
        .select("*, customer:customers(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .single(),
      supabase
        .from("quotation_items")
        .select(
          "*, product:products(id,title,slug), variant:product_variants(id,name,sku,price,stock,reserved_stock)"
        )
        .eq("quotation_id", id),
    ]);

    if (quoteRes.error) {
      return NextResponse.json({ error: quoteRes.error.message }, { status: 404 });
    }

    return NextResponse.json({
      ...quoteRes.data,
      items: itemsRes.data ?? [],
    });
  } catch (e) {
    console.error("[admin/quotations/[id]] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("quotations")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    if (["accepted", "rejected", "expired", "revised", "locked", "cancelled"].includes(existing.status)) {
      return NextResponse.json({ error: "Quotation cannot be edited" }, { status: 400 });
    }

    // Normalize payload: custom line items may come with product_id/variant_id "" from frontend; coerce to "custom"
    const raw = body as Record<string, unknown>;
    if (Array.isArray(raw.items)) {
      raw.items = raw.items.map((item: Record<string, unknown>) => {
        const hasCustomName = Boolean(typeof item.custom_name === "string" && item.custom_name.trim());
        const emptyProduct = item.product_id === "" || item.product_id == null;
        if (hasCustomName && emptyProduct) {
          return { ...item, product_id: "custom", variant_id: "custom" };
        }
        return item;
      });
    }

    const parsed = quotationSchema.partial().safeParse(raw);
    if (!parsed.success) {
      const err = parsed.error.flatten();

      const message =
        typeof err.formErrors?.[0] === "string"
          ? err.formErrors[0]
          : (Object.values(err.fieldErrors ?? {}).flat().find(Boolean) as string | undefined) ??
            "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let customerId = parsed.data?.customer_id;
    if (!customerId && parsed.data?.new_customer) {
      const { data: cust } = await supabase
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
      customerId = cust?.id;
    }

    const updates: Record<string, unknown> = {};
    if (customerId !== undefined) updates.customer_id = customerId || null;
    if (parsed.data?.notes !== undefined) updates.notes = parsed.data.notes || null;
    if (parsed.data?.valid_until !== undefined)
      updates.valid_until = parsed.data.valid_until || null;
    if (parsed.data?.gst_percent !== undefined)
      updates.gst_percent = parsed.data.gst_percent ?? 10;
    if (parsed.data?.terms_text !== undefined)
      updates.terms_text = parsed.data.terms_text?.trim() || DEFAULT_QUOTE_TERMS;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("quotations").update(updates).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (parsed.data?.items) {
      await supabase.from("quotation_items").delete().eq("quotation_id", id);
      const newItems = parsed.data.items.map((item) => {
        const hasCustom = item.product_id === "custom" || Boolean(item.custom_name?.trim());
        return {
          quotation_id: id,
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
        .insert(newItems);
      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
      }
    }

    // For updates we don't need to re-fetch the full quotation; return a lightweight success payload.
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/quotations/[id]] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("quotations")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Only draft quotes can be deleted" }, { status: 400 });
    }

    // Soft delete: set deleted_at instead of hard delete
    const { error } = await supabase
      .from("quotations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/quotations/[id]] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
