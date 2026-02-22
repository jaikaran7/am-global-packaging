"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ShoppingCart,
  Pill,
  Cpu,
  Car,
  UtensilsCrossed,
  Shirt,
  Wrench,
  Wheat,
} from "lucide-react";

const industries = [
  {
    icon: ShoppingCart,
    name: "E-Commerce",
    desc: "Shipping-safe packaging for online retail fulfillment",
    color: "from-kraft/10 to-kraft-light/10",
    border: "border-kraft/15",
  },
  {
    icon: Pill,
    name: "Pharmaceuticals",
    desc: "Tamper-evident, compliant medical packaging",
    color: "from-forest/10 to-forest-light/10",
    border: "border-forest/15",
  },
  {
    icon: Cpu,
    name: "Electronics",
    desc: "Static-safe, cushioned protection for tech products",
    color: "from-kraft/10 to-kraft-light/10",
    border: "border-kraft/15",
  },
  {
    icon: Car,
    name: "Automotive",
    desc: "Heavy-duty containers for parts and components",
    color: "from-forest/10 to-forest-light/10",
    border: "border-forest/15",
  },
  {
    icon: UtensilsCrossed,
    name: "Food & Beverage",
    desc: "Food-grade certified packaging for perishables",
    color: "from-kraft/10 to-kraft-light/10",
    border: "border-kraft/15",
  },
  {
    icon: Shirt,
    name: "Textiles & Fashion",
    desc: "Premium retail-ready packaging with custom printing",
    color: "from-forest/10 to-forest-light/10",
    border: "border-forest/15",
  },
  {
    icon: Wrench,
    name: "Industrial & Machinery",
    desc: "Triple-wall heavy-duty crating solutions",
    color: "from-kraft/10 to-kraft-light/10",
    border: "border-kraft/15",
  },
  {
    icon: Wheat,
    name: "Agriculture",
    desc: "Durable containers for produce and agri-products",
    color: "from-forest/10 to-forest-light/10",
    border: "border-forest/15",
  },
];

export default function IndustriesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="industries"
      className="relative py-12 md:py-32 bg-forest overflow-hidden"
    >
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.1) 80px, rgba(255,255,255,0.1) 81px), repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.1) 80px, rgba(255,255,255,0.1) 81px)",
          }}
        />
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-kraft/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-forest-light/10 blur-[100px]" />

      <div
        ref={ref}
        className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-kraft-light" />
            <span className="text-xs font-semibold tracking-[0.25em] text-kraft-light uppercase">
              Industries We Serve
            </span>
            <div className="w-8 h-px bg-kraft-light" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-offwhite leading-[1.1] tracking-tight">
            Packaging solutions for
            <br />
            <span className="text-kraft-light">every sector</span>
          </h2>
          <p className="mt-6 text-offwhite/50 leading-relaxed">
            We partner with businesses across diverse industries, delivering
            packaging engineered for their specific requirements.
          </p>
        </motion.div>

        {/* Industries Grid */}
        <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] hover:border-kraft/20 transition-all duration-500 cursor-default min-w-[280px] flex-shrink-0 md:min-w-0"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kraft/20 to-kraft-light/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <industry.icon className="w-5 h-5 text-kraft-light" />
              </div>
              <h3 className="text-base font-bold text-offwhite mb-2">
                {industry.name}
              </h3>
              <p className="hidden md:block text-sm text-neutral-400 leading-relaxed">
                {industry.desc}
              </p>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-kraft/0 to-kraft/0 group-hover:from-kraft/[0.03] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Bottom stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 pt-16 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "8+", label: "Industries" },
            { value: "500+", label: "Active Clients" },
            { value: "99.2%", label: "On-Time Delivery" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-kraft-light">
                {stat.value}
              </div>
              <div className="text-xs text-offwhite/40 mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
