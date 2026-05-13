import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import PapersQuoteForm from "@/components/papers/PapersQuoteForm";

export const metadata: Metadata = {
  title: "Contact & Quote | AM Global Papers",
  description:
    "Get in touch with AM Global Papers or request a quote for handmade cotton or marble paper — custom sizes and GSM options available.",
};

export default function PapersContactPage() {
  return (
    <>
      <main className="pt-20">
        <Suspense fallback={null}>
          <PapersQuoteForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
