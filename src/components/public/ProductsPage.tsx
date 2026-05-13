"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ChevronRight,
  ArrowRight,
  Grid3X3,
  LayoutList,
  Box,
  Ruler,
  Layers,
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
import { ProductsCatalogChrome } from "@/components/shared/product-catalog/ProductsCatalogChrome";
import {
  CatalogProductCard,
  CatalogProductVisual,
} from "@/components/shared/product-catalog/CatalogProductCard";

const BOXES_PRODUCTS_BASE = "/boxes/products";

export default function ProductsPage() {
  const pathname = usePathname();
  const pathSlug = pathname.replace(new RegExp(`^${BOXES_PRODUCTS_BASE}/?`), "") || "";
  const isAllProductsPage =
    pathname === BOXES_PRODUCTS_BASE || pathname === `${BOXES_PRODUCTS_BASE}/`;
  const isCategoryListingPage =
    pathname.startsWith(`${BOXES_PRODUCTS_BASE}/`) &&
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

  const categoryProducts =
    currentCategoryId != null ? getCategoryProducts(currentCategoryId) : [];
  const currentCategoryLabel =
    currentCategoryId != null
      ? categories.find((c) => c.id === currentCategoryId)?.label ?? ""
      : "";

  const plyFilters = ["3-Ply", "5-Ply", "7-Ply"];

  const categoryCardHref = (cat: (typeof categoryCards)[0]) =>
    cat.firstProduct
      ? `${BOXES_PRODUCTS_BASE}/${cat.firstProduct.slug}?from=all`
      : `${BOXES_PRODUCTS_BASE}/${cat.routeSlug}`;

  const sidebarCategoryLinks = (onNavigate?: () => void) => (
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
            ? BOXES_PRODUCTS_BASE
            : `${BOXES_PRODUCTS_BASE}/${categoryRouteSlugs[cat.id] ?? cat.id}`;
          return (
            <Link
              key={cat.id}
              href={href}
              onClick={onNavigate}
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
  );

  const sidebarPly = (
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
  );

  const sidebarCta = (
    <div className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 text-offwhite">
      <Box className="w-6 h-6 text-kraft-light mb-3" />
      <h4 className="font-bold text-sm mb-2">Need Bulk Orders?</h4>
      <p className="text-offwhite/60 text-xs leading-relaxed mb-4">
        Get volume pricing for orders above 5,000 units.
      </p>
      <Link
        href="/boxes/contact"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-kraft-light hover:text-kraft-lighter transition-colors"
      >
        Request Quote
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );

  const sidebarDesktop = (
    <>
      {sidebarCategoryLinks(() => setMobileFilterOpen(false))}
      {sidebarPly}
      {sidebarCta}
    </>
  );

  const sidebarMobile = (
    <div className="space-y-6">
      <div>
        <h4 className="text-[11px] font-bold tracking-[0.2em] text-warm-gray uppercase mb-3">
          Category
        </h4>
        {categories.map((cat) => {
          const isAll = cat.id === "all";
          const href = isAll
            ? BOXES_PRODUCTS_BASE
            : `${BOXES_PRODUCTS_BASE}/${categoryRouteSlugs[cat.id] ?? cat.id}`;
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
  );

  const heroStats = (
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
  );

  const toolbarSummary = (
    <>
      <p className="text-sm text-warm-gray">
        {isCategoryListingPage ? (
          <>
            Showing{" "}
            <span className="font-semibold text-charcoal">{categoryProducts.length}</span>{" "}
            product{categoryProducts.length !== 1 ? "s" : ""} in{" "}
            <span className="font-semibold text-charcoal">{currentCategoryLabel}</span>
          </>
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-charcoal">{categoryCards.length}</span> categories
          </>
        )}
      </p>
      <div className="hidden sm:flex items-center gap-1 bg-white border border-kraft/10 rounded-lg p-1">
        <button
          type="button"
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
          type="button"
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
    </>
  );

  return (
    <ProductsCatalogChrome
      homeHref="/boxes/home"
      headerRef={headerRef}
      headerInView={headerInView}
      breadcrumbCurrentLabel="Products"
      heroTitleLine1="Packaging"
      heroTitleLine2="Collection"
      heroDescription="Australian-standard boxes and cartons engineered for performance. From pizza boxes to FBA cartons — every box built for your brand."
      heroStats={heroStats}
      sidebarDesktop={sidebarDesktop}
      sidebarMobile={sidebarMobile}
      mobileFilterOpen={mobileFilterOpen}
      setMobileFilterOpen={setMobileFilterOpen}
      toolbarSummary={toolbarSummary}
      bottomCtaTitle="Need a custom size or specification?"
      bottomCtaDescription="We manufacture custom dimensions, special ply configurations, and branded packaging tailored to your exact requirements."
      bottomCtaHref="/boxes/contact"
      bottomCtaButtonLabel="Request Custom Quote"
    >
      {isAllProductsPage && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-5"
          }
        >
          {categoryCards.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
            >
              <Link href={categoryCardHref(cat)}>
                <div
                  className={`group bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 ${
                    viewMode === "list" ? "flex flex-row items-center" : ""
                  }`}
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  <div
                    className={`relative bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center overflow-hidden ${
                      viewMode === "list" ? "w-[200px] h-[160px] flex-shrink-0" : "h-[180px] md:h-[240px]"
                    }`}
                  >
                    <div className="absolute inset-0 corrugated-pattern opacity-20" />
                    {cat.firstProduct && (
                      <CatalogProductVisual
                        product={cat.firstProduct}
                        hovered={hoveredCategoryId === cat.id}
                      />
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
                      {getCategoryProducts(cat.id).length} type
                      {getCategoryProducts(cat.id).length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className={`p-4 md:p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
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

      {isCategoryListingPage && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-5"
          }
        >
          {categoryProducts.map((product) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
            >
              <CatalogProductCard
                product={product}
                hovered={hoveredProductSlug === product.slug}
                onMouseEnter={() => setHoveredProductSlug(product.slug)}
                onMouseLeave={() => setHoveredProductSlug(null)}
                viewMode={viewMode}
                productHref={`${BOXES_PRODUCTS_BASE}/${product.slug}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </ProductsCatalogChrome>
  );
}
