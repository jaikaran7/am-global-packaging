"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Download, ArrowRight, LifeBuoy, Package } from "lucide-react";
const DEFAULT_CONTINUE_HREF = "/boxes/products";
const MAIL_SUPPORT = "enquiries@amglobalpackagingsolutions.com";

type Props = Readonly<{
  referenceDisplay: string;
  email: string;
  productTitle: string;
  variantSummary: string;
  totalIncGst: number;
  onDownloadPdf: () => Promise<void>;
  /** Product catalogue to return to after success (default: corrugated products). */
  continueBrowsingHref?: string;
  continueBrowsingLabel?: string;
}>;

export default function CheckoutSuccess({
  referenceDisplay,
  email,
  productTitle,
  variantSummary,
  totalIncGst,
  onDownloadPdf,
  continueBrowsingHref = DEFAULT_CONTINUE_HREF,
  continueBrowsingLabel = "Continue browsing",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-lg text-center px-6 py-16 md:py-24"
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-forest/8 ring-1 ring-forest/15"
      >
        <CheckCircle2 className="h-10 w-10 text-forest" strokeWidth={1.5} aria-hidden />
      </motion.div>

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kraft mb-3">Inquiry received</p>
      <h1 className="text-3xl md:text-[2rem] font-bold text-charcoal tracking-tight leading-tight mb-4">
        Thank you
      </h1>
      <p className="text-warm-gray text-sm leading-relaxed mb-8">
        We&apos;ve logged your enquiry under reference{" "}
        <strong className="text-charcoal">{referenceDisplay}</strong>. We sent a confirmation to{" "}
        <strong className="text-charcoal">{email}</strong> when email delivery is enabled.
      </p>

      <div className="rounded-2xl border border-kraft/12 bg-white px-6 py-5 mb-10 text-left shadow-sm shadow-kraft/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-kraft mb-2">Summary</p>
        <p className="text-sm text-charcoal font-medium">{productTitle}</p>
        <p className="text-xs text-warm-gray mt-1">{variantSummary}</p>
        <p className="mt-4 text-xs text-warm-gray">
          Total estimate (inc. GST){""}
          <span className="block text-xl font-bold text-forest mt-1">
            AUD {totalIncGst.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <button
          type="button"
          onClick={() => void onDownloadPdf()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-kraft/20 bg-white text-charcoal text-sm font-semibold hover:bg-kraft-bg transition-colors shadow-sm shadow-kraft/5"
        >
          <Download className="w-4 h-4 text-kraft" aria-hidden />
          Download inquiry PDF
        </button>
        <Link
          href={continueBrowsingHref}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-forest text-offwhite text-sm font-semibold hover:bg-forest-light transition-colors shadow-lg shadow-forest/18"
        >
          <Package className="w-4 h-4" aria-hidden />
          {continueBrowsingLabel}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>

      <a
        href={`mailto:${MAIL_SUPPORT}?subject=Inquiry ${encodeURIComponent(referenceDisplay)}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-kraft transition-colors"
      >
        <LifeBuoy className="w-4 h-4" aria-hidden />
        Contact support
      </a>
    </motion.div>
  );
}
