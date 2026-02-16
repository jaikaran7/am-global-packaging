import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import PlySection from "@/components/PlySection";
import IndustriesSection from "@/components/IndustriesSection";
import SustainabilitySection from "@/components/SustainabilitySection";
import WhyChooseSection from "@/components/WhyChooseSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

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
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
