"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ChevronRight,
  ArrowRight,
  Filter,
  Grid3X3,
  LayoutList,
  Box,
  Ruler,
  Layers,
  X,
} from "lucide-react";
import {
  products,
  categories,
  productCategories,
  categoryRouteSlugs,
  getCategoryProducts,
  isCategoryRouteSlug,
  getCategoryIdByRouteSlug,
  type Product,
} from "@/data/products";

function Box3D({
  product,
  hovered,
}: {
  product: Product;
  hovered: boolean;
}) {
  const { length, width, height } = product.dimensionDetail;

  const maxDim = Math.max(length, width, height);
  const s = 130 / maxDim;
  const w = Math.max(80, length * s);
  const h = Math.max(60, height * s);
  const depth = Math.max(20, width * s * 0.5);

  const palette: Record<string, { front: string; mid: string; dark: string; top: string }> = {
    "pizza-boxes":     { front: "#C4973B", mid: "#A67B1E", dark: "#8B6914", top: "#DDB84D" },
    specialty:         { front: "#8B7355", mid: "#6B5A42", dark: "#5A4A35", top: "#A68B6B" },
    books:             { front: "#B8935A", mid: "#9A7A48", dark: "#7D6338", top: "#D4AE6E" },
    ecommerce:         { front: "#A68558", mid: "#8B6E45", dark: "#735B38", top: "#C4A06A" },
    "general-purpose": { front: "#B09060", mid: "#957850", dark: "#7C6342", top: "#CBA878" },
    "vegetable-boxes": { front: "#5A8A4A", mid: "#4A7A3A", dark: "#3A6A2A", top: "#7AAA62" },
    "poultry-boxes":   { front: "#C4784A", mid: "#A46038", dark: "#8A4E2C", top: "#E4986A" },
  };
  const c = palette[product.category] ?? palette["general-purpose"];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ perspective: "600px" }}
    >
      <motion.div
        animate={{
          rotateX: hovered ? -12 : -8,
          rotateY: hovered ? -20 : -15,
          scale: hovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face */}
        <div
          className="rounded-md relative"
          style={{
            width: `${w}px`,
            height: `${h}px`,
            background: `linear-gradient(145deg, ${c.front} 0%, ${c.mid} 50%, ${c.dark} 100%)`,
            transform: `translateZ(${depth / 2}px)`,
            boxShadow: `0 15px 40px ${c.dark}4d, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.06) 5px, rgba(0,0,0,0.06) 6px)",
            }}
          />
          <div className="absolute inset-3 border border-white/10 rounded flex flex-col items-center justify-center gap-1.5">
            <div className="text-white/50 text-[8px] tracking-[0.25em] uppercase font-medium">
              AM Global
            </div>
            <div className="w-8 h-px bg-white/15" />
            <div className="text-white/35 text-[7px] tracking-widest uppercase">
              {product.shortName}
            </div>
          </div>
        </div>

        {/* Top face / lid */}
        <motion.div
          className="absolute origin-bottom"
          style={{
            width: `${w}px`,
            height: `${depth}px`,
            background: `linear-gradient(180deg, ${c.top} 0%, ${c.front} 100%)`,
            top: `-${depth}px`,
            left: 0,
            transform: "rotateX(90deg)",
            boxShadow: "inset 0 -1px 6px rgba(0,0,0,0.08)",
          }}
          animate={{ rotateX: hovered ? 75 : 90 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 7px)",
            }}
          />
        </motion.div>

        {/* Right face */}
        <div
          className="absolute top-0 origin-left"
          style={{
            width: `${depth}px`,
            height: `${h}px`,
            background: `linear-gradient(90deg, ${c.mid} 0%, ${c.dark} 100%)`,
            left: `${w}px`,
            transform: `rotateY(90deg)`,
            boxShadow: "inset 1px 0 6px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.06) 5px, rgba(0,0,0,0.06) 6px)",
            }}
          />
        </div>

        {/* Shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black/8 blur-lg rounded-[50%]"
          style={{
            width: `${w * 0.8}px`,
            height: "10px",
            bottom: `-16px`,
            transform: `translateX(-50%) translateZ(-${depth}px)`,
          }}
        />
      </motion.div>
    </div>
  );
}

/** Full detailed product card — Product Image, Category Label, Name, Description, Dimension/Ply badges, View Details */
function ProductCard({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  viewMode = "grid",
}: {
  product: Product;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  viewMode?: "grid" | "list";
}) {
  const maxDim = Math.max(
    product.dimensionDetail.length,
    product.dimensionDetail.width,
    product.dimensionDetail.height
  );
  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className={`group bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 ${
          viewMode === "list" ? "flex flex-row items-stretch" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Product image with 3D box and dimension badge */}
        <div
          className={`relative bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center overflow-hidden ${
            viewMode === "list"
              ? "w-[200px] h-[200px] flex-shrink-0"
              : "h-[180px] md:h-[240px]"
          }`}
        >
          <div className="absolute inset-0 corrugated-pattern opacity-20" />
          <Box3D product={product} hovered={hovered} />
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
            {maxDim}mm
          </div>
        </div>
        {/* Card body */}
        <div className={`p-4 md:p-5 flex flex-col ${viewMode === "list" ? "flex-1 min-w-0" : ""}`}>
          <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase hidden md:block">
            {product.categoryLabel}
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
              {product.plyOptions.map((ply) => (
                <span
                  key={ply}
                  className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10"
                >
                  {ply}
                </span>
              ))}
            </div>
            <p className="text-sm text-neutral-600 block md:hidden mt-3">
              3, 5, 7 Plies Available
            </p>
          </div>
          {product.moq && (
            <p className="text-xs text-warm-gray mt-2">
              MOQ: {product.moq}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-kraft/8 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
              View Details
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const pathname = usePathname();
  const pathSlug = pathname.replace(/^\/products\/?/, "") || "";
  const isAllProductsPage = pathname === "/products";
  const isCategoryListingPage =
    pathname.startsWith("/products/") &&
    pathSlug !== "" &&
    isCategoryRouteSlug(pathSlug);
  const currentCategoryId = isCategoryListingPage
    ? getCategoryIdByRouteSlug(pathSlug)
    : undefined;
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [hoveredProductSlug, setHoveredProductSlug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  /** Category-level cards only (one per category) for All Products landing page */
  const categoryCards = productCategories.map((cat) => {
    const firstProduct = getCategoryProducts(cat.id)[0];
    const titleMap: Record<string, string> = {
      "pizza-boxes": "Pizza Box",
      "general-purpose": "A4 Box",
      specialty: "Specialty & Heavy Duty Box",
      ecommerce: "E-Commerce Box",
      "vegetable-boxes": "Vegetable Box",
      "poultry-boxes": "Poultry Box",
    };
    return {
      ...cat,
      firstProduct,
      displayTitle: titleMap[cat.id] ?? cat.label,
      description: firstProduct?.tagline ?? "View sizes and options",
      moq: firstProduct?.moq,
    };
  });

  /** Products in current category (when on category listing page) */
  const categoryProducts =
    currentCategoryId != null ? getCategoryProducts(currentCategoryId) : [];
  const currentCategoryLabel =
    currentCategoryId != null
      ? categories.find((c) => c.id === currentCategoryId)?.label ?? ""
      : "";

  const plyFilters = ["3-Ply", "5-Ply", "7-Ply"];

  /** All Products page only: category card opens first product with switcher (?from=all) */
  const categoryCardHref = (cat: (typeof categoryCards)[0]) =>
    cat.firstProduct
      ? `/products/${cat.firstProduct.slug}?from=all`
      : `/products/${cat.routeSlug}`;

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
              <Link href="/" className="hover:text-kraft-light transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-offwhite">Products</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite tracking-tight leading-[1.08]">
              Packaging
              <br />
              <span className="text-kraft-light">Collection</span>
            </h1>
            <p className="mt-5 text-offwhite/60 text-base md:text-lg max-w-xl leading-relaxed">
              Australian-standard boxes and cartons engineered for performance.
              From pizza boxes to FBA cartons — every box built for your brand.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Package className="w-4 h-4" />
                <span>{productCategories.length} Categories</span>
              </div>
              <div className="w-px h-4 bg-offwhite/15" />
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Layers className="w-4 h-4" />
                <span>3, 5, 7 Ply Options</span>
              </div>
              <div className="w-px h-4 bg-offwhite/15" />
              <div className="flex items-center gap-2 text-offwhite/40 text-sm">
                <Ruler className="w-4 h-4" />
                <span>{products.length} Products</span>
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
              {/* Categories */}
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                  Category
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isAll = cat.id === "all";
                    const isActive = isAll
                      ? isAllProductsPage
                      : isCategoryListingPage && currentCategoryId === cat.id;
                    const href = isAll
                      ? "/products"
                      : `/products/${categoryRouteSlugs[cat.id] ?? cat.id}`;
                    return (
                      <Link
                        key={cat.id}
                        href={href}
                        onClick={() => setMobileFilterOpen(false)}
                        className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-forest text-offwhite shadow-md shadow-forest/15"
                            : "text-charcoal/70 hover:bg-cream/60 hover:text-charcoal"
                        }`}
                      >
                        {cat.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Ply options */}
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-4">
                  Ply Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plyFilters.map((ply) => (
                    <span
                      key={ply}
                      className="px-3 py-1.5 bg-kraft-pale/60 text-kraft text-xs font-semibold rounded-full border border-kraft/10"
                    >
                      {ply}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bulk order CTA */}
              <div className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 text-offwhite">
                <Box className="w-6 h-6 text-kraft-light mb-3" />
                <h4 className="font-bold text-sm mb-2">Need Bulk Orders?</h4>
                <p className="text-offwhite/60 text-xs leading-relaxed mb-4">
                  Get volume pricing for orders above 5,000 units.
                </p>
                <Link
                  href="/#contact"
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
                    {categories.map((cat) => {
                      const isAll = cat.id === "all";
                      const href = isAll ? "/products" : `/products/${categoryRouteSlugs[cat.id] ?? cat.id}`;
                      const isActive = isAll
                        ? isAllProductsPage
                        : isCategoryListingPage && currentCategoryId === cat.id;
                      return (
                        <Link
                          key={cat.id}
                          href={href}
                          onClick={() => setMobileFilterOpen(false)}
                          className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium mb-1 ${
                            isActive ? "bg-forest text-offwhite" : "text-charcoal/70"
                          }`}
                        >
                          {cat.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Right: category cards (All Products) or product grid (category listing) */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-warm-gray">
                {isCategoryListingPage ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-charcoal">
                      {categoryProducts.length}
                    </span>{" "}
                    product{categoryProducts.length !== 1 ? "s" : ""} in{" "}
                    <span className="font-semibold text-charcoal">
                      {currentCategoryLabel}
                    </span>
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-charcoal">
                      {categoryCards.length}
                    </span>{" "}
                    categories
                  </>
                )}
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

            {/* Category cards — All Products only; category card opens first product with switcher */}
            {isAllProductsPage && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-5"
                }
              >
                {categoryCards.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <Link href={categoryCardHref(cat)}>
                      <div
                        className={`group bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 ${
                          viewMode === "list"
                            ? "flex flex-row items-center"
                            : ""
                        }`}
                        onMouseEnter={() => setHoveredCategoryId(cat.id)}
                        onMouseLeave={() => setHoveredCategoryId(null)}
                      >
                        {/* Category visual — use first product in category for 3D box */}
                        <div
                          className={`relative bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center overflow-hidden ${
                            viewMode === "list"
                              ? "w-[200px] h-[160px] flex-shrink-0"
                              : "h-[180px] md:h-[240px]"
                          }`}
                        >
                          <div className="absolute inset-0 corrugated-pattern opacity-20" />
                          {cat.firstProduct && (
                            <Box3D
                              product={cat.firstProduct}
                              hovered={hoveredCategoryId === cat.id}
                            />
                          )}
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
                            {getCategoryProducts(cat.id).length} type{getCategoryProducts(cat.id).length !== 1 ? "s" : ""}
                          </div>
                        </div>

                        {/* Category info */}
                        <div
                          className={`p-4 md:p-5 ${
                            viewMode === "list" ? "flex-1" : ""
                          }`}
                        >
                          <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase hidden md:block">
                            {cat.label}
                          </span>
                          <h3 className="text-sm md:text-base font-bold text-charcoal mt-1.5 tracking-tight group-hover:text-forest transition-colors">
                            {cat.displayTitle}
                          </h3>
                          <p className="text-xs text-warm-gray mt-1.5 leading-relaxed line-clamp-2 hidden md:block">
                            {cat.description}
                          </p>
                          <div className="mt-3">
                            <div className="w-full flex justify-center md:justify-start">
                              <span className="w-fit px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10 whitespace-nowrap">
                                Multiple Sizes Available
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3 flex-wrap hidden md:flex">
                              {plyFilters.map((ply) => (
                                <span
                                  key={ply}
                                  className="px-3 py-1.5 bg-kraft-pale/60 text-charcoal/80 text-xs font-medium rounded-lg border border-kraft/10"
                                >
                                  {ply}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-neutral-600 block md:hidden mt-3">
                              3, 5, 7 Plies Available
                            </p>
                          </div>
                          <p className="text-xs text-warm-gray mt-2">
                            {cat.moq ? `MOQ: ${cat.moq}` : "MOQ: As per requirement"}
                          </p>

                          {/* CTA */}
                          <div className="mt-4 pt-4 border-t border-kraft/8 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
                              View Details
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Category listing — full detailed product cards (same as screenshot) */}
            {isCategoryListingPage && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-5"
                }
              >
                {categoryProducts.map((product, i) => (
                  <motion.div
                    key={product.slug}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <ProductCard
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
                  Need a custom size or specification?
                </h3>
                <p className="text-offwhite/60 mb-6 max-w-lg mx-auto text-sm">
                  We manufacture custom dimensions, special ply configurations, and
                  branded packaging tailored to your exact requirements.
                </p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-colors shadow-lg shadow-kraft/25 text-sm"
                >
                  Request Custom Quote
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
