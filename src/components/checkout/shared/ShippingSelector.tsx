"use client";

import { Truck, Zap, Store, Check } from "lucide-react";
import type { ReactNode } from "react";

export type ShippingOption = {
  id: string;
  label: string;
  description: string;
  eta: string;
  cost: string;
  icon?: ReactNode;
};

export const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Tracked freight, kerbside delivery",
    eta: "5–10 business days",
    cost: "Confirmed by team",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    id: "express",
    label: "Express delivery",
    description: "Priority freight with active tracking",
    eta: "2–4 business days",
    cost: "Premium rate",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "pickup",
    label: "Warehouse pickup",
    description: "Collect from our Australian distribution centre",
    eta: "Same/next business day",
    cost: "Free",
    icon: <Store className="w-4 h-4" />,
  },
];

export function ShippingSelector({
  options = DEFAULT_SHIPPING_OPTIONS,
  value,
  onChange,
}: {
  options?: ShippingOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Shipping method" className="space-y-3">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <label
            key={opt.id}
            className={`group flex items-start gap-4 rounded-xl border-2 px-4 md:px-5 py-4 cursor-pointer transition-all duration-200 ${
              isActive
                ? "border-forest bg-forest/5 shadow-sm shadow-forest/10"
                : "border-kraft/12 bg-white hover:border-kraft/25 hover:bg-kraft-pale/20"
            }`}
          >
            <input
              type="radio"
              name="shipping-method"
              value={opt.id}
              checked={isActive}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            <span
              className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                isActive
                  ? "bg-forest text-offwhite ring-forest/30"
                  : "bg-kraft-pale/60 text-kraft ring-kraft/15"
              }`}
              aria-hidden
            >
              {isActive ? <Check className="w-4 h-4" strokeWidth={2.5} /> : opt.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-bold text-charcoal">{opt.label}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-kraft">
                  {opt.eta}
                </span>
              </span>
              <span className="block text-xs text-warm-gray mt-1 leading-relaxed">
                {opt.description}
              </span>
            </span>
            <span className="text-xs font-semibold text-charcoal whitespace-nowrap pl-2">
              {opt.cost}
            </span>
          </label>
        );
      })}
    </div>
  );
}
