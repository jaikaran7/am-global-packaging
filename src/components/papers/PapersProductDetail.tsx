"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ProductDetailView } from "@/components/shared/product-catalog/ProductDetailView";
import { productDetailContent } from "@/content/papers-home/productDetailContent";
import {
  mapPaperDetailToProduct,
  mapPaperRelatedToProduct,
  type PaperDetailInput,
  type PaperDetailVariantInput,
  type PaperRelatedCardInput,
} from "@/lib/papers/paperToProduct";

type ApiVariant = PaperDetailVariantInput;

type ApiProduct = PaperDetailInput;

type RelatedCard = PaperRelatedCardInput;

interface Props {
  slug: string;
}

const PAPERS_PRODUCTS_BASE = "/papers/products";

export default function PapersProductDetail({ slug }: Readonly<Props>) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<RelatedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const typeKey = product?.paper_type === "marble" ? "marble" : "cotton";
  const categoryLabel = productDetailContent.typeLabels[typeKey];

  const catalogProduct = useMemo(() => {
    if (!product) return null;
    return mapPaperDetailToProduct(product, selectedVariant, categoryLabel);
  }, [product, selectedVariant, categoryLabel]);

  const relatedAsProducts = useMemo(() => {
    return related.map((r) =>
      mapPaperRelatedToProduct(
        r,
        productDetailContent.typeLabels.marble,
        productDetailContent.typeLabels.cotton
      )
    );
  }, [related]);

  const stripItems = useMemo(() => {
    if (!product?.variants?.length) return [];
    return product.variants.map((v) => ({
      key: v.id,
      title: v.name,
      subtitle:
        v.gsm != null
          ? `${v.gsm} GSM`
          : v.size_label != null
            ? v.size_label
            : "—",
      isActive: v.id === (selectedVariant?.id ?? ""),
      onClick: () => {
        setSelectedVariantId(v.id);
      },
    }));
  }, [product, selectedVariant]);

  const canCheckout =
    selectedVariant != null &&
    selectedVariant.is_available !== false &&
    selectedVariant.stock > 0;

  const checkoutHref =
    product && selectedVariant
      ? `/papers/checkout?slug=${encodeURIComponent(product.slug)}&variant=${encodeURIComponent(
          selectedVariant.id
        )}`
      : "/papers/checkout";

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite">
        <div className="bg-white border-b border-kraft/8">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-4">
            <p className="text-sm text-warm-gray">Loading…</p>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 pt-10">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 animate-pulse">
            <div className="h-[400px] rounded-3xl bg-kraft-pale/40" />
            <div className="space-y-4">
              <div className="h-6 w-32 bg-kraft-pale/50 rounded" />
              <div className="h-10 w-full bg-kraft-pale/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product || !catalogProduct) {
    return (
      <div className="min-h-screen bg-offwhite">
        <div className="bg-white border-b border-kraft/8">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-4">
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <Link href="/papers/home" className="hover:text-charcoal transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={PAPERS_PRODUCTS_BASE} className="hover:text-charcoal transition-colors">
                Products
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-20 text-center">
          <p className="text-red-600 text-sm mb-4">{error ?? "Product unavailable."}</p>
          <Link
            href={PAPERS_PRODUCTS_BASE}
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {productDetailContent.actions.backToProducts}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailView
      product={catalogProduct}
      viewTransitionKey={`${product.slug}-${selectedVariant?.id ?? ""}`}
      homeHref="/papers/home"
      productsIndexHref={PAPERS_PRODUCTS_BASE}
      stripSectionLabel={`${categoryLabel} — Select Type`}
      stripItems={stripItems}
      checkoutHref={checkoutHref}
      checkoutDisabled={!canCheckout}
      purchaseInquiryBody="Continue to the dedicated checkout page to choose GSM variant, quantity, and delivery details. Estimates are indicative; our team confirms final pricing."
      relatedProducts={relatedAsProducts}
      relatedProductHref={(s) => `/papers/product/${s}`}
      viewAllProductsHref={PAPERS_PRODUCTS_BASE}
      viewAllProductsLabel={productDetailContent.actions.viewAllPapers}
      backToCatalogHref={PAPERS_PRODUCTS_BASE}
      backToCatalogLabel={productDetailContent.actions.backToProducts}
    />
  );
}
