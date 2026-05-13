"use client";

import type { ReactNode } from "react";

type CheckoutSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function CheckoutSectionCard({
  title,
  description,
  children,
}: Readonly<CheckoutSectionCardProps>) {
  return (
    <section className="rounded-2xl border border-kraft/12 bg-white p-5 md:p-7 shadow-sm shadow-kraft/5">
      <div className="mb-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-charcoal">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-warm-gray">{description}</p>}
      </div>
      {children}
    </section>
  );
}
