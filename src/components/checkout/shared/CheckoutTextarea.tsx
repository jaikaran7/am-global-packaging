"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"textarea">, "className"> & {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  rows?: number;
};

export const CheckoutTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, id, className = "", rows = 4, ...props }, ref) => (
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-[0.14em] text-kraft mb-2"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-err` : hint ? `${id}-hint` : undefined
        }
        className={[
          "block w-full rounded-xl border bg-white px-4 py-3 text-sm leading-relaxed text-charcoal",
          "shadow-sm shadow-kraft/[0.04] transition-colors duration-200 resize-none",
          "placeholder:text-warm-gray/60",
          "hover:border-kraft/30",
          "focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/35",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-offwhite",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
            : "border-kraft/15",
        ].join(" ")}
        {...props}
      />
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
CheckoutTextarea.displayName = "CheckoutTextarea";
