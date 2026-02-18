"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Package,
  Truck,
  ShieldCheck,
  Layers,
  Ruler,
  Printer,
  CheckCircle2,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import type { Product } from "@/data/products";
import { getRelatedProducts, getCategoryProducts } from "@/data/products";

// ─── 3-D box render ──────────────────────────────────────────────────────────
function DetailBox3D({
  size,
  activeView,
}: {
  size: { length: number; width: number; height: number };
  activeView: number;
}) {
  const scale = size.length / 400;
  const w = 200 * scale + 80;
  const h = 170 * scale + 60;
  const depth = size.height * 1.5 + 30;

  const isOpen = activeView === 1;
  const isExploded = activeView === 2;

  return (
    <div
      className="relative flex items-center justify-center h-full"
      style={{ perspective: "800px" }}
    >
      <motion.div
        animate={{
          rotateX: isExploded ? -15 : -10,
          rotateY: isOpen ? -25 : -20,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face */}
        <motion.div
          className="rounded-lg relative"
          style={{
            width: `${w}px`,
            height: `${h}px`,
            background:
              "linear-gradient(145deg, #C4973B 0%, #A67B1E 50%, #8B6914 100%)",
            transform: `translateZ(${depth / 2}px)`,
            boxShadow:
              "0 20px 50px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 7px)",
            }}
          />
          <div className="absolute inset-4 md:inset-6 border border-white/10 rounded flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 border border-white/15 rounded-md flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-white/60 text-[9px] tracking-[0.25em] uppercase font-medium">
              AM Global
            </div>
            <div className="w-10 h-px bg-white/15" />
            <div className="text-white/35 text-[7px] tracking-widest uppercase">
              {size.length} x {size.width} mm
            </div>
          </div>
        </motion.div>

        {/* Top face / lid */}
        <motion.div
          className="absolute origin-bottom"
          style={{
            width: `${w}px`,
            height: `${depth}px`,
            background: "linear-gradient(180deg, #DDB84D 0%, #C4973B 100%)",
            top: `-${depth}px`,
            left: 0,
          }}
          animate={{
            rotateX: isOpen ? 60 : 90,
            y: isExploded ? -30 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.08) 7px, rgba(0,0,0,0.08) 8px)",
            }}
          />
        </motion.div>

        {/* Right face */}
        <div
          className="absolute top-0 origin-left"
          style={{
            width: `${depth}px`,
            height: `${h}px`,
            background: "linear-gradient(90deg, #A67B1E 0%, #8B6914 100%)",
            left: `${w}px`,
            transform: "rotateY(90deg)",
            boxShadow: "inset 1px 0 8px rgba(0,0,0,0.12)",
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

        {/* Ply layer lines — exploded view */}
        {isExploded && (
          <>
            {[0, 1, 2].map((layer) => (
              <motion.div
                key={layer}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 0.7, y: (layer + 1) * 18 }}
                transition={{ delay: layer * 0.1, duration: 0.6 }}
                className="absolute left-0"
                style={{
                  width: `${w}px`,
                  height: "4px",
                  bottom: `-${20 + layer * 4}px`,
                  background:
                    layer % 2 === 0
                      ? "linear-gradient(90deg, #C4973B, #A67B1E)"
                      : "linear-gradient(90deg, #DDB84D, #C4973B)",
                  borderRadius: "1px",
                  transform: `translateZ(${depth / 2}px)`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </>
        )}

        {/* Shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black/10 blur-xl rounded-[50%]"
          style={{
            width: `${w * 0.7}px`,
            height: "12px",
            bottom: isExploded ? "-70px" : "-20px",
            transform: `translateX(-50%) translateZ(-${depth}px)`,
          }}
        />
      </motion.div>

      {/* Exploded labels */}
      {isExploded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 border border-kraft/10 shadow-sm">
            <span className="text-[10px] font-semibold text-kraft">Liner</span>
            <div className="w-3 h-0.5 bg-kraft/30" />
            <span className="text-[10px] font-semibold text-forest">Flute</span>
            <div className="w-3 h-0.5 bg-kraft/30" />
            <span className="text-[10px] font-semibold text-kraft">Liner</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Product-type selector card (category products below image) ──────────────
function ProductTypeCard({
  product,
  isActive,
  onClick,
  href,
}: {
  product: Product;
  isActive: boolean;
  onClick: () => void;
  href?: string;
}) {
  const label =
    product.shortName
      .replace(/A4 Box /i, "")
      .replace(/Pizza Box/i, "")
      .replace(/Carton/i, "")
      .replace(/Box/i, "")
      .trim() || product.shortName;
  const className = `flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all duration-300 ${
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
        {label}
      </span>
      <span className="text-[9px] text-warm-gray leading-tight">
        {product.dimensionDetail.length}×{product.dimensionDetail.width} mm
      </span>
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

// ─── Accordion specs ──────────────────────────────────────────────────────────
function AccordionSpecs({ specs }: { specs: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const PREVIEW = 3;
  const visible = open ? specs : specs.slice(0, PREVIEW);
  const hasMore = specs.length > PREVIEW;

  return (
    <div className="bg-white rounded-2xl border border-kraft/10 p-6 mb-8">
      <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-5">
        Technical Specifications
      </h3>
      <div className="space-y-0">
        {visible.map((spec, i) => (
          <div
            key={spec.label}
            className={`flex items-center justify-between py-3.5 ${
              i < visible.length - 1 ? "border-b border-kraft/8" : ""
            }`}
          >
            <span className="text-sm text-warm-gray">{spec.label}</span>
            <span className="text-sm font-semibold text-charcoal">{spec.value}</span>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-kraft transition-colors w-full justify-center py-2 border-t border-kraft/8"
        >
          {open ? "Show less" : `Show ${specs.length - PREVIEW} more`}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetailPage({ product: initialProduct }: { product: Product }) {
  const searchParams = useSearchParams();
  const fromAll = searchParams.get("from") === "all";

  // When coming from All Products, allow switching between products in the same category
  const categoryProducts = getCategoryProducts(initialProduct.category);
  const [activeProductSlug, setActiveProductSlug] = useState(initialProduct.slug);

  // Active product — either the initial one (direct nav) or the selected one (from=all)
  const product = fromAll
    ? (categoryProducts.find((p) => p.slug === activeProductSlug) ?? initialProduct)
    : initialProduct;

  const [activeView, setActiveView] = useState(0);
  const [quantity, setQuantity] = useState(product.moq.replace(/\D/g, ""));
  const relatedProducts = getRelatedProducts(product.relatedSlugs);
  const viewOptions = ["Closed", "Open", "Ply Layers"];

  // Reset view when product changes in "from=all" mode
  const handleProductSwitch = (slug: string) => {
    setActiveProductSlug(slug);
    setActiveView(0);
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-kraft/8">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-4">
          <div className="flex items-center gap-2 text-sm text-warm-gray">
            <Link href="/" className="hover:text-charcoal transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href="/products"
              className="hover:text-charcoal transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium">{product.shortName}</span>
          </div>
        </div>
      </div>

      {/* Main product section */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 pt-10 pb-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-start">
          {/* ── Left: Product gallery ── */}
          <div className="sticky top-28">
            <div className="bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 rounded-3xl overflow-hidden relative min-h-[400px] md:min-h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 corrugated-pattern opacity-20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={product.slug + activeView}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full flex items-center justify-center min-h-[400px]"
                >
                  <DetailBox3D
                    size={product.dimensionDetail}
                    activeView={activeView}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Small Closed / Open / Ply Layers toggle — always present */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-md rounded-full p-1 border border-kraft/10 shadow-md">
                {viewOptions.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setActiveView(i)}
                    className={`px-4 py-2 text-[11px] font-semibold rounded-full transition-all duration-300 ${
                      activeView === i
                        ? "bg-forest text-offwhite shadow-sm"
                        : "text-warm-gray hover:text-charcoal"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Size badge */}
              <div className="absolute top-5 right-5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-kraft/10">
                <span className="text-[10px] font-bold text-kraft tracking-wide">
                  {product.dimensions}
                </span>
              </div>
            </div>

            {/* ── Category product cards — always show (same UI whether from All Products or category/direct) ── */}
            <div className="mt-4">
              <p className="text-[10px] font-bold text-warm-gray uppercase tracking-[0.15em] mb-3">
                {product.categoryLabel} — Select Type
              </p>
              <div
                className={`grid gap-2 ${
                  categoryProducts.length <= 3 ? "grid-cols-3" : "grid-cols-4"
                }`}
              >
                {categoryProducts.map((p) => {
                  const isActive = p.slug === activeProductSlug;
                  return (
                    <ProductTypeCard
                      key={p.slug}
                      product={p}
                      isActive={isActive}
                      onClick={() => handleProductSwitch(p.slug)}
                      href={
                        fromAll && categoryProducts.length > 1
                          ? undefined
                          : `/products/${p.slug}`
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Product details ── */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {/* Category & availability */}
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
                <p className="text-base text-warm-gray mt-3 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Quick specs row */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Ruler className="w-3.5 h-3.5 text-kraft" />
                    <span className="text-xs font-medium text-charcoal">
                      {product.dimensions}
                    </span>
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

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-3">
                    About this product
                  </h3>
                  <p className="text-sm text-warm-gray leading-[1.8]">
                    {product.description}
                  </p>
                </div>

                {/* Features grid */}
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

                {/* Technical specifications — accordion */}
                <AccordionSpecs
                  specs={[
                    ...product.specs,
                    { label: "Material", value: product.material },
                    { label: "GSM Range", value: product.gsmRange },
                  ]}
                />

                {/* Use cases */}
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

                {/* Pricing */}
                {(product.priceAud || product.pricingTiers) && (
                  <div className="mb-8 bg-kraft-pale/30 rounded-2xl border border-kraft/10 p-6">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-4">
                      Pricing
                    </h3>
                    {product.priceAud && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-forest">
                          ${product.priceAud.toFixed(2)}
                        </span>
                        <span className="text-sm text-warm-gray">AUD / unit</span>
                      </div>
                    )}
                    {product.pricingTiers && (
                      <div className="space-y-3">
                        {product.pricingTiers.map((tier) => (
                          <div
                            key={tier.label}
                            className="flex items-center justify-between py-2 border-b border-kraft/8 last:border-0"
                          >
                            <span className="text-sm text-warm-gray">{tier.label}</span>
                            <span className="text-lg font-bold text-forest">
                              ${tier.priceAud.toFixed(2)}
                              <span className="text-xs font-normal text-warm-gray ml-1">
                                / unit
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="h-px bg-kraft/10 my-8" />

                {/* Quote CTA */}
                <div className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 md:p-8 text-offwhite">
                  <h3 className="text-lg font-bold mb-4">
                    Request a Quote for {product.shortName}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-offwhite/50 text-xs mb-1.5 block">
                        Quantity (units)
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={parseInt(product.moq)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-offwhite text-sm placeholder:text-offwhite/30 focus:outline-none focus:border-kraft-light/50"
                        placeholder={`Min. ${product.moq}`}
                      />
                    </div>
                    <div>
                      <label className="text-offwhite/50 text-xs mb-1.5 block">
                        Preferred Ply
                      </label>
                      <select className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-offwhite text-sm focus:outline-none focus:border-kraft-light/50 appearance-none">
                        {product.plyOptions.map((ply) => (
                          <option key={ply} value={ply} className="text-charcoal">
                            {ply}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button className="w-full py-3.5 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-colors shadow-lg shadow-kraft/25 text-sm mb-4">
                    Request Quote
                  </button>

                  <div className="flex items-center justify-center gap-6 text-offwhite/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        {product.availability.split("—")[1]?.trim() || "Fast shipping"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Food-grade certified</span>
                    </div>
                  </div>
                </div>

                {/* Direct contact */}
                <div className="flex items-center gap-6 mt-6 text-sm text-warm-gray">
                  <span>Need help?</span>
                  <a
                    href="tel:+611234567890"
                    className="inline-flex items-center gap-1.5 text-forest font-medium hover:text-kraft transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Sales
                  </a>
                  <a
                    href="mailto:sales@amglobal.com.au"
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

        {/* Related products */}
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
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors"
              >
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp, i) => (
                <motion.div
                  key={rp.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/products/${rp.slug}`}>
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

        {/* Back button */}
        <div className="mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
