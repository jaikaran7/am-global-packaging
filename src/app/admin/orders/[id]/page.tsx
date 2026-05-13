"use client";

import { Suspense, use } from "react";
import OrderEditorForm from "@/components/admin/orders/OrderEditorForm";

export default function EditOrderPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9aa6b0]">Loading order...</div>}>
      <OrderEditorForm orderId={id} />
    </Suspense>
  );
}
