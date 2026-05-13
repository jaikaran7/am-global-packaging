"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, Check } from "lucide-react";
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

  return (
    <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-[#8a8680]">
          <Link href="/papers/home" className="hover:text-[#7d6a4c] transition-colors">
            {productDetailContent.breadcrumb.home}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/papers/products" className="hover:text-[#7d6a4c] transition-colors">
            {productDetailContent.breadcrumb.products}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1f2421] font-medium">{product.title}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden bg-[#ebe8e2] ring-1 ring-[#e8e5df] shadow-sm mb-4 aspect-[4/3]">
              <img
                src={displayImages[activeImage] ?? fallbackImg}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {displayImages.length > 1 && (
              <div className="flex gap-3">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`rounded-lg overflow-hidden ring-2 transition-all duration-200 w-20 h-16 flex-shrink-0 ${
                      activeImage === i
                        ? "ring-[#7d6a4c]"
                        : "ring-transparent hover:ring-[#c9c4bb]"
                    }`}
                  >
                    <img src={img} alt={`${product.title} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              className={`inline-block px-3.5 py-1.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-4 ${
                typeKey === "cotton"
                  ? "bg-[#f3f1ec] border border-[#e5e2dc] text-[#5c574c]"
                  : "bg-[#1a2e28]/10 border border-[#1a2e28]/20 text-[#1a2e28]"
              }`}
            >
              {productDetailContent.typeLabels[typeKey]}
            </span>

            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#1f2421] mb-3">
              {product.title}
            </h1>

            <p className="text-[#5a5f5c] leading-relaxed mb-6">
              {product.short_description ?? product.description ?? ""}
            </p>

            {selectedVariant && (
              <div className="mb-6 p-4 bg-white rounded-xl ring-1 ring-[#ebe8e2] space-y-2">
                <div className="flex flex-wrap justify-between gap-2 items-baseline">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8680]">
                    Price (excl. GST)
                  </span>
                  <span className="text-lg font-bold text-[#1f2421]">
                    ${unitBase.toFixed(2)} {selectedVariant.currency || "AUD"}
                  </span>
                </div>
                <p className="text-xs text-[#5a5f5c]">
                  + {gstPct}% GST → <strong>${withGst.toFixed(2)}</strong> per unit (AUD)
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl ring-1 ring-[#ebe8e2]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.size}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">{product.size_label ?? "—"}</div>
              </div>
              <div className="w-px bg-[#ebe8e2]" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.dimensions}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">{product.dimensions_label ?? "—"}</div>
              </div>
              <div className="w-px bg-[#ebe8e2]" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.type}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">{productDetailContent.typeLabels[typeKey]}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                Select variant
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-left max-w-full ${
                      selectedVariantId === v.id
                        ? "bg-[#1f2421] text-white"
                        : "bg-white ring-1 ring-[#e5e2dc] text-[#3d4540] hover:ring-[#7d6a4c]"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
              {gsmDesc && (
                <p className="mt-2.5 text-xs text-[#8a8680] leading-relaxed">{gsmDesc}</p>
              )}
            </div>

            {features.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                  {productDetailContent.labels.features}
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#3d4540]">
                      <Check className="w-4 h-4 text-[#7d6a4c] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.use_cases.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                  {productDetailContent.labels.useCases}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.use_cases.map((uc) => (
                    <span
                      key={uc}
                      className="px-3 py-1.5 rounded-lg bg-white ring-1 ring-[#ebe8e2] text-xs text-[#5a5f5c] font-medium"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {canCheckout && selectedVariant ? (
                <Link
                  href={`/papers/checkout?slug=${encodeURIComponent(product.slug)}&variant=${encodeURIComponent(selectedVariant.id)}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-colors shadow-sm bg-[#7d6a4c] text-white hover:bg-[#6a5a42]"
                  title="Purchase inquiry — checkout"
                >
                  {productDetailContent.actions.checkout}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#c9c4bb] text-white/90 cursor-not-allowed select-none"
                  title="Unavailable for checkout"
                >
                  {productDetailContent.actions.checkout}
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
              <Link
                href={
                  selectedVariant
                    ? `/papers/contact?slug=${encodeURIComponent(product.slug)}&variant=${selectedVariant.id}`
                    : `/papers/contact?slug=${encodeURIComponent(product.slug)}`
                }
                className="inline-flex items-center justify-center gap-2 bg-[#1f2421] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#2d3330] transition-colors shadow-sm"
              >
                {productDetailContent.actions.requestQuote}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/papers/products"
                className="inline-flex items-center justify-center gap-2 border border-[#c9c4bb] text-[#3d4540] px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {productDetailContent.actions.backToProducts}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-t border-[#eeece8]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f2421] mb-8">
              {productDetailContent.labels.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((rel) => {
                const img =
                  rel.primary_image_url ??
                  (rel.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png");
                return (
                  <Link
                    key={rel.slug}
                    href={`/papers/product/${rel.slug}`}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-[#faf9f6] ring-1 ring-[#e8e5df] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#ebe8e2]">
                      <img
                        src={img}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[#1f2421] text-sm mb-1">{rel.title}</h3>
                      {rel.short_description && (
                        <p className="text-[#5a5f5c] text-xs leading-relaxed mb-3 line-clamp-2">{rel.short_description}</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-[#7d6a4c] text-xs font-semibold">
                        {productDetailContent.actions.viewAllPapers}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20 bg-[#eae8e4]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f2421] mb-3">{productDetailContent.cta.heading}</h2>
          <p className="text-[#5a5f5c] mb-8 leading-relaxed">{productDetailContent.cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/papers/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#1f2421] text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-[#2d3330] transition-colors shadow-sm"
            >
              {productDetailContent.cta.button}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/papers/products"
              className="inline-flex items-center justify-center gap-2 border border-[#c9c4bb] text-[#3d4540] px-8 py-4 rounded-full text-sm font-semibold hover:bg-white transition-colors"
            >
              {productDetailContent.cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
