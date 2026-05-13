import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  product_line: z.enum(["boxes", "papers"]).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productLine = searchParams.get("product_line");

    const supabase = createAdminClient();
    let query = supabase
      .from("categories")
      .select("id, name, slug, description, product_line")
      .order("name");

    if (productLine === "boxes" || productLine === "papers") {
      query = query.eq("product_line", productLine);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[admin/categories] list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("[admin/categories] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const line = parsed.data.product_line ?? "boxes";
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description ?? null,
          product_line: line,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[admin/categories] create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/categories] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
