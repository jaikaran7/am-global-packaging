import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Papers | AM Global",
  description:
    "Handmade white cotton paper and hand-marbled decorative papers—natural texture, craft, and quiet luxury for invitations, binding, and packaging.",
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

export default function PapersPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: papersStyles }} />
      <Navbar />
      <div className="bg-[#faf9f6] font-['Inter',sans-serif] text-[#1f2421] antialiased">
        {/* Hero — cotton-forward, light */}
        <header className="relative bg-[#f3f1ec] border-b border-[#e5e2dc]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[min(92vh,880px)] py-16 md:py-24 pt-24 md:pt-28">
            <div className="order-1">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 border border-[#e5e2dc] text-[#5c574c] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-6">
                Handmade Cotton Paper
              </span>
              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] md:text-[clamp(2.75rem,4.5vw,4.25rem)] font-extrabold tracking-tight leading-[1.08] text-[#1f2421] mb-6">
                Crafted by Hand.
                <br />
                <span className="text-[#7d6a4c]">From Pure Cotton.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#5a5f5c] max-w-xl mb-10 leading-relaxed font-normal">
                Handmade from 100% cotton pulp using traditional techniques,
                creating a soft, natural texture for premium print and packaging.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="bg-[#7d6a4c] text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-[#6a5a41] transition-colors shadow-sm"
                >
                  Explore Cotton Papers
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#c9c4bb] text-[#3d4540] font-semibold text-sm tracking-wide hover:bg-white/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    play_circle
                  </span>
                  Our Process
                </button>
              </div>
            </div>
            <div className="order-2 lg:order-2 relative">
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

        {/* Our Papers — 2 products only, ~70 / 30 */}
        <section
          id="our-papers"
          className="py-20 md:py-28 bg-white border-b border-[#eeece8]"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mb-14">
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                Our Papers
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421]">
                Two collections, one standard of care.
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Primary: Handmade Cotton */}
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
                    Handmade Cotton
                  </h3>
                  <p className="text-[#5a5f5c] leading-relaxed mb-8 flex-1 max-w-xl">
                    Soft, textured, natural cotton paper for invitations,
                    bookbinding, and premium packaging.
                  </p>
                  <button
                    type="button"
                    className="self-start bg-[#1f2421] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#2d3330] transition-colors"
                  >
                    View Collection
                  </button>
                </div>
              </article>
              {/* Secondary: Marble */}
              <article className="lg:col-span-4 group flex flex-col rounded-2xl overflow-hidden bg-[#f7f6f3] ring-1 ring-[#e8e5df] shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[220px] bg-[#1a2e28]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    alt="Hand-marbled decorative paper with flowing color patterns"
                    src={marble.m4}
                  />
                </div>
                <div className="flex flex-col flex-1 p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1f2421] mb-3">
                    Marble Paper
                  </h3>
                  <p className="text-[#5a5f5c] text-sm leading-relaxed mb-8 flex-1">
                    Hand-marbled decorative papers with unique flowing patterns.
                  </p>
                  <button
                    type="button"
                    className="self-start border border-[#c9c4bb] text-[#1f2421] px-7 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Explore Designs
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Product: Handmade Cotton Paper (first) */}
        <section className="py-20 md:py-28 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden bg-white ring-1 ring-[#ebe8e2] shadow-sm">
              <img
                className="w-full h-auto object-cover"
                alt="Handmade white cotton paper showing natural fiber texture and deckle edges"
                src={cotton.c6}
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                Handmade Cotton Paper
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
                The quiet foundation of memorable print.
              </h2>
              <ul className="space-y-3 mb-10 text-[#3d4540]">
                <li className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>Handmade sheet formation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>100% cotton pulp</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>Soft, natural surface texture</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7d6a4c] font-medium">·</span>
                  <span>Classic deckle edges</span>
                </li>
              </ul>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8680] mb-3">
                Where it shines
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-[#5a5f5c]">
                <li className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-[#ebe8e2]">
                  Wedding Invitations
                </li>
                <li className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-[#ebe8e2]">
                  Book Binding
                </li>
                <li className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-[#ebe8e2]">
                  Luxury Packaging
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Product: Marble Paper (second) */}
        <section className="py-20 md:py-28 bg-white border-y border-[#eeece8]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <p className="text-[#7d6a4c] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                Marble Paper
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-6">
                Color and movement, never twice the same.
              </h2>
              <p className="text-[#5a5f5c] leading-relaxed mb-6 max-w-md">
                Each sheet carries its own rhythm of pigment—ideal when you
                want endpapers, wraps, or accents that feel alive and
                unmistakably hand-finished.
              </p>
              <p className="text-[#5a5f5c] leading-relaxed max-w-md">
                Rich, flowing patterns complement cotton suites for binding,
                stationery, and packaging layers that reward a closer look.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  alt="Hand-marbled paper in mint and coral tones"
                  src={marble.m2}
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-black/[0.06] shadow-sm translate-y-6">
                <img
                  className="w-full h-full object-cover"
                  alt="Hand-marbled paper with deep pattern variation"
                  src={marble.m3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Where It’s Used */}
        <section className="py-20 md:py-28 bg-[#f3f1ec]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2421] mb-12 md:mb-16 text-center">
              Where It&apos;s Used
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Wedding Invitations",
                  desc: "Deckled cotton sheets for suites that feel personal from the first touch.",
                  img: cotton.c3,
                  alt: "Wedding invitation suite on handmade cotton paper",
                },
                {
                  title: "Book Binding",
                  desc: "Endpapers and inserts with weight, texture, and longevity.",
                  img: cotton.c4,
                  alt: "Handmade paper suited for fine binding and endpapers",
                },
                {
                  title: "Stationery",
                  desc: "Letterhead, envelopes, and notes with a calm, natural surface.",
                  img: cotton.c5,
                  alt: "Stacks of handmade cotton envelopes and stationery",
                },
                {
                  title: "Luxury Packaging",
                  desc: "Layers and wraps that signal care before the box is opened.",
                  img: cotton.c1,
                  alt: "Premium cotton paper for luxury packaging applications",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl overflow-hidden bg-white ring-1 ring-[#e8e5df] shadow-sm flex flex-col"
                >
                  <div className="aspect-[5/4] bg-[#ebe8e2]">
                    <img
                      className="w-full h-full object-cover"
                      alt={item.alt}
                      src={item.img}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-[#1f2421] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5a5f5c] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 bg-[#eae8e4]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight text-[#1f2421] leading-tight mb-8">
              Bring Craft Into Every Detail
            </h2>
            <button
              type="button"
              className="bg-[#1f2421] text-white px-10 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-[#2d3330] transition-colors shadow-sm"
            >
              Request Samples
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
