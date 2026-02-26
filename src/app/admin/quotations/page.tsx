"use client";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import QuotationList from "@/components/admin/quotations/QuotationList";

export default function AdminQuotationsPage() {
  return (
    <div className="w-full max-w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#2b2f33] tracking-tight">
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
