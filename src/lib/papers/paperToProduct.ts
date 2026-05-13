import type { Product } from "@/data/products";

/** Parse "210 × 297 mm" / "210x297" style strings into mm triples for catalog visuals */
export function parseDimensionsToDetail(
  label: string | null | undefined
): { length: number; width: number; height: number } | null {
  if (!label) return null;
  const nums = label.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const length = Math.round(Number(nums[0]));
  const width = Math.round(Number(nums[1]));
  const height = nums[2] != null ? Math.round(Number(nums[2])) : 1;
  return { length, width, height };
}

function gsmRangeFromOptions(gsmOptions: number[]): string {
  if (gsmOptions.length === 0) return "—";
  if (gsmOptions.length === 1) return `${gsmOptions[0]} GSM`;
  const sorted = [...gsmOptions].sort((a, b) => a - b);
  return `${sorted[0]} – ${sorted[sorted.length - 1]} GSM`;
}

function plyOptionsFromGsm(gsmOptions: number[]): string[] {
  if (gsmOptions.length === 0) return ["—"];
  return gsmOptions.map((g) => `${g} GSM`);
}

function categoryKeyFromPaperType(paperType: string | null): Product["category"] {
  return paperType === "marble" ? "specialty" : "general-purpose";
}

export type PaperListingInput = {
  slug: string;
  title: string;
  short_description: string | null;
  paper_type: string | null;
  size_label: string | null;
  dimensions_label: string | null;
  feature_badges: string[];
  use_cases: string[];
  gsm_options: number[];
  total_stock: number;
  primary_image_url: string | null;
};

export function mapPaperListingToProduct(
  p: PaperListingInput,
  categoryLabel: string
): Product {
  const dimStr = p.dimensions_label ?? p.size_label ?? "—";
  const dimensionDetail =
    parseDimensionsToDetail(p.dimensions_label ?? p.size_label) ?? {
      length: 210,
      width: 297,
      height: 1,
    };
  const fallback =
    p.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png";
  const primary = p.primary_image_url ?? fallback;
  const images = [primary, primary];

  return {
    slug: p.slug,
    name: p.title,
    shortName: p.title,
    tagline: p.short_description ?? "",
    description: p.short_description ?? "",
    dimensions: dimStr,
    dimensionDetail,
    category: categoryKeyFromPaperType(p.paper_type),
    categoryLabel,
    useCases: p.use_cases ?? [],
    plyOptions: plyOptionsFromGsm(p.gsm_options ?? []),
    gsmRange: gsmRangeFromOptions(p.gsm_options ?? []),
    material: "Handmade paper",
    printOptions: categoryLabel,
    moq: "",
    availability:
      p.total_stock > 0
        ? "In stock — ships within 3–5 business days"
        : "Out of stock — notify me",
    features: p.feature_badges ?? [],
    specs: [
      { label: "Dimensions", value: dimStr },
      { label: "GSM Range", value: gsmRangeFromOptions(p.gsm_options ?? []) },
      { label: "Type", value: categoryLabel },
    ],
    relatedSlugs: [],
    images,
  };
}

export type PaperDetailVariantInput = {
  id: string;
  name: string;
  price: number;
  gsm: number | null;
  currency: string;
  tax_rate_percent: number | null;
  stock: number;
  is_available?: boolean;
  size_label: string | null;
};

export type PaperDetailInput = {
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  variants: PaperDetailVariantInput[];
  images: { url: string; is_primary: boolean }[];
  gsm_options: number[];
  feature_badges: string[];
  paper_type: string | null;
  size_label: string | null;
  dimensions_label: string | null;
  use_cases: string[];
};

export function mapPaperDetailToProduct(
  p: PaperDetailInput,
  selectedVariant: PaperDetailVariantInput | null,
  categoryLabel: string
): Product {
  const dimStr = p.dimensions_label ?? p.size_label ?? "—";
  const dimensionDetail =
    parseDimensionsToDetail(p.dimensions_label ?? p.size_label) ?? {
      length: 210,
      width: 297,
      height: 1,
    };
  const sortedUrls = [...(p.images ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((i) => i.url)
    .filter(Boolean);
  const fallback =
    p.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png";
  const images = sortedUrls.length > 0 ? sortedUrls : undefined;

  const gst = selectedVariant?.tax_rate_percent ?? 10;
  const unit = selectedVariant?.price ?? 0;
  const withGst = Math.round(unit * (1 + gst / 100) * 100) / 100;
  const canBuy =
    selectedVariant != null &&
    selectedVariant.is_available !== false &&
    selectedVariant.stock > 0;

  const variantLine = selectedVariant
    ? `${selectedVariant.name} · $${unit.toFixed(unit % 1 === 0 ? 0 : 2)} ${selectedVariant.currency || "AUD"} excl. GST (+ ${gst}% → $${withGst.toFixed(2)} incl.)`
    : "";
  const printOptions =
    variantLine !== ""
      ? `${categoryLabel}, ${variantLine}`
      : `${categoryLabel}, Handmade sheet`;

  return {
    slug: p.slug,
    name: p.title,
    shortName: p.title,
    tagline: p.short_description ?? p.description ?? "",
    description: p.description ?? p.short_description ?? "",
    dimensions: dimStr,
    dimensionDetail,
    category: categoryKeyFromPaperType(p.paper_type),
    categoryLabel,
    useCases: p.use_cases ?? [],
    plyOptions: plyOptionsFromGsm(p.gsm_options ?? []),
    gsmRange: gsmRangeFromOptions(p.gsm_options ?? []),
    material: "Handmade cotton / marble fibre",
    printOptions,
    moq: "",
    availability: canBuy
      ? "In stock — ships within 3–5 business days"
      : "Currently unavailable for checkout",
    features:
      p.feature_badges?.length > 0
        ? p.feature_badges
        : [p.short_description ?? p.description ?? "Premium handmade paper"],
    specs: [
      { label: "Dimensions", value: dimStr },
      { label: "Size", value: p.size_label ?? "—" },
      {
        label: "Selected variant",
        value: selectedVariant?.name ?? "—",
      },
      {
        label: "GSM",
        value: selectedVariant?.gsm != null ? `${selectedVariant.gsm} GSM` : gsmRangeFromOptions(p.gsm_options ?? []),
      },
      {
        label: "Stock (this variant)",
        value: selectedVariant != null ? String(selectedVariant.stock) : "—",
      },
    ],
    relatedSlugs: [],
    images,
  };
}

export type PaperRelatedCardInput = {
  slug: string;
  title: string;
  short_description: string | null;
  primary_image_url: string | null;
  paper_type: string | null;
};

export function mapPaperRelatedToProduct(
  r: PaperRelatedCardInput,
  marbleLabel: string,
  cottonLabel: string
): Product {
  const categoryLabel = r.paper_type === "marble" ? marbleLabel : cottonLabel;
  const dim = "—";
  const fallback =
    r.paper_type === "marble" ? "/assets/papers/marble-02.png" : "/assets/papers/cotton-01.png";
  const primary = r.primary_image_url ?? fallback;
  return {
    slug: r.slug,
    name: r.title,
    shortName: r.title,
    tagline: r.short_description ?? "",
    description: r.short_description ?? "",
    dimensions: dim,
    dimensionDetail: { length: 210, width: 297, height: 1 },
    category: categoryKeyFromPaperType(r.paper_type),
    categoryLabel,
    useCases: [],
    plyOptions: ["—"],
    gsmRange: "—",
    material: "Handmade paper",
    printOptions: categoryLabel,
    moq: "",
    availability: "View product for availability",
    features: [],
    specs: [],
    relatedSlugs: [],
    images: [primary, primary],
  };
}
