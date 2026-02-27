import { Suspense } from "react";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import ProductsSection from "@/components/public/ProductsSection";
import PlySection from "@/components/public/PlySection";
import IndustriesSection from "@/components/public/IndustriesSection";
import SustainabilitySection from "@/components/public/SustainabilitySection";
import WhyChooseSection from "@/components/public/WhyChooseSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductsSection />
        <PlySection />
        <IndustriesSection />
        <SustainabilitySection />
        <WhyChooseSection />
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
