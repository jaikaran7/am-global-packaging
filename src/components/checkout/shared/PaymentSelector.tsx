"use client";

const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", hint: "Secure card payment at confirmation" },
  { id: "bank", label: "Bank Transfer", hint: "Direct transfer after invoice approval" },
  { id: "invoice", label: "Invoice Request", hint: "Net terms for approved B2B accounts" },
  { id: "paypal", label: "PayPal", hint: "Optional online payment route" },
] as const;

type PaymentSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PaymentSelector({
  value,
  onChange,
}: Readonly<PaymentSelectorProps>) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {PAYMENT_OPTIONS.map((option) => {
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
