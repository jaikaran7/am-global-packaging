import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import BoxesCheckoutFlow from "@/components/checkout/boxes/BoxesCheckoutFlow";
import CheckoutSkeleton from "@/components/checkout/boxes/CheckoutSkeleton";

export const metadata: Metadata = {
  title: "Purchase inquiry — AM Global Packaging Solutions",
  description:
    "Submit a B2B enquiry for corrugated packaging. Our team will confirm pricing, shipping, and customization.",
};

export default function BoxesCheckoutPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <div className="pt-20">
        <Suspense fallback={<CheckoutSkeleton />}>
          <BoxesCheckoutFlow />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
