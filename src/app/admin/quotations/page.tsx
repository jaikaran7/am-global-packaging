"use client";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import QuotationList from "@/components/admin/quotations/QuotationList";

export default function AdminQuotationsPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">
          Quotations Management
        </h1>
        <Link
          href="/admin/quotations/new"
          className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
        >
          <PlusIcon className="w-5 h-5" /> New Quote
        </Link>
      </div>

      <QuotationList />
    </div>
  );
}
