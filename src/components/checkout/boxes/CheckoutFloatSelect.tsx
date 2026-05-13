"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";

type Props = Omit<ComponentPropsWithoutRef<"select">, "className"> & {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
};

const baseSelect = [
  "peer block w-full h-14 appearance-none rounded-xl border bg-white",
  "px-4 pt-[1.35rem] pb-1.5 pr-11 text-sm text-charcoal",
  "shadow-sm shadow-kraft/[0.04] transition-colors duration-200",
  "hover:border-kraft/30",
  "focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/35",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-offwhite",
].join(" ");

const floatedLabel =
  "pointer-events-none absolute left-4 top-2 z-10 select-none text-[10px] font-bold uppercase tracking-[0.14em] text-kraft peer-disabled:text-warm-gray/60";

export const CheckoutFloatSelect = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, hint, id, className = "", children, ...props }, ref) => (
    <div className={`relative ${className}`}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-err` : hint ? `${id}-hint` : undefined
          }
          className={`${baseSelect} ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
              : "border-kraft/15"
          }`}
          {...props}
        >
          {children}
        </select>
        <label htmlFor={id} className={floatedLabel}>
          {label}
        </label>
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray peer-focus:text-forest transition-colors"
        />
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-warm-gray">
          {hint}
        </p>
      ) : null}
    </div>
  )
);
CheckoutFloatSelect.displayName = "CheckoutFloatSelect";
