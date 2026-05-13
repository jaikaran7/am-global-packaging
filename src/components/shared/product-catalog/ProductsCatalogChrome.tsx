"use client";

import type { RefObject, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Filter, X, ChevronRight } from "lucide-react";

export type ProductsCatalogChromeProps = {
  homeHref: string;
  headerRef: RefObject<HTMLDivElement | null>;
  headerInView: boolean;
  breadcrumbCurrentLabel: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroStats: ReactNode;
  sidebarDesktop: ReactNode;
  sidebarMobile: ReactNode;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
  toolbarSummary: ReactNode;
  children: ReactNode;
  bottomCtaTitle: string;
  bottomCtaDescription: string;
  bottomCtaHref: string;
  bottomCtaButtonLabel: string;
};

export function ProductsCatalogChrome({
  homeHref,
  headerRef,
  headerInView,
  breadcrumbCurrentLabel,
  heroTitleLine1,
  heroTitleLine2,
  heroDescription,
  heroStats,
  sidebarDesktop,
  sidebarMobile,
  mobileFilterOpen,
  setMobileFilterOpen,
  toolbarSummary,
  children,
  bottomCtaTitle,
  bottomCtaDescription,
  bottomCtaHref,
  bottomCtaButtonLabel,
}: ProductsCatalogChromeProps) {
  return (
    <div className="min-h-screen bg-offwhite">
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-forest">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)",
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-offwhite to-transparent" />

        <div ref={headerRef} className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-kraft-light/80 text-sm mb-4">
              <Link href={homeHref} className="hover:text-kraft-light transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-offwhite">{breadcrumbCurrentLabel}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite tracking-tight leading-[1.08]">
              {heroTitleLine1}
              <br />
              <span className="text-kraft-light">{heroTitleLine2}</span>
            </h1>
            <p className="mt-5 text-offwhite/60 text-base md:text-lg max-w-xl leading-relaxed">
              {heroDescription}
            </p>
            {heroStats}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-14">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-5 py-3 bg-white border border-kraft/10 rounded-xl text-sm font-medium text-charcoal shadow-sm w-fit"
          >
            <Filter className="w-4 h-4" />
            Filters & Options
          </button>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">{sidebarDesktop}</div>
          </aside>

          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFilterOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 bottom-0 w-[300px] bg-offwhite p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-charcoal">Filters</h3>
                  <button type="button" onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-charcoal" />
                  </button>
                </div>
                {sidebarMobile}
              </motion.div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-8">{toolbarSummary}</div>
            {children}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 bg-gradient-to-r from-forest via-forest-light to-forest rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 corrugated-pattern opacity-10" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold text-offwhite mb-3">{bottomCtaTitle}</h3>
                <p className="text-offwhite/60 mb-6 max-w-lg mx-auto text-sm">{bottomCtaDescription}</p>
                <Link
                  href={bottomCtaHref}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-colors shadow-lg shadow-kraft/25 text-sm"
                >
                  {bottomCtaButtonLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
