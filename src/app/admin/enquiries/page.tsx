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
    <div className="w-full max-w-full space-y-4">
      <h1 className="text-xl font-semibold text-[#2b2f33] tracking-tight">
        Enquiries
      </h1>
      <EnquiriesTable />
    </div>
  );
}
