"use client";

import { Suspense } from "react";
import OrderEditorForm from "@/components/admin/orders/OrderEditorForm";

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9aa6b0]">Loading...</div>}>
      <OrderEditorForm />
    </Suspense>
  );
}
