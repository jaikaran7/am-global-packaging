"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Filter,
  Grid3X3,
  Layers,
  LayoutList,
  Package,
  Ruler,
  X,
} from "lucide-react";
import {
  PAPER_GSM_OPTIONS,
  paperProducts,
  type PaperProduct,
  type PaperProductCategory,
} from "@/data/paperProducts";
import { productsContent } from "@/content/papers-home/productsContent";

type PaperCategoryFilter = "all" | PaperProductCategory;

const paperCategories: { id: PaperCategoryFilter; label: string }[] = [
  { id: "all", label: "All Papers" },
  { id: "cotton", label: "Cotton Paper" },
  { id: "marble", label: "Marble Paper" },
  { id: "art", label: "Art Sheets" },
  { id: "custom", label: "Custom Sizes" },
];

const paperProductCategories = paperCategories.filter((cat) => cat.id !== "all");

const categoryLabels = paperCategories.reduce<Record<PaperCategoryFilter, string>>(
  (labels, cat) => {
    labels[cat.id] = cat.label;
    return labels;
  },
  {} as Record<PaperCategoryFilter, string>
);

function PaperProductCard({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  viewMode = "grid",
}: {
  product: PaperProduct;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  viewMode?: "grid" | "list";
}) {
  const gsmRange = `${Math.min(...product.gsmOptions)} - ${Math.max(
    ...product.gsmOptions
  )} GSM`;

  return (
    <Link href={`/papers/product/${product.slug}`}>
      <div
        className={`group bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 ${
          viewMode === "list" ? "flex flex-row items-stretch" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`relative bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center overflow-hidden ${
            viewMode === "list"
              ? "w-[200px] h-[200px] flex-shrink-0"
              : "h-[180px] md:h-[240px]"
          }`}
        >
          <div className="absolute inset-0 corrugated-pattern opacity-20" />
          <motion.img
            src={product.images[0]}
            alt={product.shortName}
            className="relative max-w-[84%] max-h-[84%] object-contain"
            style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
            {product.sizeLabel}
          </div>
        </div>

        <div className={`p-4 md:p-5 flex flex-col ${viewMode === "list" ? "flex-1 min-w-0" : ""}`}>
          <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase hidden md:block">
            {productsContent.productCard.typeLabels[product.type]}
          </span>
          <h3 className="text-sm md:text-base font-bold text-charcoal mt-1.5 tracking-tight group-hover:text-forest transition-colors">
            {product.shortName}
          </h3>
          <p className="text-xs text-warm-gray mt-1.5 leading-relaxed line-clamp-2 hidden md:block">
            {product.tagline}
          </p>
          <div className="mt-3">
            <div className="w-full flex justify-center md:justify-start">
              <span className="w-fit px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10 whitespace-nowrap">
                {product.dimensions}
              </span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap hidden md:flex">
              <span className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10">
                {gsmRange}
              </span>
              <span className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10">
                {categoryLabels[product.categories[0]]}
              </span>
            </div>
            <p className="text-sm text-neutral-600 block md:hidden mt-3">
              {gsmRange} Available
            </p>
          </div>
          <p className="text-xs text-warm-gray mt-2">
            Size: {product.sizeLabel}
          </p>
          <div className="mt-4 pt-4 border-t border-kraft/8 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
              {productsContent.productCard.viewLabel}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PapersProductsPage() {
  const [activeCategory, setActiveCategory] = useState<PaperCategoryFilter>("all");
  const [hoveredProductSlug, setHoveredProductSlug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const filteredProducts =
    activeCategory === "all"
      ? paperProducts
      : paperProducts.filter((product) => product.categories.includes(activeCategory));

  const gsmRange = `${Math.min(...PAPER_GSM_OPTIONS)} - ${Math.max(...PAPER_GSM_OPTIONS)} GSM`;
  const currentCategoryLabel = categoryLabels[activeCategory];

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero banner */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-forest">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)",
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-offwhite to-transparent" />

        <div
          ref={headerRef}
          className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-kraft-light/80 text-sm mb-4">
              <Link href="/papers/home" className="hover:text-kraft-light transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-offwhite">Products</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite tracking-tight leading-[1.08]">
              Paper
              <br />
              <span className="text-kraft-light">Collection</span>
            </h1>
            <p className="mt-5 text-offwhite/60 text-base md:text-lg max-w-xl leading-relaxed">
              Premium handmade cotton and marble papers for creative, packaging,
              and luxury applications.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Package className="w-4 h-4" />
                <span>{paperProductCategories.length} Categories</span>
              </div>
              <div className="w-px h-4 bg-offwhite/15" />
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Layers className="w-4 h-4" />
                <span>{gsmRange}</span>
              </div>
              <div className="w-px h-4 bg-offwhite/15" />
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Ruler className="w-4 h-4" />
                <span>{paperProducts.length} Products</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-14">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-5 py-3 bg-white border border-kraft/10 rounded-xl text-sm font-medium text-charcoal shadow-sm w-fit"
          >
            <Filter className="w-4 h-4" />
            Filters & Options
          </button>

          {/* Left sidebar — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                  Category
                </h3>
                <div className="space-y-1">
                  {paperCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-forest text-offwhite shadow-md shadow-forest/15"
                            : "text-charcoal/70 hover:bg-cream/60 hover:text-charcoal"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                  GSM Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PAPER_GSM_OPTIONS.map((gsm) => (
                    <span
                      key={gsm}
                      className="px-3 py-1.5 bg-kraft-pale/60 text-kraft text-xs font-semibold rounded-full border border-kraft/10"
                    >
                      {gsm} GSM
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 text-offwhite">
                <Package className="w-6 h-6 text-kraft-light mb-3" />
                <h4 className="font-bold text-sm mb-2">Need Custom Paper?</h4>
                <p className="text-offwhite/60 text-xs leading-relaxed mb-4">
                  Get handmade papers in custom sizes, GSM, and quantities.
                </p>
                <Link
                  href="/papers/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-kraft-light hover:text-kraft-lighter transition-colors"
                >
                  Request Quote
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFilterOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 bottom-0 w-[300px] bg-offwhite p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-charcoal">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-charcoal" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-3">
                      Category
                    </h4>
                    {paperCategories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat.id);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium mb-1 ${
                            isActive ? "bg-forest text-offwhite" : "text-charcoal/70"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Right: product grid */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-warm-gray">
                Showing{" "}
                <span className="font-semibold text-charcoal">
                  {filteredProducts.length}
                </span>{" "}
                product{filteredProducts.length !== 1 ? "s" : ""} in{" "}
                <span className="font-semibold text-charcoal">
                  {currentCategoryLabel}
                </span>
              </p>
              <div className="hidden sm:flex items-center gap-1 bg-white border border-kraft/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-forest text-offwhite"
                      : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-forest text-offwhite"
                      : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-warm-gray text-center py-20">
                {productsContent.noneFound}
              </p>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-5"
                }
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
                  >
                    <PaperProductCard
                      product={product}
                      hovered={hoveredProductSlug === product.slug}
                      onMouseEnter={() => setHoveredProductSlug(product.slug)}
                      onMouseLeave={() => setHoveredProductSlug(null)}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 bg-gradient-to-r from-forest via-forest-light to-forest rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 corrugated-pattern opacity-10" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold text-offwhite mb-3">
                  {productsContent.cta.heading}
                </h3>
                <p className="text-offwhite/60 mb-6 max-w-lg mx-auto text-sm">
                  {productsContent.cta.description}
                </p>
                <Link
                  href="/papers/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-colors shadow-lg shadow-kraft/25 text-sm"
                >
                  {productsContent.cta.button}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
