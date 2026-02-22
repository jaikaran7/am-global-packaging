import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | AM Global Packaging",
  description:
    "Read the terms of service for AM Global Packaging Solutions, including website use, product information, quotes, and liability.",
};

export default function TermsOfServicePage() {
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
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-warm-gray">
                Effective Date: [Insert Date]
              </p>
            </div>

            <div className="bg-offwhite rounded-3xl p-6 md:p-10 border border-kraft/10 space-y-8 text-warm-gray leading-relaxed">
              <p>
                By accessing or using this website, you agree to comply with these Terms of
                Service.
              </p>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  1. Website Use
                </h2>
                <p>You agree to use this website for lawful purposes only. You must not:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Submit false information</li>
                  <li>Attempt to breach security</li>
                  <li>Copy or misuse website content</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  2. Product Information
                </h2>
                <p>
                  Product descriptions, specifications, and availability are subject to change
                  without notice.
                </p>
                <p className="mt-3">Images are for illustrative purposes only.</p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  3. Quotes &amp; Orders
                </h2>
                <p>All quotes provided are subject to:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Product availability</li>
                  <li>Final specification confirmation</li>
                  <li>Written agreement</li>
                </ul>
                <p className="mt-3">Bulk orders may require deposit confirmation.</p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  4. Intellectual Property
                </h2>
                <p>
                  All content on this website, including text, graphics, logos, and product
                  visuals, are the property of AM Global Packaging Solutions and may not be
                  copied or reproduced without permission.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  5. Limitation of Liability
                </h2>
                <p>We are not liable for:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Indirect or consequential losses</li>
                  <li>Delays caused by third-party suppliers</li>
                  <li>Website downtime or technical issues</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  6. Governing Law
                </h2>
                <p>These terms are governed by the laws of Australia.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
