import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const body = await req.json().catch(() => ({}));
    const isPrimary = body.is_primary === true;

    const supabase = createAdminClient();
    if (isPrimary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", id);
    }
    const { data, error } = await supabase
      .from("product_images")
      .update({ is_primary: isPrimary })
      .eq("id", imageId)
      .eq("product_id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/products/:id/images/:imageId] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("id", imageId)
      .eq("product_id", id)
      .single();
    if (row?.storage_path) {
      await supabase.storage.from("product-images").remove([row.storage_path]);
    }
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/products/:id/images/:imageId] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
