"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { EnquiryStatus } from "@/lib/enquiry-status";

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[enquiries] update error:", error);
    return { error: error.message };
  }
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { error: null };
}
