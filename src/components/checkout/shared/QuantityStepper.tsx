"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  disabled = false,
  className = "",
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const clamp = (n: number) => {
    const lo = Math.max(min, Number.isFinite(n) ? n : min);
    return max != null ? Math.min(max, lo) : lo;
  };
  const onAdjust = (delta: number) => onChange(clamp(value + delta));

  const padding = size === "sm" ? "p-2" : "p-3";
  const inputCls = size === "sm" ? "w-14 py-1.5 text-xs" : "w-20 py-2 text-sm";

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-kraft/15 bg-offwhite shadow-sm shadow-kraft/5 overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => onAdjust(-step)}
        disabled={disabled || value <= min}
        className={`${padding} text-charcoal hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className={`${inputCls} bg-transparent text-center font-semibold text-charcoal focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50`}
      />
      <button
        type="button"
        onClick={() => onAdjust(step)}
        disabled={disabled || (max != null && value >= max)}
        className={`${padding} text-charcoal hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
