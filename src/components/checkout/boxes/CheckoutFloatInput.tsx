"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  label: string;
  error?: string;
  className?: string;
};

const baseInput =
  "peer block w-full rounded-xl border bg-white px-4 pt-5 pb-2 text-sm text-charcoal shadow-sm transition-all " +
  "placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-forest/12 focus:border-forest/25 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const baseLabel =
  "pointer-events-none absolute left-4 top-1/2 z-10 origin-[0] -translate-y-1/2 text-warm-gray text-sm " +
  "transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:scale-[0.72] " +
  "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.72]";

export const CheckoutFloatInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = "", ...props }, ref) => (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${baseInput} ${error ? "border-red-300/90" : "border-kraft/12"}`}
        {...props}
      />
      <label htmlFor={id} className={baseLabel}>
        {label}
      </label>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
);
CheckoutFloatInput.displayName = "CheckoutFloatInput";
