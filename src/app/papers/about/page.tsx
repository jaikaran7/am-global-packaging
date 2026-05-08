import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import PapersAboutSection from "@/components/papers/PapersAboutSection";

export const metadata: Metadata = {
  title: "About | AM Global Papers",
  description:
    "Learn about our handmade cotton and marble paper sourcing — traditional Indian craft, sustainable materials, and global supply.",
};

export default function PapersAboutPage() {
  return (
    <>
      <main>
        <PapersAboutSection />
      </main>
      <Footer />
    </>
  );
}
