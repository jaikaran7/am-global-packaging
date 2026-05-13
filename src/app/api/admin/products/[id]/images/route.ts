import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isPrimary = formData.get("is_primary") === "true";
    const alt = (formData.get("alt") as string) || null;
    const variantId = (formData.get("variant_id") as string) || null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const storagePath = variantId
      ? `${productId}/variants/${variantId}/${Date.now()}-${file.name.replaceAll(/[^a-zA-Z0-9.-]/g, "_")}`
      : `${productId}/${Date.now()}-${file.name.replaceAll(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[admin/products/images] upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    if (isPrimary) {
      const filter = variantId
        ? supabase.from("product_images").update({ is_primary: false }).eq("variant_id", variantId)
        : supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId).is("variant_id", null);
      await filter;
    }

    const { data: row, error: insertError } = await supabase
      .from("product_images")
      .insert([{
        product_id: productId,
        variant_id: variantId,
        storage_path: storagePath,
        url,
        alt,
        is_primary: isPrimary,
      }])
      .select()
      .single();

    if (insertError) {
      console.error("[admin/products/images] insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(row);
  } catch (e) {
    console.error("[admin/products/:id/images] POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
