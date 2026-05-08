"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, Check } from "lucide-react";
import type { PaperProduct } from "@/data/paperProducts";
import { getRelatedPaperProducts } from "@/data/paperProducts";
import { productDetailContent } from "@/content/papers-home/productDetailContent";

interface Props {
  product: PaperProduct;
}

export default function PapersProductDetail({ product }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedGsm, setSelectedGsm] = useState<number>(product.gsmOptions[0]);

  const related = getRelatedPaperProducts(product.relatedSlugs);

  const gsmDesc =
    productDetailContent.gsmDescriptions[
      selectedGsm as keyof typeof productDetailContent.gsmDescriptions
    ] ?? "";

  return (
    <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased pt-24 md:pt-28">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-[#8a8680]">
          <Link
            href="/papers/home"
            className="hover:text-[#7d6a4c] transition-colors"
          >
            {productDetailContent.breadcrumb.home}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/papers/products"
            className="hover:text-[#7d6a4c] transition-colors"
          >
            {productDetailContent.breadcrumb.products}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1f2421] font-medium">{product.shortName}</span>
        </nav>
      </div>

      {/* Product Main */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden bg-[#ebe8e2] ring-1 ring-[#e8e5df] shadow-sm mb-4 aspect-[4/3]">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
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
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Type badge */}
            <span
              className={`inline-block px-3.5 py-1.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-4 ${
                product.type === "cotton"
                  ? "bg-[#f3f1ec] border border-[#e5e2dc] text-[#5c574c]"
                  : "bg-[#1a2e28]/10 border border-[#1a2e28]/20 text-[#1a2e28]"
              }`}
            >
              {productDetailContent.typeLabels[product.type]}
            </span>

            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#1f2421] mb-3">
              {product.name}
            </h1>

            <p className="text-[#5a5f5c] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl ring-1 ring-[#ebe8e2]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.size}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">
                  {product.sizeLabel}
                </div>
              </div>
              <div className="w-px bg-[#ebe8e2]" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.dimensions}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">
                  {product.dimensions}
                </div>
              </div>
              <div className="w-px bg-[#ebe8e2]" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8680] mb-0.5">
                  {productDetailContent.labels.type}
                </div>
                <div className="text-sm font-bold text-[#1f2421]">
                  {productDetailContent.typeLabels[product.type]}
                </div>
              </div>
            </div>

            {/* GSM Selector */}
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                {productDetailContent.labels.selectGsm}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.gsmOptions.map((gsm) => (
                  <button
                    key={gsm}
                    type="button"
                    onClick={() => setSelectedGsm(gsm)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      selectedGsm === gsm
                        ? "bg-[#1f2421] text-white"
                        : "bg-white ring-1 ring-[#e5e2dc] text-[#3d4540] hover:ring-[#7d6a4c]"
                    }`}
                  >
                    {gsm} GSM
                  </button>
                ))}
              </div>
              {gsmDesc && (
                <p className="mt-2.5 text-xs text-[#8a8680] leading-relaxed">
                  {gsmDesc}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                {productDetailContent.labels.features}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#3d4540]">
                    <Check className="w-4 h-4 text-[#7d6a4c] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c574c] mb-3">
                {productDetailContent.labels.useCases}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.useCases.map((uc) => (
                  <span
                    key={uc}
                    className="px-3 py-1.5 rounded-lg bg-white ring-1 ring-[#ebe8e2] text-xs text-[#5a5f5c] font-medium"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/papers/contact?type=${product.type}&size=${product.sizeLabel}&gsm=${selectedGsm}`}
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

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-t border-[#eeece8]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f2421] mb-8">
              {productDetailContent.labels.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/papers/product/${rel.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-[#faf9f6] ring-1 ring-[#e8e5df] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#ebe8e2]">
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#1f2421] text-sm mb-1">
                      {rel.shortName}
                    </h3>
                    <p className="text-[#5a5f5c] text-xs leading-relaxed mb-3">
                      {rel.tagline}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[#7d6a4c] text-xs font-semibold">
                      {productDetailContent.actions.viewAllPapers}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#eae8e4]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f2421] mb-3">
            {productDetailContent.cta.heading}
          </h2>
          <p className="text-[#5a5f5c] mb-8 leading-relaxed">
            {productDetailContent.cta.description}
          </p>
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
