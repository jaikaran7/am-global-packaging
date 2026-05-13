"use client";

const SHIPPING_OPTIONS = [
  {
    id: "standard",
    label: "Standard Shipping",
    hint: "5-8 business days",
  },
  {
    id: "express",
    label: "Express Shipping",
    hint: "2-4 business days",
  },
  {
    id: "pickup",
    label: "Warehouse Pickup",
    hint: "Collect from our dispatch hub",
  },
] as const;

type ShippingSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ShippingSelector({
  value,
  onChange,
}: Readonly<ShippingSelectorProps>) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {SHIPPING_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            type="button"
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`text-left rounded-xl border p-4 transition-all ${
              active
                ? "border-forest bg-forest/5 shadow-sm"
                : "border-kraft/12 bg-offwhite/50 hover:border-kraft/25"
            }`}
          >
            <p className={`text-sm font-semibold ${active ? "text-forest" : "text-charcoal"}`}>{option.label}</p>
            <p className="text-xs text-warm-gray mt-1">{option.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
