import { Suspense } from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/public/Footer";
import ProductDetailPage from "@/components/public/ProductDetailPage";
import ProductsPage from "@/components/public/ProductsPage";
import {
  products,
  getProductBySlug,
  isCategoryRouteSlug,
} from "@/data/products";

export function generateStaticParams() {
  const productSlugs = products.map((p) => ({ slug: p.slug }));
  const categorySlugs = [
    "pizza-boxes",
    "a4-boxes",
    "specialty-heavy-duty",
    "e-commerce",
    "vegetable-boxes",
    "poultry-boxes",
  ];
  return [...productSlugs, ...categorySlugs.map((slug) => ({ slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.shortName} — AM Global Packaging Solutions`,
    description: product.tagline,
  };
}

export default async function BoxesProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isCategoryRouteSlug(slug)) {
    return (
      <main>
        <div className="pt-20">
          <ProductsPage />
          <Footer />
        </div>
      </main>
    );
  }

  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main>
      <div className="pt-20">
        <Suspense fallback={null}>
          <ProductDetailPage product={product} />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
