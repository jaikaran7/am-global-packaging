import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailPage from "@/components/ProductDetailPage";
import {
  products,
  getProductBySlug,
  isCategoryRouteSlug,
  getCategoryIdByRouteSlug,
  getDefaultSlugForCategory,
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

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isCategoryRouteSlug(slug)) {
    const categoryId = getCategoryIdByRouteSlug(slug);
    if (categoryId) {
      const defaultProductSlug = getDefaultSlugForCategory(categoryId);
      redirect(`/products/${defaultProductSlug}?from=all`);
    }
  }

  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main>
      <Navbar />
      <Suspense fallback={null}>
        <ProductDetailPage product={product} />
      </Suspense>
      <Footer />
    </main>
  );
}
