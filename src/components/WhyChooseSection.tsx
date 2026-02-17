"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Factory,
  Layers,
  Package,
  Leaf,
  Clock,
} from "lucide-react";

const reasons = [
  {
    icon: Factory,
    title: "Factory-Grade Materials",
    desc: "Suitable for warehouse and industrial use",
    highlight: "Industrial grade",
  },
  {
    icon: Layers,
    title: "Wide Range of Options",
    desc: "Multiple GSM, sizes, and ply configurations available",
    highlight: "Multiple configurations",
  },
  {
    icon: Package,
    title: "Bulk & Custom Supply",
    desc: "Capable of handling large-scale and customized orders",
    highlight: "Bulk & custom",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Packaging",
    desc: "Environmentally responsible and recyclable materials",
    highlight: "Recyclable",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    desc: "Competitive pricing with dependable delivery timelines",
    highlight: "Dependable delivery",
  },
];

export default function WhyChooseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-us" className="relative py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 kraft-texture opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

      <div
        ref={ref}
        className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative"
      >
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
              Why Choose Us
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Built for performance,
            <br />
            <span className="text-forest">delivered with precision</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">
            When you partner with AM Global, you get more than packaging. You
            get a manufacturing partner committed to your supply chain success.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative p-8 rounded-2xl bg-offwhite border border-transparent hover:border-kraft/15 hover:shadow-xl hover:shadow-kraft/5 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest/10 to-forest-light/10 flex items-center justify-center mb-6 group-hover:from-forest/15 group-hover:to-forest-light/15 transition-all duration-300">
                <reason.icon className="w-5 h-5 text-forest" />
              </div>

              <h3 className="text-lg font-bold text-charcoal mb-3">
                {reason.title}
              </h3>
              <p className="text-sm text-warm-gray leading-relaxed mb-5">
                {reason.desc}
              </p>

              {/* Highlight chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-kraft-pale/60 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-kraft" />
                <span className="text-[11px] font-semibold text-forest">
                  {reason.highlight}
                </span>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-forest to-kraft scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-forest to-forest-light relative overflow-hidden"
        >
          <div className="absolute inset-0 corrugated-pattern opacity-10" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-offwhite">
                Ready to scale your packaging?
              </h3>
              <p className="text-offwhite/60 mt-2 max-w-md">
                Join 500+ businesses that trust AM Global for their corrugated
                packaging needs.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl whitespace-nowrap text-sm"
            >
              Get Started Today
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
