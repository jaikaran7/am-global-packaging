"use client";

import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";

type Props = Omit<ComponentPropsWithoutRef<"select">, "className"> & {
  label: string;
  error?: string;
  className?: string;
};

export function CheckoutFloatSelect({ label, error, id, className = "", children, ...props }: Props) {
  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-warm-gray"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`block h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm text-charcoal shadow-sm transition-all hover:border-kraft/25 focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/30 disabled:opacity-50 ${
            error ? "border-red-300/90" : "border-kraft/12"
          }`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
