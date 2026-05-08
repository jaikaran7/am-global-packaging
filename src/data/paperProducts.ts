export interface PaperProduct {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  type: "cotton" | "marble";
  categories: PaperProductCategory[];
  sizeLabel: string;
  dimensions: string;
  gsmOptions: number[];
  description: string;
  features: string[];
  useCases: string[];
  images: string[];
  relatedSlugs: string[];
}

export type PaperProductCategory = "cotton" | "marble" | "art" | "custom";

export const PAPER_SIZES = [
  { label: "A4", dimensions: "210 × 297 mm" },
  { label: "A5", dimensions: "148 × 210 mm" },
  { label: "10 × 20 cm", dimensions: "100 × 200 mm" },
  { label: "22 × 30 inch", dimensions: "558.8 × 762 mm" },
] as const;

export const PAPER_GSM_OPTIONS = [100, 200, 250, 320, 350] as const;

export const PAPER_FEATURES = [
  "Handmade",
  "Made from cotton rags",
  "Each sheet has unique patterns",
  "Acid-free",
  "Tree-free",
  "Eco-friendly",
  "Made in India",
  "Ships globally",
] as const;

export const paperProducts: PaperProduct[] = [
  {
    id: "cotton-a4",
    slug: "cotton-a4",
    name: "Handmade Cotton Paper — A4",
    shortName: "Cotton Paper A4",
    tagline: "Premium handmade cotton paper in A4 format",
    type: "cotton",
    categories: ["cotton"],
    sizeLabel: "A4",
    dimensions: "210 × 297 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "Our A4 handmade cotton paper is crafted from 100% cotton rags using traditional techniques. Each sheet features natural texture and soft deckle edges, perfect for premium print, invitations, and fine stationery.",
    features: [
      "Handmade sheet formation",
      "100% cotton rag composition",
      "Natural deckle edges",
      "Acid-free & tree-free",
      "Unique texture on every sheet",
      "Eco-friendly production",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Wedding Invitations",
      "Business Letterhead",
      "Art Prints",
      "Fine Stationery",
      "Certificate Paper",
    ],
    images: [
      "/assets/papers/cotton-01.png",
      "/assets/papers/cotton-02.png",
      "/assets/papers/cotton-03.png",
    ],
    relatedSlugs: ["cotton-a5", "cotton-art-sheet", "marble-a4"],
  },
  {
    id: "cotton-a5",
    slug: "cotton-a5",
    name: "Handmade Cotton Paper — A5",
    shortName: "Cotton Paper A5",
    tagline: "Compact handmade cotton sheets for cards and notes",
    type: "cotton",
    categories: ["cotton"],
    sizeLabel: "A5",
    dimensions: "148 × 210 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "A5 handmade cotton paper, perfect for greeting cards, notes, and compact stationery sets. Each sheet carries the warmth and texture of traditional cotton papermaking.",
    features: [
      "Handmade sheet formation",
      "100% cotton rag composition",
      "Natural deckle edges",
      "Acid-free & tree-free",
      "Unique texture on every sheet",
      "Eco-friendly production",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Greeting Cards",
      "Notes & Journals",
      "Small Invitations",
      "Booklets",
      "Art Cards",
    ],
    images: [
      "/assets/papers/cotton-04.png",
      "/assets/papers/cotton-05.png",
      "/assets/papers/cotton-06.png",
    ],
    relatedSlugs: ["cotton-a4", "cotton-postcard", "marble-a5"],
  },
  {
    id: "cotton-postcard",
    slug: "cotton-postcard",
    name: "Handmade Cotton Paper — 10 × 20 cm",
    shortName: "Cotton Paper 10×20",
    tagline: "Custom-sized cotton paper for postcards and tags",
    type: "cotton",
    categories: ["cotton", "custom"],
    sizeLabel: "10 × 20 cm",
    dimensions: "100 × 200 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "10 × 20 cm handmade cotton paper sheets, ideal for postcards, gift tags, and narrow format applications. The unique elongated format provides a distinctive canvas for creative projects.",
    features: [
      "Handmade sheet formation",
      "100% cotton rag composition",
      "Natural deckle edges",
      "Acid-free & tree-free",
      "Unique texture on every sheet",
      "Eco-friendly production",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Postcards",
      "Gift Tags",
      "Bookmarks",
      "Menu Cards",
      "Product Labels",
    ],
    images: [
      "/assets/papers/cotton-02.png",
      "/assets/papers/cotton-03.png",
      "/assets/papers/cotton-01.png",
    ],
    relatedSlugs: ["cotton-a5", "cotton-art-sheet", "marble-postcard"],
  },
  {
    id: "cotton-art-sheet",
    slug: "cotton-art-sheet",
    name: "Handmade Cotton Paper — 22 × 30 inch",
    shortName: "Cotton Art Sheet",
    tagline: "Large-format cotton sheets for art and printing",
    type: "cotton",
    categories: ["cotton", "art"],
    sizeLabel: "22 × 30 inch",
    dimensions: "558.8 × 762 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "Our signature large-format 22 × 30 inch cotton paper sheets are the choice of artists, printmakers, and premium publishers. Made by hand with exceptional care, each sheet offers a generous surface for watercolour, letterpress, and fine art reproduction.",
    features: [
      "Handmade sheet formation",
      "100% cotton rag composition",
      "Natural deckle edges",
      "Acid-free & tree-free",
      "Unique texture on every sheet",
      "Eco-friendly production",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Fine Art Printing",
      "Watercolour Painting",
      "Book Binding Endpapers",
      "Luxury Packaging Wraps",
      "Exhibition Prints",
    ],
    images: [
      "/assets/papers/cotton-05.png",
      "/assets/papers/cotton-06.png",
      "/assets/papers/cotton-04.png",
    ],
    relatedSlugs: ["cotton-a4", "marble-art-sheet"],
  },
  {
    id: "marble-a4",
    slug: "marble-a4",
    name: "Marble Paper — A4",
    shortName: "Marble Paper A4",
    tagline: "Hand-marbled decorative paper in A4 format",
    type: "marble",
    categories: ["marble"],
    sizeLabel: "A4",
    dimensions: "210 × 297 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "Each A4 marble paper sheet is individually hand-marbled using traditional techniques, creating flowing patterns that are never repeated. A stunning choice for book covers, luxury wraps, and statement stationery.",
    features: [
      "Individually hand-marbled",
      "Each sheet uniquely patterned",
      "Rich flowing colour patterns",
      "Acid-free",
      "Eco-friendly",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Book Covers",
      "Luxury Packaging",
      "Decorative Wraps",
      "Wedding Stationery",
      "Art Projects",
    ],
    images: [
      "/assets/papers/marble-02.png",
      "/assets/papers/marble-03.png",
      "/assets/papers/marble-04.png",
    ],
    relatedSlugs: ["marble-a5", "marble-art-sheet", "cotton-a4"],
  },
  {
    id: "marble-a5",
    slug: "marble-a5",
    name: "Marble Paper — A5",
    shortName: "Marble Paper A5",
    tagline: "Compact hand-marbled paper for cards and accents",
    type: "marble",
    categories: ["marble"],
    sizeLabel: "A5",
    dimensions: "148 × 210 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "A5 hand-marbled paper sheets with vibrant, one-of-a-kind patterns. Perfect for greeting cards, decorative inserts, and artistic projects where you want each piece to be truly individual.",
    features: [
      "Individually hand-marbled",
      "Each sheet uniquely patterned",
      "Rich flowing colour patterns",
      "Acid-free",
      "Eco-friendly",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Greeting Cards",
      "Decorative Inserts",
      "Gift Wrapping Accents",
      "Art Cards",
      "Journal Covers",
    ],
    images: [
      "/assets/papers/marble-03.png",
      "/assets/papers/marble-04.png",
      "/assets/papers/marble-02.png",
    ],
    relatedSlugs: ["marble-a4", "marble-postcard", "cotton-a5"],
  },
  {
    id: "marble-postcard",
    slug: "marble-postcard",
    name: "Marble Paper — 10 × 20 cm",
    shortName: "Marble Paper 10×20",
    tagline: "Hand-marbled paper for postcards and tags",
    type: "marble",
    categories: ["marble", "custom"],
    sizeLabel: "10 × 20 cm",
    dimensions: "100 × 200 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "10 × 20 cm hand-marbled paper for postcards, bookmarks, and tags. Every piece carries its own unique flow of colour — making each card or tag a small work of art.",
    features: [
      "Individually hand-marbled",
      "Each sheet uniquely patterned",
      "Rich flowing colour patterns",
      "Acid-free",
      "Eco-friendly",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Postcards",
      "Decorative Tags",
      "Bookmarks",
      "Gift Cards",
      "Table Place Cards",
    ],
    images: [
      "/assets/papers/marble-04.png",
      "/assets/papers/marble-02.png",
      "/assets/papers/marble-03.png",
    ],
    relatedSlugs: ["marble-a5", "cotton-postcard"],
  },
  {
    id: "marble-art-sheet",
    slug: "marble-art-sheet",
    name: "Marble Paper — 22 × 30 inch",
    shortName: "Marble Art Sheet",
    tagline: "Large-format hand-marbled paper for art and bookbinding",
    type: "marble",
    categories: ["marble", "art"],
    sizeLabel: "22 × 30 inch",
    dimensions: "558.8 × 762 mm",
    gsmOptions: [100, 200, 250, 320, 350],
    description:
      "Our largest marble paper format — 22 × 30 inch hand-marbled sheets that showcase the full flow and drama of the marbling technique. Perfect as decorative endpapers, luxury wraps, or displayed as art in their own right.",
    features: [
      "Individually hand-marbled",
      "Each sheet uniquely patterned",
      "Rich flowing colour patterns",
      "Acid-free",
      "Eco-friendly",
      "Made in India",
      "Ships globally",
    ],
    useCases: [
      "Book Endpapers",
      "Luxury Gift Wrapping",
      "Decorative Wall Art",
      "Fine Bookbinding",
      "Exhibition Projects",
    ],
    images: [
      "/assets/papers/marble-02.png",
      "/assets/papers/marble-03.png",
      "/assets/papers/marble-04.png",
    ],
    relatedSlugs: ["marble-a4", "cotton-art-sheet"],
  },
];

export function getPaperProductBySlug(slug: string): PaperProduct | undefined {
  return paperProducts.find((p) => p.slug === slug);
}

export function getPapersByType(type: "cotton" | "marble"): PaperProduct[] {
  return paperProducts.filter((p) => p.type === type);
}

export function getRelatedPaperProducts(slugs: string[]): PaperProduct[] {
  return slugs
    .map((slug) => paperProducts.find((p) => p.slug === slug))
    .filter((p): p is PaperProduct => p !== undefined);
}
