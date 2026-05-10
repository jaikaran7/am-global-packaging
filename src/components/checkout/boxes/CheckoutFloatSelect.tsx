"use client";

import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"select">, "className"> & {
  label: string;
  error?: string;
  className?: string;
};

export function CheckoutFloatSelect({ label, error, id, className = "", children, ...props }: Props) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-2 z-10 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-kraft">
          {label}
        </span>
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`mt-5 block w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-charcoal shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest/12 focus:border-forest/25 disabled:opacity-50 ${
            error ? "border-red-300/90" : "border-kraft/12"
          }`}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 text-warm-gray text-xs">
          ▾
        </span>
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
