"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { getRelatedProducts, getCategoryProducts } from "@/data/products";
import { ProductDetailView } from "@/components/shared/product-catalog/ProductDetailView";
import { getProductTypeSelectorLabel } from "@/components/shared/product-catalog/CatalogTypeSelectorCard";

const BOXES_PRODUCTS_BASE = "/boxes/products";

export default function ProductDetailPage({ product: initialProduct }: { product: Product }) {
  const searchParams = useSearchParams();
  const fromAll = searchParams.get("from") === "all";

  const categoryProducts = getCategoryProducts(initialProduct.category);
  const [activeProductSlug, setActiveProductSlug] = useState(initialProduct.slug);

  const product = fromAll
    ? (categoryProducts.find((p) => p.slug === activeProductSlug) ?? initialProduct)
    : initialProduct;

  const relatedProducts = getRelatedProducts(product.relatedSlugs);

  const stripItems = categoryProducts.map((p) => {
    const useButton = fromAll && categoryProducts.length > 1;
    return {
      key: p.slug,
      title: getProductTypeSelectorLabel(p),
      subtitle: `${p.dimensionDetail.length}×${p.dimensionDetail.width} mm`,
      isActive: fromAll ? p.slug === activeProductSlug : p.slug === product.slug,
      href: useButton ? undefined : `${BOXES_PRODUCTS_BASE}/${p.slug}`,
      onClick: () => {
        setActiveProductSlug(p.slug);
      },
    };
  });

  return (
    <ProductDetailView
      product={product}
      homeHref="/boxes/home"
      productsIndexHref={BOXES_PRODUCTS_BASE}
      stripSectionLabel={`${product.categoryLabel} — Select Type`}
      stripItems={stripItems}
      checkoutHref={`/boxes/checkout?slug=${encodeURIComponent(product.slug)}`}
      purchaseInquiryBody="Continue to the dedicated checkout page to choose ply, quantity, and delivery details. Estimates are indicative; our team confirms final pricing."
      relatedProducts={relatedProducts}
      relatedProductHref={(slug) => `${BOXES_PRODUCTS_BASE}/${slug}`}
      viewAllProductsHref={BOXES_PRODUCTS_BASE}
      viewAllProductsLabel="View All Products"
      backToCatalogHref={BOXES_PRODUCTS_BASE}
      backToCatalogLabel="Back to All Products"
    />
  );
}
