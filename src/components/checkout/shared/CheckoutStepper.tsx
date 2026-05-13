"use client";

import { Check } from "lucide-react";

export type CheckoutStep = {
  id: string;
  label: string;
};

export const DEFAULT_CHECKOUT_STEPS: CheckoutStep[] = [
  { id: "summary", label: "Summary" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function CheckoutStepper({
  steps,
  activeId,
}: {
  steps: CheckoutStep[];
  activeId: string;
}) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === activeId)
  );

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center gap-2 md:gap-4">
        {steps.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li key={step.id} className="flex items-center gap-2 md:gap-3 min-w-0">
              <div
                className={`flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] md:text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-forest text-offwhite"
                    : isActive
                      ? "bg-kraft text-white shadow-md shadow-kraft/25"
                      : "bg-kraft-pale/60 text-warm-gray ring-1 ring-kraft/15"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${
                  isActive
                    ? "text-charcoal"
                    : isCompleted
                      ? "text-forest"
                      : "text-warm-gray"
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={`hidden sm:block h-px flex-1 min-w-[16px] md:min-w-[28px] ${
                    isCompleted ? "bg-forest/40" : "bg-kraft/15"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
