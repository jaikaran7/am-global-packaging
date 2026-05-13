"use client";

import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
  value: number;
  min: number;
  max?: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (next: number) => void;
};

export default function QuantityStepper({
  value,
  min,
  max,
  disabled,
  onDecrease,
  onIncrease,
  onChange,
}: Readonly<QuantityStepperProps>) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-kraft/15 bg-offwhite">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        className="p-3 text-charcoal hover:bg-white rounded-l-xl transition-colors disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 bg-transparent text-center text-sm font-semibold text-charcoal py-2 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className="p-3 text-charcoal hover:bg-white rounded-r-xl transition-colors disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
