"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
};

const baseInput = [
  "peer block w-full h-14 rounded-xl border bg-white",
  "px-4 pt-[1.35rem] pb-1.5 text-sm text-charcoal",
  "shadow-sm shadow-kraft/[0.04] transition-colors duration-200",
  "placeholder:text-transparent",
  "hover:border-kraft/30",
  "focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/35",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-offwhite",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
].join(" ");

const baseLabel = [
  "pointer-events-none absolute left-4 z-10 select-none",
  "top-1/2 -translate-y-1/2 text-sm text-warm-gray font-normal tracking-normal",
  "transition-all duration-200 ease-out",
  // Floated state
  "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-kraft",
  "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.14em] peer-[:not(:placeholder-shown)]:text-kraft",
  "peer-disabled:text-warm-gray/60",
].join(" ");

export const CheckoutFloatInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, id, className = "", ...props }, ref) => (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-err` : hint ? `${id}-hint` : undefined
        }
        className={`${baseInput} ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
            : "border-kraft/15"
        }`}
        {...props}
      />
      <label htmlFor={id} className={baseLabel}>
        {label}
      </label>
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
CheckoutFloatInput.displayName = "CheckoutFloatInput";
