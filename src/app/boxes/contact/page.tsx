import { Suspense } from "react";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function BoxesContactPage() {
  return (
    <>
      <main>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
