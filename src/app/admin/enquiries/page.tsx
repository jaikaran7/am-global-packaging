import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EnquiriesTable from "./EnquiriesTable";

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">
        Enquiries
      </h1>
      <EnquiriesTable />
    </div>
  );
}
