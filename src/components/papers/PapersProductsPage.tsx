"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Grid3X3,
  LayoutList,
  Loader2,
  Package,
  Ruler,
  Layers,
  Box,
} from "lucide-react";
import { productsContent } from "@/content/papers-home/productsContent";
import { ProductsCatalogChrome } from "@/components/shared/product-catalog/ProductsCatalogChrome";
import { CatalogProductCard } from "@/components/shared/product-catalog/CatalogProductCard";
import { mapPaperListingToProduct, type PaperListingInput } from "@/lib/papers/paperToProduct";

type PaperProduct = PaperListingInput & {
  id: string;
  tags: string[];
  variants: unknown[];
};

type CategoryFilter = "all" | "cotton" | "marble" | "art" | "custom";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Papers" },
  { id: "cotton", label: "Cotton Paper" },
  { id: "marble", label: "Marble Paper" },
];

function typeLabelForPaper(p: PaperProduct): string {
  return p.paper_type === "marble"
    ? productsContent.productCard.typeLabels?.marble ?? "Marble Paper"
    : productsContent.productCard.typeLabels?.cotton ?? "Cotton Paper";
}

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

  const gsmPills = [...new Set(products.flatMap((p) => p.gsm_options))]
    .sort((a, b) => a - b)
    .map((gsm) => (
      <span
        key={gsm}
        className="px-3 py-1.5 bg-kraft-pale/60 text-kraft text-xs font-semibold rounded-full border border-kraft/10"
      >
        {gsm} GSM
      </span>
    ));

  const categorySidebar = (onPick?: () => void) => (
    <div>
      <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
        Category
      </h3>
      <div className="space-y-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              onPick?.();
            }}
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
  );

  const sidebarDesktop = (
    <>
      {categorySidebar(() => setMobileFilterOpen(false))}
      {!loading && products.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
            GSM Options
          </h3>
          <div className="flex flex-wrap gap-2">{gsmPills}</div>
        </div>
      )}
      <div className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 text-offwhite">
        <Box className="w-6 h-6 text-kraft-light mb-3" />
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
    </>
  );

  const sidebarMobile = (
    <div className="space-y-6">
      <div>
        <h4 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-3">
          Category
        </h4>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              setMobileFilterOpen(false);
            }}
            className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium mb-1 ${
              activeCategory === cat.id ? "bg-forest text-offwhite" : "text-charcoal/70"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );

  const heroStats = !loading ? (
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
  ) : null;

  const toolbarSummary = (
    <>
      <p className="text-sm text-warm-gray">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
          </span>
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-charcoal">{filteredProducts.length}</span> product
            {filteredProducts.length !== 1 ? "s" : ""} in{" "}
            <span className="font-semibold text-charcoal">
              {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </span>
          </>
        )}
      </p>
      <div className="hidden sm:flex items-center gap-1 bg-white border border-kraft/10 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "grid" ? "bg-forest text-offwhite" : "text-warm-gray hover:text-charcoal"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "list" ? "bg-forest text-offwhite" : "text-warm-gray hover:text-charcoal"
          }`}
        >
          <LayoutList className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <ProductsCatalogChrome
      homeHref="/papers/home"
      headerRef={headerRef}
      headerInView={headerInView}
      breadcrumbCurrentLabel="Products"
      heroTitleLine1="Paper"
      heroTitleLine2="Collection"
      heroDescription="Premium handmade cotton and marble papers for creative, packaging, and luxury applications."
      heroStats={heroStats}
      sidebarDesktop={sidebarDesktop}
      sidebarMobile={sidebarMobile}
      mobileFilterOpen={mobileFilterOpen}
      setMobileFilterOpen={setMobileFilterOpen}
      toolbarSummary={toolbarSummary}
      bottomCtaTitle={productsContent.cta.heading}
      bottomCtaDescription={productsContent.cta.description}
      bottomCtaHref="/papers/contact"
      bottomCtaButtonLabel={productsContent.cta.button}
    >
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

      {error && <div className="text-center py-20 text-red-600 text-sm">{error}</div>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="text-warm-gray text-center py-20">{productsContent.noneFound}</p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-5"
          }
        >
          {filteredProducts.map((p) => {
            const catalog = mapPaperListingToProduct(p, typeLabelForPaper(p));
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <CatalogProductCard
                  product={catalog}
                  hovered={hoveredSlug === p.slug}
                  onMouseEnter={() => setHoveredSlug(p.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  viewMode={viewMode}
                  productHref={`/papers/product/${p.slug}`}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </ProductsCatalogChrome>
  );
}
