"use client";

import type { ReactNode } from "react";
import { Lock, Shield, Truck } from "lucide-react";
import { QuantityStepper } from "./QuantityStepper";

export type OrderSummaryLine = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export type OrderSummaryProps = {
  productTitle: string;
  productSubtitle?: string;
  productImageSrc: string;
  productImageAlt: string;
  variantBadges: string[];
  variantPickerSlot?: ReactNode;
  quantity: number;
  onQuantityChange: (next: number) => void;
  quantityMin: number;
  quantityMax?: number;
  quantityHelp?: string;
  quantityDisabled?: boolean;
  pricingLines: OrderSummaryLine[];
  totalLabel: string;
  totalValue: string;
  totalHint?: string;
  ctaSlot: ReactNode;
  policyNote?: string;
};

export function OrderSummaryCard({
  productTitle,
  productSubtitle,
  productImageSrc,
  productImageAlt,
  variantBadges,
  variantPickerSlot,
  quantity,
  onQuantityChange,
  quantityMin,
  quantityMax,
  quantityHelp,
  quantityDisabled,
  pricingLines,
  totalLabel,
  totalValue,
  totalHint,
  ctaSlot,
  policyNote,
}: OrderSummaryProps) {
  return (
    <aside aria-label="Order summary" className="space-y-4">
      <div className="rounded-2xl border border-kraft/10 bg-white shadow-sm shadow-kraft/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-kraft/8 bg-gradient-to-br from-white to-kraft-pale/15">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kraft">
            Order summary
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-forest">
            <Lock className="w-3 h-3" aria-hidden />
            Secure
          </span>
        </div>

        {/* Product line */}
        <div className="px-5 md:px-6 py-5 flex items-start gap-4 border-b border-kraft/8">
          <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-xl overflow-hidden ring-1 ring-kraft/10 bg-gradient-to-br from-kraft-pale/60 to-cream/40">
            {/* eslint-disable-next-line @next/next/no-img-element -- mixed static / remote product assets */}
            <img
              src={productImageSrc}
              alt={productImageAlt}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-charcoal leading-snug line-clamp-2">
              {productTitle}
            </p>
            {productSubtitle && (
              <p className="text-xs text-warm-gray mt-1 leading-relaxed line-clamp-2">
                {productSubtitle}
              </p>
            )}
            {variantBadges.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {variantBadges.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-kraft-pale/60 text-kraft text-[10px] font-semibold border border-kraft/10"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variant picker */}
        {variantPickerSlot && (
          <div className="px-5 md:px-6 py-5 border-b border-kraft/8">{variantPickerSlot}</div>
        )}

        {/* Quantity */}
        <div className="px-5 md:px-6 py-5 border-b border-kraft/8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-kraft">
              Quantity
            </p>
            <QuantityStepper
              value={quantity}
              onChange={onQuantityChange}
              min={quantityMin}
              max={quantityMax}
              step={Math.max(1, Math.round(quantity * 0.1))}
              disabled={quantityDisabled}
              size="sm"
            />
          </div>
          {quantityHelp && (
            <p className="mt-2.5 text-[11px] text-warm-gray leading-relaxed">
              {quantityHelp}
            </p>
          )}
        </div>

        {/* Pricing breakdown */}
        <dl className="px-5 md:px-6 py-5 space-y-2.5 text-sm">
          {pricingLines.map((line) => (
            <div
              key={line.label}
              className="flex items-baseline justify-between gap-3"
            >
              <dt
                className={`text-xs leading-snug ${
                  line.emphasis ? "text-charcoal font-semibold" : "text-warm-gray"
                }`}
              >
                {line.label}
              </dt>
              <dd
                className={`tabular-nums text-sm leading-snug ${
                  line.emphasis ? "text-charcoal font-semibold" : "text-charcoal"
                }`}
              >
                {line.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Total */}
        <div className="px-5 md:px-6 py-5 bg-gradient-to-br from-kraft-pale/30 to-cream/20 border-t border-kraft/8 flex items-baseline justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-warm-gray">
            {totalLabel}
          </span>
          <span className="text-2xl md:text-[1.6rem] font-bold text-forest tabular-nums">
            {totalValue}
          </span>
        </div>
        {totalHint && (
          <p className="px-5 md:px-6 pb-5 pt-1 text-[11px] text-warm-gray leading-relaxed">
            {totalHint}
          </p>
        )}

        {/* CTA (desktop only — mobile uses sticky bar) */}
        <div className="hidden md:block px-5 md:px-6 pb-6">{ctaSlot}</div>

        {/* Trust row */}
        <div className="hidden md:flex items-center justify-center gap-5 px-5 md:px-6 pb-5 text-[11px] text-warm-gray">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-forest" aria-hidden />
            B2B verified
          </span>
          <span className="w-px h-3 bg-kraft/15" aria-hidden />
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-kraft" aria-hidden />
            Ships globally
          </span>
        </div>
      </div>

      {policyNote && (
        <p className="text-[11px] text-warm-gray leading-relaxed px-1">{policyNote}</p>
      )}
    </aside>
  );
}
