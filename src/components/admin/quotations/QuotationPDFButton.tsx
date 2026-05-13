"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface QuotationPDFButtonProps {
  quoteId: string;
  className?: string;
}

export default function QuotationPDFButton({
  quoteId,
  className,
}: Readonly<QuotationPDFButtonProps>) {
  return (
    <button
      type="button"
      onClick={() => window.open(`/api/admin/quotations/${quoteId}/pdf`, "_blank")}
      className={className ?? "admin-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg"}
    >
      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
      PDF
    </button>
  );
}
