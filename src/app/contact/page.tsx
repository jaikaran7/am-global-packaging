import { Suspense } from "react";
import Navbar from "@/components/public/Navbar";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
