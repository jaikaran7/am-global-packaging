"use client";

import { Suspense, use } from "react";
import QuotationEditorForm from "@/components/admin/quotations/QuotationEditorForm";

export default function EditQuotationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9aa6b0]">Loading quote...</div>}>
      <QuotationEditorForm quoteId={id} />
    </Suspense>
  );
}
