"use client";

import type { ReactNode } from "react";

type CheckoutLayoutProps = {
  backLink?: ReactNode;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  mobileStickyBar?: ReactNode;
};

export default function CheckoutLayout({
  backLink,
  leftColumn,
  rightColumn,
  mobileStickyBar,
}: Readonly<CheckoutLayoutProps>) {
  return (
    <div className="bg-offwhite min-h-[80vh] pb-24 md:pb-0">
      <div className="border-b border-kraft/10 bg-white/70 backdrop-blur-sm sticky top-[4.25rem] z-30">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-4">
          <ol className="flex flex-wrap gap-3 md:gap-8 justify-center md:justify-start text-[10px] font-bold uppercase tracking-[0.18em] text-warm-gray">
            <li className="text-forest">Summary</li>
            <li className="text-warm-gray">Delivery</li>
            <li className="text-warm-gray">Payment</li>
            <li className="text-warm-gray">Review</li>
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-8 md:py-12">
        {backLink && <div className="mb-8">{backLink}</div>}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-7 md:gap-8 items-start">
          <div className="space-y-6">{leftColumn}</div>
          <div className="lg:sticky lg:top-28">{rightColumn}</div>
        </div>
      </div>

      {mobileStickyBar && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-kraft/15 bg-white/95 backdrop-blur px-4 py-3">
          {mobileStickyBar}
        </div>
      )}
    </div>
  );
}
