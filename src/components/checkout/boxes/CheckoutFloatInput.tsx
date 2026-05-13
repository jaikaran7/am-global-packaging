"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  label: string;
  error?: string;
  className?: string;
};

const baseInput =
  "block h-12 w-full rounded-xl border bg-white px-4 text-sm text-charcoal shadow-sm transition-all " +
  "placeholder:text-warm-gray/60 hover:border-kraft/25 focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/30 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const CheckoutFloatInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = "", ...props }, ref) => (
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-warm-gray"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        placeholder={props.placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${baseInput} ${error ? "border-red-300/90" : "border-kraft/12"}`}
        {...props}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
);
CheckoutFloatInput.displayName = "CheckoutFloatInput";
