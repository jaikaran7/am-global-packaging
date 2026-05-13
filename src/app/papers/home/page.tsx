import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import { homeContent } from "@/content/papers-home/homeContent";
import { Feather, Leaf, Recycle, Droplets, Globe, Package, Layers, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Papers Home | AM Global",
  description:
    "Handmade cotton paper and hand-marbled marble paper — crafted by artisans in India. Premium paper sheets in multiple sizes and GSM options. Ships globally.",
};

const cotton = {
  c1: "/assets/papers/cotton-01.png",
  c2: "/assets/papers/cotton-02.png",
  c3: "/assets/papers/cotton-03.png",
  c4: "/assets/papers/cotton-04.png",
  c5: "/assets/papers/cotton-05.png",
  c6: "/assets/papers/cotton-06.png",
} as const;

const marble = {
  m2: "/assets/papers/marble-02.png",
  m3: "/assets/papers/marble-03.png",
  m4: "/assets/papers/marble-04.png",
} as const;

const papersStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
`;

// ── Static data for new sections ──────────────────────────────────────────

const usedInItems = [
  {
    title: "Wedding Invitations & Cards",
    desc: "Elegant, textured papers perfect for luxury wedding stationery and invitations.",
    img: cotton.c3,
    alt: "Wedding invitation suite on handmade cotton paper",
  },
  {
    title: "Greeting Cards",
    desc: "Premium feel for artistic and high-end greeting designs that stand out.",
    img: cotton.c4,
    alt: "Cotton paper for greeting cards",
  },
  {
    title: "Book Covers & Publishing",
    desc: "Durable and aesthetic papers for covers, inserts, and specialty prints.",
    img: marble.m2,
    alt: "Marble paper for book covers and publishing",
  },
  {
    title: "Premium Packaging",
    desc: "Ideal for luxury packaging, wrapping, and brand presentation materials.",
    img: cotton.c5,
    alt: "Cotton paper for premium packaging",
  },
  {
    title: "Art & Creative Work",
    desc: "Perfect for artists, designers, and handcrafted products requiring unique character.",
    img: marble.m4,
    alt: "Marble paper for art and creative work",
  },
  {
    title: "Stationery & Custom Prints",
    desc: "Premium stationery sets and custom print applications with natural texture.",
    img: cotton.c2,
    alt: "Cotton paper for stationery and custom prints",
  },
];

const paperSpecs = [
  { label: "GSM Range", value: "100 – 350", desc: "Light to extra-heavy weight options" },
  { label: "Sizes", value: "4 Formats", desc: "A4, A5, 10×20 cm, 22×30 inch" },
  { label: "Material", value: "Cotton Rag", desc: "100% cotton-based, tree-free" },
  { label: "Finish", value: "Handmade", desc: "Natural texture, unique per sheet" },
  { label: "Variations", value: "Every Sheet", desc: "No two sheets are identical" },
];

const sustainPillars = [
  {
    icon: Recycle,
    title: "Cotton-Based Material",
    desc: "Made from recycled cotton rags instead of wood pulp — no trees are cut for our paper.",
  },
  {
    icon: Leaf,
    title: "Tree-Free Process",
    desc: "The entire range is produced from cotton-rag fibres, eliminating deforestation entirely.",
  },
  {
    icon: Droplets,
    title: "Low-Waste Production",
    desc: "Traditional sheet-forming techniques minimise process waste and chemical use.",
  },
  {
    icon: Globe,
    title: "Acid-Free & Long-Lasting",
    desc: "Sheets retain quality for decades, reducing replacement waste over a product's lifetime.",
  },
];

const reasons = [
  {
    icon: Feather,
    title: "Every Sheet Handmade",
    desc: "No machine-formed paper in our range — every sheet is formed by hand by skilled artisans in India.",
    highlight: "100% handmade",
  },
  {
    icon: Layers,
    title: "Multiple GSM & Sizes",
    desc: "100 to 350 GSM options across A4, A5, 10×20 cm, and large 22×30 inch art formats.",
    highlight: "5 GSM options",
  },
  {
    icon: Package,
    title: "Bulk & Custom Supply",
    desc: "Capable of handling large-scale orders and bespoke custom-size production.",
    highlight: "Bulk & custom",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Materials",
    desc: "Tree-free, acid-free, and environmentally responsible cotton-rag paper throughout.",
    highlight: "Sustainable",
  },
  {
    icon: Globe,
    title: "Ships Globally",
    desc: "Delivered to studios and businesses worldwide with reliable international logistics.",
    highlight: "Worldwide delivery",
  },
  {
    icon: Clock,
    title: "Reliable Sourcing",
    desc: "Consistent quality across batches, sourced from trusted artisan manufacturers in India.",
    highlight: "Made in India",
  },
];

export default function PapersHomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: papersStyles }} />
      <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased">

        {/* ── Hero ── */}
        <header className="relative bg-[#f3f1ec] border-b border-[#e5e2dc]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[min(92vh,880px)] py-16 md:py-24 pt-24 md:pt-28">
            <div className="order-1">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 border border-[#e5e2dc] text-[#5c574c] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-6">
                {homeContent.hero.badge}
              </span>
              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] md:text-[clamp(2.75rem,4.5vw,4.25rem)] font-extrabold tracking-tight leading-[1.08] text-[#1f2421] mb-6">
                {homeContent.hero.heading}
                <br />
                <span className="text-[#7d6a4c]">{homeContent.hero.headingAccent}</span>
              </h1>
              <p className="text-lg md:text-xl text-[#5a5f5c] max-w-xl mb-10 leading-relaxed font-normal">
                {homeContent.hero.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/papers/products"
                  className="bg-[#7d6a4c] text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-[#6a5a41] transition-colors shadow-sm"
                >
                  {homeContent.hero.ctaPrimary}
                </Link>
                <Link
                  href="/papers/about"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#c9c4bb] text-[#3d4540] font-semibold text-sm tracking-wide hover:bg-white/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                  {homeContent.hero.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="order-2 relative">
              <div className="rounded-2xl overflow-hidden bg-[#ebe8e2] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]">
                <img
                  className="w-full h-full min-h-[320px] sm:min-h-[400px] lg:min-h-[480px] object-cover object-center"
                  alt="Stack of handmade white cotton paper with deckle edges, tied with cotton cord"
                  src={cotton.c1}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── Our Papers — 2 collections ── */}
        <section id="our-papers" className="py-20 md:py-28 bg-white border-b border-[#eeece8]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mb-14">
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                {homeContent.collections.subheading}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421]">
                {homeContent.collections.heading}
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <article className="lg:col-span-8 group flex flex-col rounded-2xl overflow-hidden bg-[#f7f6f3] ring-1 ring-[#e8e5df] shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-[#ebe8e2]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                    alt="Handmade cotton envelopes with soft texture and deckle edges"
                    src={cotton.c2}
                  />
                </div>
                <div className="flex flex-col flex-1 p-8 md:p-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#1f2421] mb-3">
                    {homeContent.collections.cotton.title}
                  </h3>
                  <p className="text-[#5a5f5c] leading-relaxed mb-8 flex-1 max-w-xl">
                    {homeContent.collections.cotton.description}
                  </p>
                  <Link
                    href="/papers/products"
                    className="self-start bg-[#1f2421] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#2d3330] transition-colors"
                  >
                    {homeContent.collections.cotton.cta}
                  </Link>
                </div>
              </article>

              <article className="lg:col-span-4 group flex flex-col rounded-2xl overflow-hidden bg-[#f7f6f3] ring-1 ring-[#e8e5df] shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[220px] bg-[#1a2e28]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    alt="Hand-marbled decorative paper with flowing colour patterns"
                    src={marble.m4}
                  />
                </div>
                <div className="flex flex-col flex-1 p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1f2421] mb-3">
                    {homeContent.collections.marble.title}
                  </h3>
                  <p className="text-[#5a5f5c] text-sm leading-relaxed mb-8 flex-1">
                    {homeContent.collections.marble.description}
                  </p>
                  <Link
                    href="/papers/products"
                    className="self-start border border-[#c9c4bb] text-[#1f2421] px-7 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors"
                  >
                    {homeContent.collections.marble.cta}
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ── Cotton detail ── */}
        <section className="py-20 md:py-28 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden bg-white ring-1 ring-[#ebe8e2] shadow-sm">
              <img
                className="w-full h-auto object-cover"
                alt="Handmade white cotton paper showing natural fibre texture and deckle edges"
                src={cotton.c6}
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                {homeContent.cottonDetail.subheading}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
                {homeContent.cottonDetail.heading}
              </h2>
              <ul className="space-y-3 mb-10 text-[#3d4540]">
                {homeContent.cottonDetail.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-[#7d6a4c] font-medium">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8680] mb-3">
                {homeContent.cottonDetail.usesLabel}
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-[#5a5f5c]">
                {homeContent.cottonDetail.uses.map((u) => (
                  <li key={u} className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-[#ebe8e2]">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Marble detail ── */}
        <section className="py-20 md:py-28 bg-white border-y border-[#eeece8]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                {homeContent.marbleDetail.subheading}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
                {homeContent.marbleDetail.heading}
              </h2>
              <p className="text-[#5a5f5c] leading-relaxed mb-6 max-w-md">
                {homeContent.marbleDetail.description1}
              </p>
              <p className="text-[#5a5f5c] leading-relaxed max-w-md">
                {homeContent.marbleDetail.description2}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm">
                <img className="w-full h-full object-cover" alt="Hand-marbled paper in mint and coral tones" src={marble.m2} />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm translate-y-6">
                <img className="w-full h-full object-cover" alt="Hand-marbled paper with deep pattern variation" src={marble.m3} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Where Papers Are Used — 6 items, 3-col, tight cards ── */}
        <section className="py-20 md:py-28 bg-[#f3f1ec]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                  Applications
                </span>
                <div className="w-8 h-px bg-kraft" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
                {homeContent.usedIn.heading}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {usedInItems.map((item) => (
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

        {/* ── Key Specifications — NEW ── */}
        <section className="py-20 md:py-28 bg-white relative overflow-hidden">
          <div className="absolute inset-0 kraft-texture opacity-50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                  Paper Specifications
                </span>
                <div className="w-8 h-px bg-kraft" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal leading-[1.1] tracking-tight">
                Built to <span className="text-forest">exact standards</span>
              </h2>
              <p className="mt-6 text-warm-gray leading-relaxed">
                Every sheet meets consistent quality benchmarks across weight, size, and finish — from small stationery orders to large art-format runs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
              {paperSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="p-5 md:p-6 rounded-2xl bg-offwhite ring-1 ring-kraft/10 text-center hover:ring-kraft/25 hover:shadow-lg hover:shadow-kraft/5 transition-all duration-300"
                >
                  <div className="text-xl md:text-2xl font-bold text-charcoal mb-1">{spec.value}</div>
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] text-kraft mb-2">
                    {spec.label}
                  </div>
                  <div className="text-[11px] md:text-xs text-warm-gray leading-relaxed">{spec.desc}</div>
                </div>
              ))}
            </div>

            {/* Specs detail strip */}
            <div className="mt-10 md:mt-12 rounded-2xl bg-gradient-to-r from-offwhite to-cream/60 border border-kraft/10 px-6 py-6 md:px-10 md:py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                {[
                  { value: "100 – 350 GSM", label: "Full weight range" },
                  { value: "A4 · A5 · 10×20 · 22×30\"", label: "Standard size options" },
                  { value: "Acid-Free", label: "Long-lasting, archive quality" },
                  { value: "Ships Worldwide", label: "Global supply capability" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-base md:text-lg font-semibold text-charcoal">{s.value}</div>
                    <div className="text-[11px] text-warm-gray mt-1.5 tracking-wide uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Sustainability — NEW ── */}
        <section className="py-20 md:py-28 bg-offwhite relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-forest/[0.02] blur-[80px]" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-kraft/[0.03] blur-[100px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative">
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-center">

              {/* Left: Image in forest frame */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-h-[560px]">
                  <img
                    src={cotton.c1}
                    alt="Handmade cotton paper drying naturally — eco-friendly production"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="text-kraft-light text-xs tracking-widest uppercase mb-2">Our Commitment</div>
                    <div className="text-offwhite text-2xl font-bold leading-tight">
                      Sustainable paper
                      <br />
                      from source to sheet
                    </div>
                  </div>
                </div>
                {/* Floating stat card */}
                <div className="absolute top-3 right-3 md:top-auto md:-bottom-6 md:-right-6 bg-white rounded-2xl shadow-md shadow-forest/10 p-3 md:p-6 border border-forest/5">
                  <div className="text-xl md:text-3xl font-bold text-forest">100%</div>
                  <div className="text-[10px] md:text-xs text-warm-gray mt-1 leading-tight">
                    Tree-free
                    <br />
                    cotton production
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex flex-col gap-10">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-px bg-kraft" />
                    <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                      Sustainability
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
                    Responsible paper
                    <br />
                    <span className="text-forest">by design</span>
                  </h2>
                  <p className="mt-6 text-warm-gray leading-relaxed max-w-lg">
                    Our papers are made from recycled cotton fibres instead of wood pulp, eliminating
                    deforestation from the paper-making process entirely. Every sheet is acid-free
                    and built to last — reducing replacement waste for generations to come.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  {sustainPillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="group h-full flex flex-col p-3 md:p-5 rounded-xl bg-white border border-forest/5 hover:border-forest/15 hover:shadow-lg hover:shadow-forest/5 transition-all duration-300"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-forest/5 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-forest/10 transition-colors">
                        <pillar.icon className="w-4 h-4 md:w-5 md:h-5 text-forest" />
                      </div>
                      <h3 className="text-[13px] md:text-sm font-bold text-charcoal mb-2">{pillar.title}</h3>
                      <p className="text-[11px] md:text-xs text-warm-gray leading-relaxed">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us — IMPROVED ── */}
        <section className="py-20 md:py-28 bg-white relative overflow-hidden">
          <div className="absolute inset-0 kraft-texture opacity-30" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-20">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">Why Choose Us</span>
                <div className="w-8 h-px bg-kraft" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
                Paper with purpose,
                <br />
                <span className="text-forest">delivered with care</span>
              </h2>
              <p className="mt-6 text-warm-gray leading-relaxed">
                When you order from AM Global Paper Store, you get more than sheets — you get a
                partner committed to quality, consistency, and sustainable craftsmanship.
              </p>
            </div>

            {/* Reasons grid — 3-col × 2 rows */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="group relative p-4 md:p-8 rounded-2xl bg-offwhite border border-transparent hover:border-kraft/15 hover:shadow-xl hover:shadow-kraft/5 transition-all duration-500"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-forest/10 to-forest-light/10 flex items-center justify-center mb-4 md:mb-6 group-hover:from-forest/15 group-hover:to-forest-light/15 transition-all duration-300">
                    <reason.icon className="w-4 h-4 md:w-5 md:h-5 text-forest" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-charcoal mb-3">{reason.title}</h3>
                  <p className="hidden md:block text-sm text-warm-gray leading-relaxed mb-5">{reason.desc}</p>
                  <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-kraft-pale/60 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-kraft" />
                    <span className="text-[11px] font-semibold text-forest">{reason.highlight}</span>
                  </div>
                  <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-forest to-kraft scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
                </div>
              ))}
            </div>

            {/* CTA trust banner */}
            <div className="mt-16 md:mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-forest to-forest-light relative overflow-hidden">
              <div className="absolute inset-0 corrugated-pattern opacity-10" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-offwhite">
                    Looking for premium handmade paper?
                  </h3>
                  <p className="text-offwhite/60 mt-2 max-w-md">
                    Get custom sizes, GSM options, and bulk pricing — tailored to your needs.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link
                    href="/papers/contact"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl whitespace-nowrap text-sm"
                  >
                    Request a Quote
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/papers/products"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 text-offwhite font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 whitespace-nowrap text-sm"
                  >
                    Browse Papers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
