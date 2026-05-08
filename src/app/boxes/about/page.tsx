import AboutSection from "@/components/public/AboutSection";
import IndustriesSection from "@/components/public/IndustriesSection";
import SustainabilitySection from "@/components/public/SustainabilitySection";
import WhyChooseSection from "@/components/public/WhyChooseSection";
import Footer from "@/components/public/Footer";

export default function BoxesAboutPage() {
  return (
    <>
      <main>
        <AboutSection />
        <IndustriesSection />
        <SustainabilitySection />
        <WhyChooseSection />
      </main>
      <Footer />
    </>
  );
}
