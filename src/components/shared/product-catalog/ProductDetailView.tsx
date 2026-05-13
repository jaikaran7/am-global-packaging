"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Package,
  Layers,
  Ruler,
  Printer,
  CheckCircle2,
  Phone,
  Mail,
  ChevronLeft,
} from "lucide-react";
import type { Product } from "@/data/products";
import { AccordionSpecs } from "@/components/shared/product-catalog/AccordionSpecs";
import { CatalogTypeSelectorCard } from "@/components/shared/product-catalog/CatalogTypeSelectorCard";
import { DetailBox3D } from "@/components/shared/product-catalog/DetailBox3D";

export type ProductDetailStripItem = {
  key: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  href?: string;
  onClick?: () => void;
};

export type ProductDetailViewProps = {
  product: Product;
  /** Animate right column when variant (or product) identity changes */
  viewTransitionKey?: string;
  homeHref: string;
  productsIndexHref: string;
  stripSectionLabel: string;
  stripItems: ProductDetailStripItem[];
  checkoutHref: string;
  checkoutDisabled?: boolean;
  purchaseInquiryBody: string;
  relatedProducts: Product[];
  relatedProductHref: (slug: string) => string;
  viewAllProductsHref: string;
  viewAllProductsLabel: string;
  backToCatalogHref: string;
  backToCatalogLabel: string;
};

export function ProductDetailView({
  product,
  viewTransitionKey,
  homeHref,
  productsIndexHref,
  stripSectionLabel,
  stripItems,
  checkoutHref,
  checkoutDisabled = false,
  purchaseInquiryBody,
  relatedProducts,
  relatedProductHref,
  viewAllProductsHref,
  viewAllProductsLabel,
  backToCatalogHref,
  backToCatalogLabel,
}: ProductDetailViewProps) {
  const [activeView, setActiveView] = useState(0);
  const motionKey = viewTransitionKey ?? product.slug;

  useEffect(() => {
    setActiveView(0);
  }, [product.slug, motionKey]);

  const galleryImages = product.images;

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-white border-b border-kraft/8">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-4">
          <div className="flex items-center gap-2 text-sm text-warm-gray">
            <Link href={homeHref} className="hover:text-charcoal transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={productsIndexHref} className="hover:text-charcoal transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium">{product.shortName}</span>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 pt-10 pb-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-start">
          <div className="relative lg:sticky lg:top-28 w-full min-w-0">
            <div className="bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 rounded-3xl overflow-hidden relative min-h-[300px] md:min-h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 corrugated-pattern opacity-20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={product.slug + activeView}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  drag={galleryImages && galleryImages.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_e, { offset }) => {
                    const swipe = offset.x;
                    if (swipe < -40 && galleryImages) {
                      setActiveView((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1
                      );
                    } else if (swipe > 40 && galleryImages) {
                      setActiveView((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1
                      );
                    }
                  }}
                  className="w-full h-full flex items-center justify-center min-h-[300px] touch-pan-y"
                >
                  {galleryImages ? (
                    <div className="relative w-full h-full flex items-center justify-center p-6 md:p-8">
                      <img
                        src={galleryImages[activeView] || galleryImages[0]}
                        alt={`${product.name} view ${activeView + 1}`}
                        className="max-w-full max-h-[360px] object-contain drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    <DetailBox3D size={product.dimensionDetail} activeView={activeView} />
                  )}
                </motion.div>
              </AnimatePresence>

              {galleryImages && galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveView((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1
                      )
                    }
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-[#e85d04] hover:text-[#d05000] hover:scale-110 transition-all z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveView((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-[#e85d04] hover:text-[#d05000] hover:scale-110 transition-all z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
                  </button>
                </>
              )}

              {galleryImages && galleryImages.length > 1 && (
                <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveView(idx)}
                      role="tab"
                      aria-selected={activeView === idx}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        activeView === idx
                          ? "bg-charcoal w-4 scale-100 opacity-90"
                          : "bg-charcoal/30 w-2 scale-90"
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="absolute top-5 right-5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-kraft/10 z-20">
                <span className="text-[10px] font-bold text-kraft tracking-wide">
                  {product.dimensions}
                </span>
              </div>
            </div>

            {galleryImages && galleryImages.length > 0 && (
              <div className="hidden md:flex mt-4 gap-3 overflow-x-auto pb-2 scrollbar-none">
                {galleryImages.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveView(idx)}
                    className={`relative w-[70px] h-[70px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm flex items-center justify-center ${
                      activeView === idx
                        ? "border-[#e85d04] opacity-100"
                        : "border-kraft/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {stripItems.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-warm-gray uppercase tracking-[0.15em] mb-3">
                  {stripSectionLabel}
                </p>
                <div
                  className={`flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-none md:grid md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 max-w-[100vw] ${
                    stripItems.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4"
                  }`}
                >
                  {stripItems.map((item) => (
                    <CatalogTypeSelectorCard
                      key={item.key}
                      title={item.title}
                      subtitle={item.subtitle}
                      isActive={item.isActive}
                      href={item.href}
                      onClick={item.onClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={motionKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-kraft-pale/60 text-kraft text-[10px] font-bold tracking-[0.15em] rounded-full uppercase">
                    {product.categoryLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-forest font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {product.availability.split("—")[0]}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight leading-[1.12]">
                  {product.name}
                </h1>
                <p className="text-base text-warm-gray mt-3 leading-relaxed">{product.tagline}</p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Ruler className="w-3.5 h-3.5 text-kraft" />
                    <span className="text-xs font-medium text-charcoal">{product.dimensions}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Layers className="w-3.5 h-3.5 text-forest" />
                    <span className="text-xs font-medium text-charcoal">
                      {product.plyOptions.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Printer className="w-3.5 h-3.5 text-kraft" />
                    <span className="text-xs font-medium text-charcoal">
                      {product.printOptions.split(",")[0]}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-kraft/10 my-8" />

                <div className="mb-8">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-3">
                    About this product
                  </h3>
                  <p className="text-sm text-warm-gray leading-[1.8]">{product.description}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-4">
                    Key Features
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {product.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 py-2">
                        <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-charcoal/80">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <AccordionSpecs
                  specs={[
                    ...product.specs,
                    { label: "Material", value: product.material },
                    { label: "GSM Range", value: product.gsmRange },
                  ]}
                />

                <div className="mb-8">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-4">
                    Ideal For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.useCases.map((uc) => (
                      <span
                        key={uc}
                        className="px-3.5 py-2 bg-forest/5 text-forest text-xs font-medium rounded-full border border-forest/10"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-kraft/10 my-8" />

                <section
                  id="purchase-inquiry"
                  aria-labelledby="purchase-inquiry-heading"
                  className="rounded-2xl border border-kraft/12 bg-offwhite shadow-sm shadow-kraft/5 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-forest to-forest-light px-4 md:px-6 py-5 text-offwhite">
                    <h3 id="purchase-inquiry-heading" className="text-lg font-bold">
                      Purchase inquiry — {product.shortName}
                    </h3>
                    <p className="text-offwhite/70 text-sm mt-1.5 leading-relaxed">
                      {purchaseInquiryBody}
                    </p>
                  </div>
                  <div className="px-4 sm:px-6 py-8 md:py-10 flex flex-col sm:flex-row sm:items-center gap-4">
                    {!checkoutDisabled ? (
                      <Link
                        href={checkoutHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-offwhite px-8 py-3.5 text-sm font-semibold text-forest hover:bg-kraft-light/30 transition-colors shadow-md"
                      >
                        Go to checkout
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 rounded-full bg-kraft/10 px-8 py-3.5 text-sm font-semibold text-warm-gray cursor-not-allowed select-none shadow-sm">
                        Go to checkout
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </span>
                    )}
                    <p className="text-sm text-warm-gray max-w-md">
                      You will leave this page and can return here anytime from the product catalogue.
                    </p>
                  </div>
                </section>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 text-sm text-warm-gray">
                  <span>Need help?</span>
                  <a
                    href="tel:+611234567890"
                    className="inline-flex items-center gap-1.5 text-forest font-medium hover:text-kraft transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Sales
                  </a>
                  <a
                    href="mailto:enquiries@amglobalpackagingsolutions.com"
                    className="inline-flex items-center gap-1.5 text-forest font-medium hover:text-kraft transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Us
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-kraft/10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px bg-kraft" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-kraft uppercase">
                    Related Products
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
                  You may also need
                </h2>
              </div>
              <Link
                href={viewAllProductsHref}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors"
              >
                {viewAllProductsLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <motion.div
                  key={rp.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
                >
                  <Link href={relatedProductHref(rp.slug)}>
                    <div className="group bg-white rounded-2xl border border-kraft/8 overflow-hidden hover:shadow-lg hover:border-kraft/20 transition-all">
                      <div className="h-[180px] bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center relative">
                        <div className="absolute inset-0 corrugated-pattern opacity-15" />
                        <Package className="w-12 h-12 text-kraft/40" />
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase">
                          {rp.categoryLabel}
                        </span>
                        <h3 className="text-base font-bold text-charcoal mt-1.5 group-hover:text-forest transition-colors">
                          {rp.shortName}
                        </h3>
                        <p className="text-xs text-warm-gray mt-1">{rp.dimensions}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
                          View Details
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link
            href={backToCatalogHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backToCatalogLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
