"use client";

import { Suspense } from "react";
import QuotationEditorForm from "@/components/admin/quotations/QuotationEditorForm";

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9aa6b0]">Loading...</div>}>
      <QuotationEditorForm />
    </Suspense>
  );
}
