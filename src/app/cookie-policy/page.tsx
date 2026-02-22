import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy | AM Global Packaging",
  description:
    "Learn how AM Global Packaging Solutions uses cookies to improve your browsing experience and analyze website performance.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative py-20 md:py-24 bg-white overflow-hidden">
          <div className="absolute inset-0 kraft-texture opacity-30" />
          <div className="mx-auto max-w-[1100px] px-6 md:px-12 lg:px-20 relative">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                  Legal
                </span>
                <div className="w-8 h-px bg-kraft" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
                Cookie Policy
              </h1>
              <p className="mt-4 text-sm text-warm-gray">
                Last Updated: [Insert Date]
              </p>
            </div>

            <div className="bg-offwhite rounded-3xl p-6 md:p-10 border border-kraft/10 space-y-8 text-warm-gray leading-relaxed">
              <p>This website uses cookies to improve your browsing experience.</p>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  1. What Are Cookies?
                </h2>
                <p>
                  Cookies are small text files stored on your device when you visit a website.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  2. How We Use Cookies
                </h2>
                <p>We use cookies to:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Understand website traffic</li>
                  <li>Improve user experience</li>
                  <li>Analyze performance</li>
                  <li>Remember preferences</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  3. Types of Cookies Used
                </h2>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Essential Cookies (site functionality)</li>
                  <li>Analytics Cookies (traffic insights)</li>
                </ul>
                <p className="mt-3">
                  We do not use cookies to collect sensitive personal information.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  4. Managing Cookies
                </h2>
                <p>
                  You may disable cookies in your browser settings. Please note that some
                  features of the website may not function properly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
