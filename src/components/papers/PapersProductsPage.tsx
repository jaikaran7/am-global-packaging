"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Filter,
  Grid3X3,
  Layers,
  LayoutList,
  Loader2,
  Package,
  Ruler,
  X,
} from "lucide-react";
import { productsContent } from "@/content/papers-home/productsContent";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaperVariant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  gsm: number | null;
  size_label: string | null;
  unit_label: string;
  currency: string;
  tax_rate_percent: number;
  is_available: boolean;
  stock: number;
  min_order_quantity: number;
};

type PaperProduct = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  paper_type: string | null;
  size_label: string | null;
  dimensions_label: string | null;
  feature_badges: string[];
  tags: string[];
  use_cases: string[];
  lowest_price: number;
  highest_price: number;
  gsm_options: number[];
  variant_count: number;
  total_stock: number;
  primary_image_url: string | null;
  variants: PaperVariant[];
};

type CategoryFilter = "all" | "cotton" | "marble" | "art" | "custom";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Papers" },
  { id: "cotton", label: "Cotton Paper" },
  { id: "marble", label: "Marble Paper" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  const s = n % 1 === 0 ? String(n) : n.toFixed(2);
  return `$${s} AUD`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

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
  const gsmRange =
    product.gsm_options.length > 1
      ? `${product.gsm_options[0]} – ${product.gsm_options[product.gsm_options.length - 1]} GSM`
      : product.gsm_options.length === 1
      ? `${product.gsm_options[0]} GSM`
      : "—";

  const priceRange =
    product.lowest_price && product.highest_price
      ? product.lowest_price === product.highest_price
        ? `${formatPrice(product.lowest_price)} / sheet`
        : `${formatPrice(product.lowest_price)} – ${formatPrice(product.highest_price)} / sheet`
      : null;

  const isOutOfStock = product.total_stock === 0;

  /* fallback image — real images seeded separately */
  const imageSrc = product.primary_image_url
    ?? (product.paper_type === "marble"
        ? "/assets/papers/marble-02.png"
        : "/assets/papers/cotton-01.png");

  const typeLabel =
    product.paper_type === "marble"
      ? productsContent.productCard.typeLabels?.marble ?? "Marble Paper"
      : productsContent.productCard.typeLabels?.cotton ?? "Cotton Paper";

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
            src={imageSrc}
            alt={product.title}
            className="relative max-w-[84%] max-h-[84%] object-contain"
            style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
            {product.size_label ?? "—"}
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="px-3 py-1 bg-gray-700/80 text-white text-[10px] font-semibold rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 md:p-5 flex flex-col ${viewMode === "list" ? "flex-1 min-w-0" : ""}`}>
          <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase hidden md:block">
            {typeLabel}
          </span>
          <h3 className="text-sm md:text-base font-bold text-charcoal mt-1.5 tracking-tight group-hover:text-forest transition-colors">
            {product.title}
          </h3>
          {product.short_description && (
            <p className="text-xs text-warm-gray mt-1.5 leading-relaxed line-clamp-2 hidden md:block">
              {product.short_description}
            </p>
          )}
          <div className="mt-3">
            <div className="w-full flex justify-center md:justify-start">
              <span className="w-fit px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10 whitespace-nowrap">
                {product.dimensions_label ?? product.size_label ?? "—"}
              </span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap hidden md:flex">
              <span className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10">
                {gsmRange}
              </span>
              <span className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10">
                {product.variant_count} variants
              </span>
            </div>
            <p className="text-sm text-neutral-600 block md:hidden mt-3">
              {gsmRange}
            </p>
          </div>
          {priceRange && (
            <p className="text-xs text-warm-gray mt-2">
              {priceRange}
            </p>
          )}
          <p className="text-xs text-warm-gray mt-2">
            MOQ: As per requirement
          </p>

          <div className="mt-4 pt-4 border-t border-kraft/8 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
              {productsContent.productCard.viewLabel ?? "View Details"}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PapersProductsPage() {
  const [products, setProducts] = useState<PaperProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  /* Fetch from live API */
  useEffect(() => {
    setLoading(true);
    fetch("/api/papers/products")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then((data) => {
        setProducts(data.items ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load products. Please refresh.");
        setLoading(false);
      });
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.paper_type === activeCategory);

  const gsmSet = products.flatMap((p) => p.gsm_options);
  const gsmMin = gsmSet.length ? Math.min(...gsmSet) : 100;
  const gsmMax = gsmSet.length ? Math.max(...gsmSet) : 350;
  const gsmRange = `${gsmMin} – ${gsmMax} GSM`;

  const categoryCount = new Set(products.map((p) => p.paper_type).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero banner */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-forest">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px),repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px)",
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-offwhite to-transparent" />

        <div ref={headerRef} className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative">
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
              Premium handmade cotton and marble papers for creative, packaging, and luxury applications.
            </p>
            {!loading && (
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                  <Package className="w-4 h-4" />
                  <span>{categoryCount} Categories</span>
                </div>
                <div className="w-px h-4 bg-offwhite/15" />
                <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                  <Layers className="w-4 h-4" />
                  <span>{gsmRange}</span>
                </div>
                <div className="w-px h-4 bg-offwhite/15" />
                <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                  <Ruler className="w-4 h-4" />
                  <span>{products.length} Products</span>
                </div>
              </div>
            )}
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

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                  Category
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeCategory === cat.id
                          ? "bg-forest text-offwhite shadow-md shadow-forest/15"
                          : "text-charcoal/70 hover:bg-cream/60 hover:text-charcoal"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GSM info */}
              {!loading && products.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                    GSM Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(products.flatMap((p) => p.gsm_options))].sort((a, b) => a - b).map((gsm) => (
                      <span
                        key={gsm}
                        className="px-3 py-1.5 bg-kraft-pale/60 text-kraft text-xs font-semibold rounded-full border border-kraft/10"
                      >
                        {gsm} GSM
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
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
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
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
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-3">
                    Category
                  </h4>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setActiveCategory(cat.id); setMobileFilterOpen(false); }}
                      className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium mb-1 ${
                        activeCategory === cat.id ? "bg-forest text-offwhite" : "text-charcoal/70"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Product grid */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-warm-gray">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-charcoal">{filteredProducts.length}</span>{" "}
                    product{filteredProducts.length !== 1 ? "s" : ""} in{" "}
                    <span className="font-semibold text-charcoal">
                      {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                    </span>
                  </>
                )}
              </p>
              <div className="hidden sm:flex items-center gap-1 bg-white border border-kraft/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-forest text-offwhite" : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-forest text-offwhite" : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-kraft/8 overflow-hidden animate-pulse">
                    <div className="h-[180px] md:h-[240px] bg-kraft-pale/40" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-kraft-pale/60 rounded w-3/4" />
                      <div className="h-3 bg-kraft-pale/40 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center py-20 text-red-600 text-sm">{error}</div>
            )}

            {/* Empty */}
            {!loading && !error && filteredProducts.length === 0 && (
              <p className="text-warm-gray text-center py-20">
                {productsContent.noneFound}
              </p>
            )}

            {/* Products */}
            {!loading && !error && filteredProducts.length > 0 && (
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
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <PaperProductCard
                      product={product}
                      hovered={hoveredSlug === product.slug}
                      onMouseEnter={() => setHoveredSlug(product.slug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            {!loading && (
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
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
