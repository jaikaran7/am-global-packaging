"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Layers,
  Ruler,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Phone,
  Mail,
} from "lucide-react";
import { productDetailContent } from "@/content/papers-home/productDetailContent";

type ApiVariant = {
  id: string;
  name: string;
  price: number;
  gsm: number | null;
  currency: string;
  tax_rate_percent: number | null;
  stock: number;
  is_available?: boolean;
  size_label: string | null;
};

type ApiProduct = {
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  variants: ApiVariant[];
  images: { url: string; is_primary: boolean }[];
  gsm_options: number[];
  feature_badges: string[];
  paper_type: string | null;
  size_label: string | null;
  dimensions_label: string | null;
  use_cases: string[];
};

type RelatedCard = {
  slug: string;
  title: string;
  short_description: string | null;
  primary_image_url: string | null;
  paper_type: string | null;
};

interface Props {
  slug: string;
}

function AccordionSpecs({ specs }: { specs: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const PREVIEW = 4;
  const visible = open ? specs : specs.slice(0, PREVIEW);
  const hasMore = specs.length > PREVIEW;

  return (
    <div className="bg-white rounded-2xl border border-kraft/10 p-4 md:p-6 mb-8">
      <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-5">
        Technical Specifications
      </h3>
      <div className="space-y-0">
        {visible.map((spec, i) => (
          <div
            key={spec.label}
            className={`grid grid-cols-[1fr_auto] items-start gap-3 md:flex md:items-center md:justify-between py-2.5 md:py-3.5 ${
              i < visible.length - 1 ? "border-b border-kraft/8" : ""
            }`}
          >
            <span className="text-xs md:text-sm text-warm-gray">{spec.label}</span>
            <span className="text-xs md:text-sm font-semibold text-charcoal text-right md:text-left break-words">
              {spec.value}
            </span>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
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

export default function PapersProductDetail({ slug }: Readonly<Props>) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<RelatedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/papers/products/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(typeof j?.error === "string" ? j.error : "Product not found");
        }
        return r.json();
      })
      .then((data: ApiProduct) => {
        if (cancelled) return;
        setProduct(data);
        const first = data.variants?.[0];
        setSelectedVariantId(first?.id ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/papers/products`)
      .then((r) => r.json())
      .then((json: { items?: RelatedCard[] }) => {
        if (cancelled) return;
        const items = json.items ?? [];
        setRelated(items.filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  }, [product, selectedVariantId]);

  const imageUrls = useMemo(() => {
    if (!product?.images?.length) return [];
    const sorted = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    return sorted.map((i) => i.url).filter(Boolean);
  }, [product]);

  const fallbackImg =
    product?.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png";

  const displayImages = imageUrls.length ? imageUrls : [fallbackImg];

  const gsmDesc =
    selectedVariant?.gsm != null
      ? productDetailContent.gsmDescriptions[
          selectedVariant.gsm as keyof typeof productDetailContent.gsmDescriptions
        ] ?? ""
      : "";

  const typeKey = product?.paper_type === "marble" ? "marble" : "cotton";

  const gstPct = selectedVariant?.tax_rate_percent ?? 10;
  const unitBase = selectedVariant?.price ?? 0;
  const withGst = Math.round(unitBase * (1 + gstPct / 100) * 100) / 100;

  const canCheckout =
    selectedVariant != null &&
    (selectedVariant.is_available !== false) &&
    selectedVariant.stock > 0;

  if (loading) {
    return (
      <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased pt-24 md:pt-28 min-h-[50vh] flex items-center justify-center">
        <p className="text-sm text-[#8a8680]">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased pt-24 md:pt-28 px-6">
        <p className="text-center text-red-600 text-sm">{error ?? "Product unavailable."}</p>
        <div className="text-center mt-4">
          <Link href="/papers/products" className="text-[#7d6a4c] text-sm font-semibold hover:underline">
            Back to papers
          </Link>
        </div>
      </div>
    );
  }

  const features =
    product.feature_badges?.length > 0 ? product.feature_badges : [];
  const gsmValue =
    selectedVariant?.gsm != null
      ? `${selectedVariant.gsm} GSM`
      : product.gsm_options.length > 0
      ? `${Math.min(...product.gsm_options)}-${Math.max(...product.gsm_options)} GSM`
      : "N/A";
  const technicalSpecs: { label: string; value: string }[] = [
    { label: "Paper Type", value: productDetailContent.typeLabels[typeKey] },
    { label: "Size", value: product.size_label ?? "N/A" },
    { label: "Dimensions", value: product.dimensions_label ?? "N/A" },
    { label: "GSM", value: gsmValue },
    { label: "Variant", value: selectedVariant?.name ?? "N/A" },
    { label: "Stock", value: selectedVariant ? String(selectedVariant.stock) : "N/A" },
    { label: "Tax Rate", value: `${gstPct}% GST` },
  ];

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-white border-b border-kraft/8">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-4">
          <div className="flex items-center gap-2 text-sm text-warm-gray">
            <Link href="/papers/home" className="hover:text-charcoal transition-colors">
              {productDetailContent.breadcrumb.home}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/papers/products" className="hover:text-charcoal transition-colors">
              {productDetailContent.breadcrumb.products}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium">{product.title}</span>
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
                  key={`${product.slug}-${activeImage}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  drag={displayImages.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset }) => {
                    const swipe = offset.x;
                    if (swipe < -40 && displayImages.length > 1) {
                      setActiveImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
                    } else if (swipe > 40 && displayImages.length > 1) {
                      setActiveImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                    }
                  }}
                  className="w-full h-full flex items-center justify-center min-h-[300px] touch-pan-y p-6 md:p-8"
                >
                  <img
                    src={displayImages[activeImage] ?? fallbackImg}
                    alt={`${product.title} view ${activeImage + 1}`}
                    className="max-w-full max-h-[360px] object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>

              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-[#e85d04] hover:text-[#d05000] hover:scale-110 transition-all z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-[#e85d04] hover:text-[#d05000] hover:scale-110 transition-all z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
                  </button>
                </>
              )}

              {displayImages.length > 1 && (
                <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {displayImages.map((_, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeImage === idx ? "bg-charcoal w-4 scale-100 opacity-90" : "bg-charcoal/30 w-2 scale-90"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="absolute top-5 right-5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-kraft/10 z-20">
                <span className="text-[10px] font-bold text-kraft tracking-wide">
                  {product.dimensions_label ?? product.size_label ?? "N/A"}
                </span>
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="hidden md:flex mt-4 gap-3 overflow-x-auto pb-2 scrollbar-none">
                {displayImages.map((imgSrc, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-[70px] h-[70px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm flex items-center justify-center ${
                      activeImage === idx ? "border-[#e85d04] opacity-100" : "border-kraft/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <p className="text-[10px] font-bold text-warm-gray uppercase tracking-[0.15em] mb-3">
                Select Variant
              </p>
              <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-none md:grid md:grid-cols-3 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 max-w-[100vw]">
                {product.variants.map((v) => {
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`flex shrink-0 w-[130px] md:w-auto snap-center flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all duration-300 h-full ${
                        isActive
                          ? "border-forest bg-forest/5 shadow-md"
                          : "border-kraft/15 bg-white hover:border-kraft/30 hover:bg-kraft-pale/20"
                      }`}
                    >
                      <span className={`text-[11px] font-bold leading-tight ${isActive ? "text-forest" : "text-charcoal/70"}`}>
                        {v.name}
                      </span>
                      <span className="text-[9px] text-warm-gray leading-tight">
                        {v.gsm != null ? `${v.gsm} GSM` : "GSM N/A"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {gsmDesc && <p className="mt-2 text-xs text-warm-gray leading-relaxed">{gsmDesc}</p>}
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-kraft-pale/60 text-kraft text-[10px] font-bold tracking-[0.15em] rounded-full uppercase">
                    {productDetailContent.typeLabels[typeKey]}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-forest font-medium">
                    <div className={`w-1.5 h-1.5 rounded-full ${canCheckout ? "bg-green-500 animate-pulse" : "bg-kraft/40"}`} />
                    {canCheckout ? "Available" : "Out of stock"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight leading-[1.12]">
                  {product.title}
                </h1>
                <p className="text-base text-warm-gray mt-3 leading-relaxed">
                  {product.short_description ?? product.description ?? ""}
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Ruler className="w-3.5 h-3.5 text-kraft" />
                    <span className="text-xs font-medium text-charcoal">{product.dimensions_label ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Layers className="w-3.5 h-3.5 text-forest" />
                    <span className="text-xs font-medium text-charcoal">{gsmValue}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-kraft/8">
                    <Package className="w-3.5 h-3.5 text-kraft" />
                    <span className="text-xs font-medium text-charcoal">{product.size_label ?? "N/A"}</span>
                  </div>
                </div>

                <div className="h-px bg-kraft/10 my-8" />

                {selectedVariant && (
                  <div className="mb-8 bg-white rounded-2xl border border-kraft/10 p-4 md:p-6">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-3">
                      Price Details
                    </h3>
                    <div className="flex flex-wrap justify-between gap-2 items-baseline">
                      <span className="text-xs text-warm-gray">Price (excl. GST)</span>
                      <span className="text-lg font-bold text-charcoal">
                        ${unitBase.toFixed(2)} {selectedVariant.currency || "AUD"}
                      </span>
                    </div>
                    <p className="text-xs text-warm-gray mt-2">
                      + {gstPct}% GST -> <strong>${withGst.toFixed(2)}</strong> per unit (AUD)
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-3">
                    About this product
                  </h3>
                  <p className="text-sm text-warm-gray leading-[1.8]">
                    {product.description ?? product.short_description ?? ""}
                  </p>
                </div>

                {features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-4">
                      {productDetailContent.labels.features}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5 py-2">
                          <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-charcoal/80">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <AccordionSpecs specs={technicalSpecs} />

                {product.use_cases.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-4">
                      {productDetailContent.labels.useCases}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.use_cases.map((uc) => (
                        <span
                          key={uc}
                          className="px-3.5 py-2 bg-forest/5 text-forest text-xs font-medium rounded-full border border-forest/10"
                        >
                          {uc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-kraft/10 my-8" />

                <section className="rounded-2xl border border-kraft/12 bg-offwhite shadow-sm shadow-kraft/5 overflow-hidden">
                  <div className="bg-gradient-to-br from-forest to-forest-light px-4 md:px-6 py-5 text-offwhite">
                    <h3 className="text-lg font-bold">Purchase inquiry — {product.title}</h3>
                    <p className="text-offwhite/70 text-sm mt-1.5 leading-relaxed">
                      Continue to checkout to confirm variant and quantity. Final pricing is confirmed by our team.
                    </p>
                  </div>
                  <div className="px-4 sm:px-6 py-8 md:py-10 flex flex-col sm:flex-row sm:items-center gap-4">
                    {canCheckout && selectedVariant ? (
                      <Link
                        href={`/papers/checkout?slug=${encodeURIComponent(product.slug)}&variant=${encodeURIComponent(selectedVariant.id)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-offwhite px-8 py-3.5 text-sm font-semibold text-forest hover:bg-kraft-light/30 transition-colors shadow-md"
                      >
                        {productDetailContent.actions.checkout}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 rounded-full bg-kraft/15 px-8 py-3.5 text-sm font-semibold text-kraft/50 cursor-not-allowed select-none">
                        {productDetailContent.actions.checkout}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                    <p className="text-sm text-warm-gray max-w-md">
                      You will leave this page and can return here anytime from the product catalogue.
                    </p>
                  </div>
                </section>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 text-sm text-warm-gray">
                  <span>Need help?</span>
                  <Link
                    href={
                      selectedVariant
                        ? `/papers/contact?slug=${encodeURIComponent(product.slug)}&variant=${selectedVariant.id}`
                        : `/papers/contact?slug=${encodeURIComponent(product.slug)}`
                    }
                    className="inline-flex items-center gap-1.5 text-forest font-medium hover:text-kraft transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Sales
                  </Link>
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

        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-kraft/10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px bg-kraft" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-kraft uppercase">
                    {productDetailContent.labels.relatedProducts}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
                  You may also need
                </h2>
              </div>
              <Link
                href="/papers/products"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors"
              >
                {productDetailContent.actions.viewAllPapers}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => {
                const img =
                  rel.primary_image_url ??
                  (rel.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png");
                return (
                  <motion.div
                    key={rel.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <Link href={`/papers/product/${rel.slug}`}>
                      <div className="group bg-white rounded-2xl border border-kraft/8 overflow-hidden hover:shadow-lg hover:border-kraft/20 transition-all">
                        <div className="h-[180px] bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center relative">
                          <div className="absolute inset-0 corrugated-pattern opacity-15" />
                          <img src={img} alt={rel.title} className="max-w-[80%] max-h-[80%] object-contain" />
                        </div>
                        <div className="p-5">
                          <span className="text-[10px] font-semibold tracking-[0.15em] text-kraft uppercase">
                            {rel.paper_type === "marble" ? "Marble Paper" : "Cotton Paper"}
                          </span>
                          <h3 className="text-base font-bold text-charcoal mt-1.5 group-hover:text-forest transition-colors">
                            {rel.title}
                          </h3>
                          {rel.short_description && (
                            <p className="text-xs text-warm-gray mt-1 line-clamp-2">{rel.short_description}</p>
                          )}
                          <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-forest group-hover:text-kraft transition-colors">
                            View Details
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/papers/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {productDetailContent.actions.backToProducts}
          </Link>
        </div>
      </section>
    </div>
  );
}
