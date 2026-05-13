import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import PapersCheckoutFlow from "@/components/checkout/papers/PapersCheckoutFlow";
import CheckoutSkeleton from "@/components/checkout/boxes/CheckoutSkeleton";

export const metadata: Metadata = {
  title: "Paper purchase inquiry | AM Global Papers",
  description:
    "Submit a B2B enquiry for handmade cotton or marble papers. Our team confirms pricing, GST, and shipping.",
};

export default function PapersCheckoutPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <div className="pt-20">
        <Suspense fallback={<CheckoutSkeleton />}>
          <PapersCheckoutFlow />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
