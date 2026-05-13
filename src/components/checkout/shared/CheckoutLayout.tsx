"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { CheckoutStepper, type CheckoutStep } from "./CheckoutStepper";

export type CheckoutLayoutProps = {
  steps: CheckoutStep[];
  activeStepId: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
  /** Slot rendered above breadcrumb / hero — typically an error banner. */
  topSlot?: ReactNode;
  /** Left column content (the multi-step form). */
  children: ReactNode;
  /** Right column content (the sticky order summary). */
  summarySlot: ReactNode;
  /** Mobile sticky bottom CTA (entire bar contents). */
  mobileStickyCta?: ReactNode;
};

export function CheckoutLayout({
  steps,
  activeStepId,
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = "Back to product",
  topSlot,
  children,
  summarySlot,
  mobileStickyCta,
}: CheckoutLayoutProps) {
  return (
    <div className="bg-offwhite min-h-[80vh]">
      {/* Step rail */}
      <div className="border-b border-kraft/10 bg-white/85 backdrop-blur-md sticky top-[4.25rem] z-30">
        <div className="mx-auto max-w-[1440px] px-5 md:px-12 lg:px-16 py-3 md:py-4 flex items-center justify-between gap-6">
          <Link
            href={backHref}
            className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-warm-gray hover:text-forest transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            {backLabel}
          </Link>
          <div className="flex-1 min-w-0 overflow-x-auto md:overflow-visible scrollbar-none">
            <CheckoutStepper steps={steps} activeId={activeStepId} />
          </div>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            Secure inquiry
          </span>
        </div>
      </div>

      {topSlot && (
        <div className="mx-auto max-w-[1440px] px-5 md:px-12 lg:px-16 pt-5">{topSlot}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-[1440px] px-5 md:px-12 lg:px-16 py-8 md:py-12"
      >
        <Link
          href={backHref}
          className="md:hidden inline-flex items-center gap-2 text-xs font-semibold text-warm-gray hover:text-forest transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          {backLabel}
        </Link>

        <header className="mb-8 md:mb-10">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] text-kraft mb-2 md:mb-3">
            {eyebrow}
          </p>
          <h1 className="text-2xl md:text-[2rem] lg:text-[2.25rem] font-bold text-charcoal tracking-tight leading-[1.15]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-warm-gray text-sm md:text-base mt-2 md:mt-3 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-8 lg:gap-10 items-start">
          {/* Left: form sections */}
          <div className="space-y-6 md:space-y-7 pb-28 lg:pb-0">{children}</div>

          {/* Right: sticky summary */}
          <div className="lg:sticky lg:top-[8.25rem] lg:self-start order-first lg:order-none">
            {summarySlot}
          </div>
        </div>
      </motion.div>

      {mobileStickyCta && (
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-kraft/15 bg-white/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(16,18,20,0.06)]"
          role="region"
          aria-label="Checkout actions"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-3">{mobileStickyCta}</div>
        </div>
      )}
    </div>
  );
}
