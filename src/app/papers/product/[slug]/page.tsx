import { notFound } from "next/navigation";
import Footer from "@/components/public/Footer";
import PapersProductDetail from "@/components/papers/PapersProductDetail";
import { paperProducts, getPaperProductBySlug } from "@/data/paperProducts";

export function generateStaticParams() {
  return paperProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getPaperProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.shortName} | AM Global Papers`,
    description: product.tagline,
  };
}

export default async function PaperProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getPaperProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <PapersProductDetail product={product} />
      <Footer />
    </main>
  );
}
