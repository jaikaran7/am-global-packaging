"use client";

import { CreditCard, Building2, FileText, Wallet } from "lucide-react";
import type { ReactNode } from "react";

export type PaymentOption = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
};

export const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "invoice",
    label: "Invoice request",
    description: "We'll issue a B2B invoice with confirmed pricing.",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "bank",
    label: "Bank transfer",
    description: "Direct EFT to our Australian business account.",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "card",
    label: "Credit / debit card",
    description: "Visa, Mastercard or Amex. Surcharges may apply.",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pay securely via PayPal Business.",
    icon: <Wallet className="w-5 h-5" />,
  },
];

export function PaymentSelector({
  options = DEFAULT_PAYMENT_OPTIONS,
  value,
  onChange,
}: {
  options?: PaymentOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <label
            key={opt.id}
            className={`group relative flex items-start gap-3 rounded-xl border-2 px-4 py-4 cursor-pointer transition-all duration-200 ${
              isActive
                ? "border-forest bg-forest/5 shadow-sm shadow-forest/10"
                : "border-kraft/12 bg-white hover:border-kraft/25 hover:bg-kraft-pale/20"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={opt.id}
              checked={isActive}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                isActive ? "bg-forest text-offwhite" : "bg-kraft-pale/60 text-kraft"
              }`}
              aria-hidden
            >
              {opt.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-charcoal">{opt.label}</span>
              <span className="block text-xs text-warm-gray mt-0.5 leading-relaxed">
                {opt.description}
              </span>
            </span>
            <span
              className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
                isActive
                  ? "border-forest bg-forest ring-2 ring-forest/20"
                  : "border-kraft/30 bg-white"
              }`}
              aria-hidden
            />
          </label>
        );
      })}
    </div>
  );
}
