import EnquiriesTable from "./EnquiriesTable";

/** Auth + session refresh run in `middleware.ts`; avoid a second `getUser()` here (same-request refresh races). */
export default async function AdminEnquiriesPage() {
  return (
    <div className="w-full max-w-full space-y-4">
      <h1 className="text-xl font-semibold text-[#2b2f33] tracking-tight">
        Enquiries
      </h1>
      <EnquiriesTable />
    </div>
  );
}

