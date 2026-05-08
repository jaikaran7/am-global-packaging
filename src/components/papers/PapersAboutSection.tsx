"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Leaf, Globe, Shield, Feather } from "lucide-react";
import { aboutContent } from "@/content/papers-home/aboutContent";

const statIcons = [Feather, Leaf, Globe, Shield];

export default function PapersAboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased">

      {/* ── Hero ── same pattern as /papers/home header */}
      <header className="relative bg-[#f3f1ec] border-b border-[#e5e2dc]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-24 pt-24 md:pt-28">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 border border-[#e5e2dc] text-[#5c574c] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-6">
            {aboutContent.hero.badge}
          </span>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] md:text-[clamp(2.75rem,4.5vw,4.25rem)] font-extrabold tracking-tight leading-[1.08] text-[#1f2421] mb-6 max-w-3xl">
            {aboutContent.hero.heading}
            <br />
            <span className="text-[#7d6a4c]">{aboutContent.hero.headingAccent}</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5a5f5c] max-w-2xl leading-relaxed font-normal">
            {aboutContent.hero.description}
          </p>
        </div>
      </header>

      {/* ── Stats strip ── same pattern as products page stat strip */}
      <section className="py-12 md:py-16 bg-white border-b border-[#eeece8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {aboutContent.stats.map((stat, i) => {
              const Icon = statIcons[i] ?? Leaf;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 bg-[#faf9f6] rounded-xl ring-1 ring-[#ebe8e2]"
                >
                  <Icon className="w-5 h-5 text-[#7d6a4c] mb-3" />
                  <div className="text-xl font-bold text-[#1f2421] mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d6a4c] mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-[#8a8680] leading-relaxed">
                    {stat.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Approach ── same pattern as cottonDetail on /papers/home */}
      <section className="py-20 md:py-28 bg-[#faf9f6]">
        <div ref={ref} className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden bg-white ring-1 ring-[#ebe8e2] shadow-sm">
            <img
              className="w-full h-auto object-cover"
              alt="Handmade cotton paper sheets showing natural fibre texture"
              src="/assets/papers/cotton-06.png"
            />
          </div>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              {aboutContent.approach.subheading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
              {aboutContent.approach.heading}
            </h2>
            <div className="space-y-4 mb-8">
              {aboutContent.approach.paragraphs.map((p, i) => (
                <p key={i} className="text-[#5a5f5c] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <ul className="space-y-3 text-[#3d4540]">
              {aboutContent.approach.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Where Papers Are Used ── same pattern as "Where It's Used" on /papers/home */}
      <section className="py-20 md:py-28 bg-[#f3f1ec]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              {aboutContent.usedIn.subheading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421]">
              {aboutContent.usedIn.heading}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {aboutContent.usedIn.items.map((item) => (
              <article
                key={item.title}
                className="group h-full bg-white rounded-2xl border border-kraft/8 overflow-hidden transition-all duration-400 hover:shadow-xl hover:shadow-kraft/8 hover:border-kraft/20 flex flex-col"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-kraft-pale/50 via-cream/30 to-kraft-bg/60 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    alt={item.alt}
                    src={item.img}
                  />
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <h3 className="text-sm md:text-base font-bold text-charcoal tracking-tight group-hover:text-forest transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-warm-gray mt-1.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Material & Quality ── same pattern as marbleDetail on /papers/home */}
      <section className="py-20 md:py-28 bg-white border-y border-[#eeece8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              {aboutContent.material.subheading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
              {aboutContent.material.heading}
            </h2>
            <p className="text-[#5a5f5c] leading-relaxed mb-8 max-w-md">
              {aboutContent.material.description}
            </p>
            <ul className="space-y-3 text-[#3d4540]">
              {aboutContent.material.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          {/* Image pair */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm">
              <img
                className="w-full h-full object-cover"
                alt="Hand-marbled paper showing natural colour variation"
                src="/assets/papers/marble-02.png"
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm translate-y-6">
              <img
                className="w-full h-full object-cover"
                alt="Cotton paper showing natural texture and deckle edge"
                src="/assets/papers/cotton-02.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Sustainability ── same two-column pattern as cottonDetail, swapped order */}
      <section className="py-20 md:py-28 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              {aboutContent.sustainability.subheading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
              {aboutContent.sustainability.heading}
            </h2>
            <p className="text-[#5a5f5c] leading-relaxed mb-8 max-w-md">
              {aboutContent.sustainability.description}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8680] mb-3">
              We focus on
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-[#5a5f5c]">
              {aboutContent.sustainability.items.map((item) => (
                <li
                  key={item}
                  className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-[#ebe8e2]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-[#ebe8e2] shadow-sm">
            <img
              className="w-full h-auto object-cover"
              alt="Handmade paper drying naturally — eco-friendly process"
              src="/assets/papers/cotton-01.png"
            />
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── same pattern as features section on /papers/home */}
      <section className="py-20 md:py-28 bg-white border-y border-[#eeece8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              {aboutContent.whyChoose.subheading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421]">
              {aboutContent.whyChoose.heading}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutContent.whyChoose.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className="p-6 rounded-2xl bg-[#faf9f6] ring-1 ring-[#ebe8e2]"
              >
                <h3 className="text-base font-bold text-[#1f2421] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5a5f5c] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── same pattern as /papers/home final CTA */}
      <section className="py-20 md:py-28 bg-[#eae8e4]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight text-[#1f2421] leading-tight mb-4">
            {aboutContent.cta.heading}
          </h2>
          <p className="text-[#5a5f5c] mb-8 leading-relaxed">
            {aboutContent.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/papers/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#1f2421] text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-[#2d3330] transition-colors shadow-sm"
            >
              {aboutContent.cta.button}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/papers/products"
              className="inline-flex items-center justify-center gap-2 border border-[#c9c4bb] text-[#3d4540] px-8 py-4 rounded-full text-sm font-semibold hover:bg-white transition-colors"
            >
              {aboutContent.cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
