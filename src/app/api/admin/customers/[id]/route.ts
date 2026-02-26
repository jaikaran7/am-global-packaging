import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerSchema } from "@/lib/schemas/order";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("customers")
      .update({
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        address: parsed.data.address || null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/customers/[id]] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

