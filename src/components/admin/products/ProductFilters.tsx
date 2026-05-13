"use client";

import type { ProductLine } from "@/contexts/ProductLineContext";

export type CategoryOption = { id: string; name: string; slug: string };

/** Catalog GSM values for paper variants (list prices stored in USD; public site shows AUD). */
export const PAPERS_ADMIN_GSM_OPTIONS = [110, 200, 250, 270, 320, 350] as const;

/** Matches `meta.size_label` on seeded paper products. */
export const PAPERS_ADMIN_SIZE_OPTIONS = ["A4", "A5", "22 × 30 inch", "10 × 20 cm"] as const;

interface ProductFiltersProps {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  productLine: ProductLine;
  /** Corrugated: 3 | 5 | 7 ply */
  selectedPly: number | null;
  onPlyChange: (ply: number | null) => void;
  /** Papers: exact `meta.size_label` (matches catalog seed). */
  selectedPaperSize: string | null;
  onPaperSizeChange: (sizeLabel: string | null) => void;
  selectedGsm: number | null;
  onGsmChange: (gsm: number | null) => void;
}

function pillClass(active: boolean) {
  return `px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
    active ? "bg-[#2b2f33] text-white" : "bg-white/70 text-[#2b2f33] border border-[#e5e7eb] hover:bg-white"
  }`;
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
  onCategoryChange,
  productLine,
  selectedPly,
  onPlyChange,
  selectedPaperSize,
  onPaperSizeChange,
  selectedGsm,
  onGsmChange,
}: ProductFiltersProps) {
  return (
    <aside className="glass glass--soft rounded-2xl p-5 w-56 shrink-0 sticky top-6 h-[calc(100vh-48px)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Category</p>
      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedCategoryId === null
              ? "bg-[#ff7a2d] text-white"
              : "text-[#2b2f33] hover:bg-white/60"
          }`}
        >
          All Products
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategoryChange(c.id)}
            className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategoryId === c.id
                ? "bg-[#ff7a2d] text-white"
                : "text-[#2b2f33] hover:bg-white/60"
            }`}
          >
            {c.name}
          </button>
        ))}
      </nav>

      {productLine === "papers" ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mt-6 mb-3">Size</p>
          <div className="flex flex-col gap-2">
            {PAPERS_ADMIN_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPaperSizeChange(selectedPaperSize === size ? null : size)}
                className={`${pillClass(selectedPaperSize === size)} text-left`}
              >
                {size}
              </button>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mt-6 mb-3">GSM Options</p>
          <div className="flex flex-wrap gap-2">
            {PAPERS_ADMIN_GSM_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGsmChange(selectedGsm === g ? null : g)}
                className={pillClass(selectedGsm === g)}
              >
                {g} GSM
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mt-6 mb-3">Ply Options</p>
          <div className="flex flex-wrap gap-2">
            {[3, 5, 7].map((ply) => (
              <button
                key={ply}
                type="button"
                onClick={() => onPlyChange(selectedPly === ply ? null : ply)}
                className={pillClass(selectedPly === ply)}
              >
                {ply}-Ply
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
