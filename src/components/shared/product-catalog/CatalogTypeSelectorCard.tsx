"use client";

import Link from "next/link";
import type { Product } from "@/data/products";

export function getProductTypeSelectorLabel(product: Product): string {
  return (
    product.shortName
      .replace(/A4 Box /i, "")
      .replace(/Pizza Box/i, "")
      .replace(/Carton/i, "")
      .replace(/Box/i, "")
      .trim() || product.shortName
  );
}

/** Same DOM/classes as Boxes `ProductTypeCard` — title + subtitle lines only. */
export function CatalogTypeSelectorCard({
  title,
  subtitle,
  isActive,
  onClick = () => {},
  href,
}: {
  title: string;
  subtitle: string;
  isActive: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className = `flex shrink-0 w-[130px] md:w-auto snap-center flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all duration-300 h-full ${
    isActive
      ? "border-forest bg-forest/5 shadow-md"
      : "border-kraft/15 bg-white hover:border-kraft/30 hover:bg-kraft-pale/20"
  }`;
  const content = (
    <>
      <span
        className={`text-[11px] font-bold leading-tight ${
          isActive ? "text-forest" : "text-charcoal/70"
        }`}
      >
        {title}
      </span>
      <span className="text-[9px] text-warm-gray leading-tight">{subtitle}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
