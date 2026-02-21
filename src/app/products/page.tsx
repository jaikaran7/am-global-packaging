import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ProductsPage from "@/components/public/ProductsPage";

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
