import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsPage from "@/components/ProductsPage";

export const metadata = {
  title: "Products — AM Global Packaging Solutions",
  description:
    "Browse our range of Australian-standard pizza boxes. From personal-size to family party — engineered for performance.",
};

export default function ProductsRoute() {
  return (
    <main>
      <Navbar />
      <ProductsPage />
      <Footer />
    </main>
  );
}
