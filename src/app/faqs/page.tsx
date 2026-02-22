import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import FaqsClient from "./FaqsClient";

export const metadata: Metadata = {
  title: "Corrugated Packaging FAQs | AM Global Packaging",
  description:
    "Find answers about 3-ply, 5-ply, and 7-ply boxes, GSM specifications, custom cartons, Amazon FBA packaging, and sourcing for Australian businesses.",
};

const faqs = [
  {
    question:
      "What is the difference between 3-ply, 5-ply, and 7-ply corrugated boxes?",
    answer:
      "3-ply boxes consist of one fluted layer between two liners and are suitable for lightweight products. 5-ply boxes provide additional strength for medium-weight goods and shipping. 7-ply cartons are designed for heavy-duty, export, and industrial applications.",
  },
  {
    question: "What does GSM mean in corrugated packaging?",
    answer:
      "GSM (Grams per Square Meter) measures the weight of paper used in corrugated boards. Higher GSM typically indicates stronger liner or fluting paper, improving durability and stacking strength.",
  },
  {
    question: "What is the minimum order quantity (MOQ)?",
    answer:
      "Our minimum order quantity typically starts from 200–500 units depending on box type and customization requirements.",
  },
  {
    question: "Do you supply custom-size corrugated boxes?",
    answer:
      "Yes. We supply custom-sized corrugated cartons tailored to your product dimensions, weight, and shipping requirements.",
  },
  {
    question: "Do you offer food-grade corrugated packaging?",
    answer:
      "Yes. We supply food-grade corrugated boxes suitable for pizza, takeaway, fresh produce, and poultry packaging.",
  },
  {
    question: "Are your boxes suitable for Amazon FBA?",
    answer:
      "Yes. Our e-commerce cartons are designed to meet FBA packaging guidelines for safe and compliant shipping.",
  },
  {
    question: "Do you supply heavy-duty export cartons?",
    answer:
      "Yes. We provide 5-ply and 7-ply cartons suitable for export, bulk storage, and industrial shipping.",
  },
  {
    question: "How long does delivery take in Australia?",
    answer:
      "Delivery timelines vary depending on order volume and product type, but standard processing typically occurs within business days after confirmation.",
  },
  {
    question: "Can I request bulk pricing?",
    answer:
      "Yes. For large-volume orders, please contact our team for custom pricing and supply planning.",
  },
  {
    question: "Where are your packaging products sourced?",
    answer:
      "We collaborate with quality-certified corrugated manufacturing partners across India and Asia to supply Australian businesses.",
  },
];

export default function FaqsPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name:
                  "What is the difference between 3-ply, 5-ply, and 7-ply corrugated boxes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "3-ply boxes consist of one fluted layer between two liners and are suitable for lightweight products. 5-ply boxes provide additional strength for medium-weight goods and shipping. 7-ply cartons are designed for heavy-duty, export, and industrial applications.",
                },
              },
              {
                "@type": "Question",
                name: "What does GSM mean in corrugated packaging?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "GSM (Grams per Square Meter) measures the weight of paper used in corrugated boards. Higher GSM typically indicates stronger liner or fluting paper, improving durability and stacking strength.",
                },
              },
              {
                "@type": "Question",
                name: "What is the minimum order quantity (MOQ)?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Minimum order quantities typically start from 200 to 500 units depending on box type and customization requirements.",
                },
              },
              {
                "@type": "Question",
                name: "Do you supply custom-size corrugated boxes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes, we supply custom-sized corrugated cartons tailored to your product dimensions, weight, and shipping requirements.",
                },
              },
              {
                "@type": "Question",
                name: "Are your boxes suitable for Amazon FBA?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes, our e-commerce cartons are designed to meet Amazon FBA packaging guidelines for safe and compliant shipping.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer food-grade corrugated packaging?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes, we supply food-grade corrugated boxes suitable for pizza, takeaway, fresh produce, and poultry packaging.",
                },
              },
              {
                "@type": "Question",
                name: "Do you supply heavy-duty export cartons?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes, we provide 5-ply and 7-ply cartons suitable for export, bulk storage, and industrial shipping.",
                },
              },
              {
                "@type": "Question",
                name: "How long does delivery take in Australia?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Delivery timelines vary depending on order volume and product type, but standard processing typically occurs within business days after confirmation.",
                },
              },
              {
                "@type": "Question",
                name: "Can I request bulk pricing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. For large-volume orders, please contact our team for custom pricing and supply planning.",
                },
              },
              {
                "@type": "Question",
                name: "Where are your packaging products sourced?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "We collaborate with quality-certified corrugated manufacturing partners across India and Asia to supply Australian businesses.",
                },
              },
            ],
          }),
        }}
      />
      <Navbar />
      <main>
        <section className="relative py-20 md:py-24 bg-white overflow-hidden">
          <div className="absolute inset-0 kraft-texture opacity-30" />
          <div className="mx-auto max-w-[1100px] px-6 md:px-12 lg:px-20 relative">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                  FAQs
                </span>
                <div className="w-8 h-px bg-kraft" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
                Frequently Asked Questions About Corrugated Packaging
              </h1>
            </div>
            <FaqsClient faqs={faqs} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
