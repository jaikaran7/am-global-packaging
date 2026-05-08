import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { FileText, Package } from "lucide-react";

export default function ProductLineSwitcherPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-5rem)] bg-offwhite pt-28 pb-20">
        <div className="mx-auto max-w-[960px] px-6 md:px-12">
          <p className="text-center text-xs font-semibold tracking-[0.25em] text-kraft uppercase mb-4">
            AM Global Packaging
          </p>
          <h1 className="text-center text-3xl md:text-4xl font-bold text-charcoal tracking-tight mb-3">
            Choose a product line
          </h1>
          <p className="text-center text-warm-gray max-w-lg mx-auto mb-14 leading-relaxed">
            Select handmade papers or corrugated boxes. You can switch lines anytime from the navigation bar.
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Link
              href="/papers/home"
              className="group flex flex-col rounded-2xl border border-kraft/15 bg-white p-8 md:p-10 shadow-sm hover:shadow-lg hover:border-kraft/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mb-6 group-hover:bg-forest/15 transition-colors">
                <FileText className="w-6 h-6 text-forest" aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2">Papers</h2>
              <p className="text-sm text-warm-gray leading-relaxed flex-1 mb-6">
                Handmade cotton and marble papers for stationery, binding, and luxury packaging.
              </p>
              <span className="text-sm font-semibold text-forest group-hover:text-kraft transition-colors">
                Go to Papers →
              </span>
            </Link>

            <Link
              href="/boxes/home"
              className="group flex flex-col rounded-2xl border border-kraft/15 bg-white p-8 md:p-10 shadow-sm hover:shadow-lg hover:border-kraft/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-kraft-pale flex items-center justify-center mb-6 group-hover:bg-kraft-pale/80 transition-colors">
                <Package className="w-6 h-6 text-kraft" aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2">Corrugated Boxes</h2>
              <p className="text-sm text-warm-gray leading-relaxed flex-1 mb-6">
                Australian-standard corrugated packaging, custom sizes, and bulk supply.
              </p>
              <span className="text-sm font-semibold text-forest group-hover:text-kraft transition-colors">
                Go to Corrugated Boxes →
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
