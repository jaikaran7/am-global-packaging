"use client";

export type CategoryOption = { id: string; name: string; slug: string };

interface ProductFiltersProps {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  selectedPly: number | null;
  onCategoryChange: (id: string | null) => void;
  onPlyChange: (ply: number | null) => void;
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
  selectedPly,
  onCategoryChange,
  onPlyChange,
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

      <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mt-6 mb-3">Ply options</p>
      <div className="flex flex-wrap gap-2">
        {[3, 5, 7].map((ply) => (
          <button
            key={ply}
            type="button"
            onClick={() => onPlyChange(selectedPly === ply ? null : ply)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              selectedPly === ply
                ? "bg-[#2b2f33] text-white"
                : "bg-white/70 text-[#2b2f33] border border-[#e5e7eb] hover:bg-white"
            }`}
          >
            {ply}-Ply
          </button>
        ))}
      </div>
    </aside>
  );
}
