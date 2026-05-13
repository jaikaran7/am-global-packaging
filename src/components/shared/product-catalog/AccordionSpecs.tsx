"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function AccordionSpecs({ specs }: { specs: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const PREVIEW = 3;
  const visible = open ? specs : specs.slice(0, PREVIEW);
  const hasMore = specs.length > PREVIEW;

  return (
    <div className="bg-white rounded-2xl border border-kraft/10 p-4 md:p-6 mb-8">
      <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-5">
        Technical Specifications
      </h3>
      <div className="space-y-0">
        {visible.map((spec, i) => (
          <div
            key={spec.label}
            className={`grid grid-cols-[1fr_auto] items-start gap-3 md:flex md:items-center md:justify-between py-2.5 md:py-3.5 ${
              i < visible.length - 1 ? "border-b border-kraft/8" : ""
            }`}
          >
            <span className="text-xs md:text-sm text-warm-gray">{spec.label}</span>
            <span className="text-xs md:text-sm font-semibold text-charcoal text-right md:text-left break-words">
              {spec.value}
            </span>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-kraft transition-colors w-full justify-center py-2 border-t border-kraft/8"
        >
          {open ? "Show less" : `Show ${specs.length - PREVIEW} more`}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      )}
    </div>
  );
}
