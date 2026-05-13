"use client";

import type { ReactNode } from "react";

export function CheckoutSectionCard({
  index,
  title,
  description,
  action,
  children,
  id,
}: {
  index?: number;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="rounded-2xl border border-kraft/10 bg-white shadow-sm shadow-kraft/5 overflow-hidden"
    >
      <header className="flex items-start gap-4 px-5 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5 border-b border-kraft/8 bg-gradient-to-br from-white to-kraft-pale/15">
        {index != null && (
          <span className="flex h-8 w-8 md:h-9 md:w-9 flex-shrink-0 items-center justify-center rounded-full bg-forest/8 text-forest text-xs md:text-sm font-bold ring-1 ring-forest/15">
            {index}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3
            id={id ? `${id}-heading` : undefined}
            className="text-base md:text-lg font-bold text-charcoal tracking-tight leading-snug"
          >
            {title}
          </h3>
          {description && (
            <p className="text-xs md:text-sm text-warm-gray mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </header>
      <div className="px-5 md:px-7 py-5 md:py-7">{children}</div>
    </section>
  );
}
