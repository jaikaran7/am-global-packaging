import Footer from "@/components/public/Footer";
import PapersProductDetail from "@/components/papers/PapersProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ");
  return {
    title: `${label} | AM Global Papers`,
    description: "Handmade paper product details and quotation.",
  };
}

export default async function PaperProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <PapersProductDetail slug={slug} />
      <Footer />
    </main>
  );
}
