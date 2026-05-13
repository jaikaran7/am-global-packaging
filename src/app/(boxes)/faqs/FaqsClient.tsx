"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Faq = {
  question: string;
  answer: string;
};

type Props = {
  faqs: Faq[];
};

export default function FaqsClient({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-4 md:gap-6">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="bg-offwhite rounded-2xl border border-kraft/10 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left p-6 md:p-7"
            >
              <span className="text-base md:text-lg font-semibold text-charcoal">
                {faq.question}
              </span>
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full border border-kraft/20 text-kraft transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {isOpen && (
              <div className="px-6 md:px-7 pb-6 md:pb-7">
                <p className="text-warm-gray leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
