import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | AM Global Packaging Australia",
  description:
    "Learn how AM Global Packaging Solutions collects, uses, and protects personal information in line with Australian privacy principles.",
};

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-warm-gray">
                Last Updated: [Insert Date]
              </p>
            </div>

            <div className="bg-offwhite rounded-3xl p-6 md:p-10 border border-kraft/10 space-y-8 text-warm-gray leading-relaxed">
              <p>
                AM Global Packaging Solutions ("we", "our", "us") respects your
                privacy and is committed to protecting your personal information
                in accordance with Australian privacy principles.
              </p>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  1. Information We Collect
                </h2>
                <p>We may collect the following information when you interact with our website:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Full name</li>
                  <li>Company name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Order details or inquiry information</li>
                  <li>Website usage data (via cookies)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  2. How We Use Your Information
                </h2>
                <p>We use collected information to:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Respond to quote requests</li>
                  <li>Provide product information</li>
                  <li>Improve our website experience</li>
                  <li>Process inquiries and orders</li>
                  <li>Communicate regarding services</li>
                </ul>
                <p className="mt-3">
                  We do not sell, rent, or trade your personal information.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  3. Data Security
                </h2>
                <p>
                  We implement reasonable technical and administrative measures to
                  protect your personal information against unauthorized access,
                  disclosure, or misuse.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  4. Third-Party Services
                </h2>
                <p>We may use third-party services such as:</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>Hosting providers</li>
                  <li>Analytics tools</li>
                  <li>Email communication platforms</li>
                </ul>
                <p className="mt-3">
                  These providers only access information necessary to perform their services.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  5. Cookies &amp; Tracking
                </h2>
                <p>
                  Our website may use cookies to enhance user experience and analyze traffic.
                  You may disable cookies in your browser settings.
                </p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  6. Access &amp; Updates
                </h2>
                <p>
                  You may request access to or correction of your personal information by
                  contacting us at:
                </p>
                <p className="mt-3">hello@amglobalpack.com</p>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2">
                  7. Contact Us
                </h2>
                <p>AM Global Packaging Solutions</p>
                <p>Melbourne, Australia</p>
                <p>Email: hello@amglobalpack.com</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
