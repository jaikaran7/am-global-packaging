import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerSchema } from "@/lib/schemas/order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));

    const supabase = createAdminClient();
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search?.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,company.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("[admin/customers] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("customers")
      .insert([{
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        address: parsed.data.address || null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/customers] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
