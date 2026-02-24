"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const productTabs = [
  {
    id: "sheets",
    label: "Corrugated Sheets",
    title: "Corrugated Sheets",
    subtitle: "Flat & Fluted Sheets",
    description:
      "High-performance corrugated sheets in custom sizes, thicknesses, and flute profiles. Ideal for partitioning, layering, cushioning, and industrial applications.",
    features: ["Custom dimensions", "Multiple flute types", "Bulk quantities", "Die-cut ready"],
    specs: [
      { label: "Thickness", value: "1.5mm - 15mm" },
      { label: "Max Width", value: "2500mm" },
      { label: "GSM Range", value: "80 - 350 GSM" },
    ],
    gradient: "from-kraft to-kraft-light",
    visualType: "sheets" as const,
    redirect: "/products",
  },
  {
    id: "boxes",
    label: "Corrugated Boxes",
    title: "Corrugated Boxes",
    subtitle: "Custom & Standard Boxes",
    description:
      "Engineered corrugated boxes for shipping, storage, retail, and heavy-duty industrial use. Custom printed, precision-cut, and designed for maximum stackability.",
    features: ["Custom printing", "RSC & Die-cut styles", "Heavy-duty options", "Eco-friendly inks"],
    specs: [
      { label: "Ply Options", value: "3, 5, 7 Ply" },
      { label: "Print", value: "Up to 4-color" },
      { label: "MOQ", value: "500 units" },
    ],
    gradient: "from-forest to-forest-light",
    visualType: "box" as const,
    redirect: "/products",
  },
  {
    id: "pizza",
    label: "Pizza Boxes",
    title: "Pizza Boxes",
    subtitle: "Food-Safe & Ventilated",
    description:
      "Australian-standard pizza boxes in a range of sizes from personal to family party. Ventilation slots, lock-tab closure, and food-grade certified materials for delivery and takeaway.",
    features: ["Ventilation slots", "Lock-tab closure", "Food-grade certified", "Grease-resistant"],
    specs: [
      { label: "Sizes", value: "200mm - 400mm" },
      { label: "Ply", value: "3-Ply, 5-Ply" },
      { label: "Print", value: "Up to 4-color" },
    ],
    gradient: "from-kraft to-kraft-light",
    visualType: "box" as const,
    redirect: "/products/pizza-boxes",
  },
  {
    id: "other",
    label: "Other Boxes",
    title: "All Corrugated Boxes",
    subtitle: "A4, Specialty, E-Commerce & More",
    description:
      "Browse our full range of corrugated boxes: A4 document boxes, specialty and heavy-duty, e-commerce and FBA cartons, vegetable and poultry boxes. All Australian-standard, custom print available.",
    features: ["A4 boxes", "Specialty & heavy-duty", "E-commerce / FBA", "Vegetable & poultry"],
    specs: [
      { label: "Ply Options", value: "3, 5, 7 Ply" },
      { label: "Print", value: "Up to 4-color" },
      { label: "MOQ", value: "500 units" },
    ],
    gradient: "from-forest to-forest-light",
    visualType: "box" as const,
    redirect: "/products",
  },
];

export default function ProductsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeProduct, setActiveProduct] = useState(0);
  const activeTab = productTabs[activeProduct];

  return (
    <section id="products" className="relative py-32 bg-offwhite overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />
      <div className="absolute inset-0 corrugated-pattern opacity-30" />

      <div ref={ref} className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-kraft" />
            <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
              Our Products
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Corrugated solutions for
            <br />
            <span className="text-forest">every industry</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">
            From single-wall sheets to heavy-duty multi-ply boxes, our product range covers
            the full spectrum of packaging needs.
          </p>
        </motion.div>

        {/* Product Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white rounded-full p-1.5 border border-kraft/10 shadow-sm">
            {productTabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveProduct(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${activeProduct === i
                  ? "bg-forest text-offwhite shadow-lg shadow-forest/20"
                  : "text-warm-gray hover:text-charcoal"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Detail */}
        <motion.div
          key={activeProduct}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center"
        >
          {/* Left: Product Visual */}
          <div className="relative">
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${activeTab.gradient} p-12 md:p-16 min-h-[400px] md:min-h-[480px] flex items-center justify-center`}>
              <div className="absolute inset-0 corrugated-pattern opacity-20" />

              {/* 3D Product Illustration */}
              {activeTab.visualType === "sheets" ? (
                <div className="relative" style={{ perspective: "800px" }}>
                  {/* Stacked sheets */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative mx-auto"
                      style={{
                        width: `${280 - i * 10}px`,
                        height: "12px",
                        marginBottom: "4px",
                        background: `linear-gradient(90deg, rgba(255,255,255,${0.3 - i * 0.04}) 0%, rgba(255,255,255,${0.15 - i * 0.02}) 100%)`,
                        borderRadius: "2px",
                        transform: `translateZ(${50 - i * 10}px)`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
                      }} />
                    </motion.div>
                  ))}
                  <div className="mt-8 text-center">
                    <div className="text-white/80 text-sm font-medium">Corrugated Sheet Stack</div>
                    <div className="text-white/50 text-xs mt-1">Custom dimensions available</div>
                  </div>
                </div>
              ) : activeTab.id === "pizza" ? (
                <div className="relative w-full h-[320px] md:h-[360px] flex items-center justify-center z-10">
                  <div className="relative">
                    <img
                      src="/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png"
                      alt="Pizza Boxes Stack"
                      className="max-w-full max-h-[300px] object-contain drop-shadow-2xl"
                    />

                    {/* Size Overlay Labels */}
                    <div className="absolute top-[8%] -right-4 md:-right-12 flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-white/90 text-charcoal px-2 py-0.5 rounded-sm shadow-sm border border-kraft/20 tracking-wider">PERSONAL</span>
                      <div className="w-4 h-px bg-kraft/40" />
                    </div>
                    <div className="absolute top-[28%] -right-4 md:-right-12 flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-white/90 text-charcoal px-2 py-0.5 rounded-sm shadow-sm border border-kraft/20 tracking-wider">SMALL</span>
                      <div className="w-8 h-px bg-kraft/40" />
                    </div>
                    <div className="absolute top-[48%] -right-4 md:-right-12 flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-white/90 text-charcoal px-2 py-0.5 rounded-sm shadow-sm border border-kraft/20 tracking-wider">MEDIUM</span>
                      <div className="w-12 h-px bg-kraft/40" />
                    </div>
                    <div className="absolute bottom-[28%] -right-4 md:-right-12 flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-white/90 text-charcoal px-2 py-0.5 rounded-sm shadow-sm border border-kraft/20 tracking-wider">LARGE</span>
                      <div className="w-16 h-px bg-kraft/40" />
                    </div>
                    <div className="absolute bottom-[2%] -right-4 md:-right-12 flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-white/90 text-charcoal px-2 py-0.5 rounded-sm shadow-sm border border-kraft/20 tracking-wider">X-LARGE</span>
                      <div className="w-20 h-px bg-kraft/40" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative" style={{ perspective: "800px" }}>
                  {/* 3D Box shape */}
                  <div style={{ transformStyle: "preserve-3d", transform: "rotateX(-5deg) rotateY(-15deg)" }}>
                    <div
                      className="w-[200px] h-[180px] md:w-[240px] md:h-[200px] rounded-md relative"
                      style={{
                        background: "linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))",
                        transform: "translateZ(40px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <div className="absolute inset-4 border border-white/15 rounded flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-white/70 text-[10px] tracking-[0.3em] uppercase">AM Global</div>
                          <div className="w-12 h-px bg-white/20 mx-auto my-2" />
                          <div className="text-white/50 text-[8px] tracking-widest uppercase">Custom Print</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <div className="text-white/80 text-sm font-medium">Custom Printed Box</div>
                    <div className="text-white/50 text-xs mt-1">RSC & Die-cut available</div>
                  </div>
                </div>
              )}

              {/* Floating badge */}
              <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white/90 text-xs font-semibold">Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-xs font-semibold tracking-[0.2em] text-kraft uppercase mb-3">
                {activeTab.subtitle}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight">
                {activeTab.title}
              </h3>
              <p className="mt-4 text-warm-gray leading-relaxed">
                {activeTab.description}
              </p>
              <Link
                href={activeTab.redirect}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors mt-4"
              >
                Explore {activeTab.title} →
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {activeTab.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 py-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-kraft flex-shrink-0" />
                  <span className="text-sm text-charcoal font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="bg-cream/50 rounded-xl p-6 border border-kraft/10">
              <div className="text-xs font-semibold tracking-widest text-warm-gray uppercase mb-4">
                Key Specifications
              </div>
              <div className="grid grid-cols-3 gap-4">
                {activeTab.specs.map((spec) => (
                  <div key={spec.label}>
                    <div className="text-lg font-bold text-charcoal">{spec.value}</div>
                    <div className="text-[11px] text-warm-gray mt-0.5">{spec.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={activeTab.redirect}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors"
            >
              Get custom specifications
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
