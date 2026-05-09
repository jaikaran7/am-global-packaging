/** Public marketing photos (same paths as storefront papers UI). */
export const PAPERS_IMAGE_MARBLE_DEFAULT = "/assets/papers/marble-02.png";
export const PAPERS_IMAGE_COTTON_DEFAULT = "/assets/papers/cotton-01.png";

/**
 * Pick hero image for a paper product when no `product_images` row exists.
 * Uses `meta.paper_type` first, then category slug.
 */
export function getPapersMarketingImageUrl(
  meta: Record<string, unknown> | null | undefined,
  categorySlug?: string | null
): string {
  const paperType = typeof meta?.paper_type === "string" ? meta.paper_type.toLowerCase() : "";
  if (paperType === "marble") return PAPERS_IMAGE_MARBLE_DEFAULT;
  if (paperType === "cotton") return PAPERS_IMAGE_COTTON_DEFAULT;

  const slug = (categorySlug ?? "").toLowerCase();
  if (slug === "marble-paper" || slug.includes("marble")) return PAPERS_IMAGE_MARBLE_DEFAULT;
  if (slug === "white-handmade-cotton-paper" || slug.includes("cotton")) return PAPERS_IMAGE_COTTON_DEFAULT;

  return PAPERS_IMAGE_COTTON_DEFAULT;
}
