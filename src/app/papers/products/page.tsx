import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import PapersProductsPage from "@/components/papers/PapersProductsPage";

export const metadata: Metadata = {
  title: "Paper Collection | AM Global Papers",
  description:
    "Browse handmade cotton paper and marble paper — available in A4, A5, 10×20 cm, and 22×30 inch sizes across 100–350 GSM options. Ships globally.",
};

export default function PapersProductsRoute() {
  return (
    <>
      <main>
        <PapersProductsPage />
      </main>
      <Footer />
    </>
  );
}
