"use client";

import type { ReactNode } from "react";

type OrderSummaryCardProps = {
  productTitle: string;
  variantSummary: string;
  imageSrc: string;
  imageAlt: string;
  quantityUi: ReactNode;
  optionUi?: ReactNode;
  unitLabel: string;
  unitValue: string;
  subtotalValue: string;
  gstLabel: string;
  gstValue: string;
  totalValue: string;
  cta: ReactNode;
};

export default function OrderSummaryCard({
  productTitle,
  variantSummary,
  imageSrc,
  imageAlt,
  quantityUi,
  optionUi,
  unitLabel,
  unitValue,
  subtotalValue,
  gstLabel,
  gstValue,
  totalValue,
  cta,
}: Readonly<OrderSummaryCardProps>) {
  return (
    <aside className="rounded-2xl border border-kraft/12 bg-white p-5 md:p-6 shadow-sm shadow-kraft/10">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-kraft mb-4">Order Summary</p>
      <div className="flex items-start gap-3 pb-4 border-b border-kraft/10">
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gradient-to-br from-kraft-pale/60 to-cream/40 ring-1 ring-kraft/10 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={imageAlt} className="w-full h-full object-contain p-2" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal leading-snug">{productTitle}</p>
          <p className="mt-1 text-xs text-warm-gray line-clamp-3">{variantSummary}</p>
        </div>
      </div>

      {optionUi && <div className="pt-4">{optionUi}</div>}

      <div className="pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-warm-gray mb-2">Quantity</p>
        {quantityUi}
      </div>

      <dl className="pt-5 mt-5 border-t border-kraft/10 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-warm-gray">{unitLabel}</dt>
          <dd className="font-semibold text-charcoal">{unitValue}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-warm-gray">Subtotal</dt>
          <dd className="font-semibold text-charcoal">{subtotalValue}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-warm-gray">{gstLabel}</dt>
          <dd className="font-semibold text-charcoal">{gstValue}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-kraft/10">
          <dt className="font-semibold text-charcoal">Estimated Total</dt>
          <dd className="text-lg font-bold text-forest">{totalValue}</dd>
        </div>
      </dl>

      <div className="pt-5">{cta}</div>
    </aside>
  );
}
