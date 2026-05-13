import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeCompanySettings, type CompanySettingsRow } from "@/lib/company-settings-env";
import { z } from "zod";

const patchSchema = z.object({
  company_name: z.string().min(1).optional(),
  legal_name: z.string().optional().nullable(),
  abn: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  bsb: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  address_line: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gst_note: z.string().optional().nullable(),
  currency_default: z.string().optional(),
  gst_percent_default: z.number().min(0).max(100).optional(),
  invoice_terms_default: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[company-settings] GET", error);
      return NextResponse.json(mergeCompanySettings(null));
    }

    return NextResponse.json(mergeCompanySettings(data as Partial<CompanySettingsRow> | null));
  } catch (e) {
    console.error("[company-settings] GET error", e);
    return NextResponse.json(mergeCompanySettings(null));
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates = { ...parsed.data, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("company_settings")
      .update(updates)
      .eq("id", "00000000-0000-4000-8000-000000000001")
      .select()
      .single();

    if (error) {
      console.error("[company-settings] PATCH", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mergeCompanySettings(data as Partial<CompanySettingsRow>));
  } catch (e) {
    console.error("[company-settings] PATCH error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
