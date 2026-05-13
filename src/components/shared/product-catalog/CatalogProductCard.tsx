"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";

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
    "pizza-boxes": { front: "#C4973B", mid: "#A67B1E", dark: "#8B6914", top: "#DDB84D" },
    specialty: { front: "#8B7355", mid: "#6B5A42", dark: "#5A4A35", top: "#A68B6B" },
    books: { front: "#B8935A", mid: "#9A7A48", dark: "#7D6338", top: "#D4AE6E" },
    ecommerce: { front: "#A68558", mid: "#8B6E45", dark: "#735B38", top: "#C4A06A" },
    "general-purpose": { front: "#B09060", mid: "#957850", dark: "#7C6342", top: "#CBA878" },
    "vegetable-boxes": { front: "#5A8A4A", mid: "#4A7A3A", dark: "#3A6A2A", top: "#7AAA62" },
    "poultry-boxes": { front: "#C4784A", mid: "#A46038", dark: "#8A4E2C", top: "#E4986A" },
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

export function CatalogProductVisual({
  product,
  hovered,
}: {
  product: Product;
  hovered: boolean;
}) {
  const hasImages = product.images && product.images.length >= 2;

  if (hasImages) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.img
          src={product.images![0]}
          alt={`${product.shortName} closed`}
          className="absolute max-w-[80%] max-h-[80%] object-contain"
          style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: hovered ? 0 : 1,
            scale: hovered ? 0.95 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.img
          src={product.images![1]}
          alt={`${product.shortName} open`}
          className="absolute max-w-[80%] max-h-[80%] object-contain"
          style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1 : 0.95,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    );
  }

  return <Box3D product={product} hovered={hovered} />;
}

/** Same card as Boxes products grid — only `productHref` is injected for route. */
export function CatalogProductCard({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  viewMode = "grid",
  productHref,
}: {
  product: Product;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  viewMode?: "grid" | "list";
  productHref: string;
}) {
  const maxDim = Math.max(
    product.dimensionDetail.length,
    product.dimensionDetail.width,
    product.dimensionDetail.height
  );
  return (
    <Link href={productHref}>
      <div
        className={`group bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 ${
          viewMode === "list" ? "flex flex-row items-stretch" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`relative bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 flex items-center justify-center overflow-hidden ${
            viewMode === "list"
              ? "w-[200px] h-[200px] flex-shrink-0"
              : "h-[180px] md:h-[240px]"
          }`}
        >
          <div className="absolute inset-0 corrugated-pattern opacity-20" />
          <CatalogProductVisual product={product} hovered={hovered} />
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-kraft text-[10px] font-bold tracking-wide rounded-full border border-kraft/10 hidden md:block">
            {maxDim}mm
          </div>
        </div>
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
            <p className="text-xs text-warm-gray mt-2">MOQ: {product.moq}</p>
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
