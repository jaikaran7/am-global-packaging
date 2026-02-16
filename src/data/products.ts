export interface Product {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  dimensions: string;
  dimensionDetail: { length: number; width: number; height: number };
  category: "pizza-boxes";
  categoryLabel: string;
  useCases: string[];
  plyOptions: string[];
  gsmRange: string;
  material: string;
  printOptions: string;
  moq: string;
  availability: string;
  features: string[];
  specs: { label: string; value: string }[];
  relatedSlugs: string[];
}

export const products: Product[] = [
  {
    slug: "small-pizza-box",
    name: 'Small Pizza Box — 200 × 200 × 40 mm',
    shortName: "Small Pizza Box",
    tagline: "Compact & efficient for personal-sized pizzas",
    description:
      "Precision-engineered small pizza box designed for 7–8 inch personal pizzas. Features optimized ventilation slots to maintain crispness during delivery, with a lock-tab closure system for secure transit. Ideal for single-serve portions, quick-service restaurants, and cloud kitchens.",
    dimensions: "200 × 200 × 40 mm",
    dimensionDetail: { length: 200, width: 200, height: 40 },
    category: "pizza-boxes",
    categoryLabel: "Pizza Boxes",
    useCases: [
      "Personal-sized pizzas (7–8 inch)",
      "Quick-service restaurants",
      "Cloud kitchens",
      "Meal kit deliveries",
    ],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "150 – 200 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing, food-safe inks",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Ventilation slots for steam release",
      "Lock-tab closure system",
      "Food-grade certified material",
      "Custom branding available",
      "Grease-resistant inner coating",
      "Flat-pack storage friendly",
    ],
    specs: [
      { label: "Dimensions", value: "200 × 200 × 40 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "GSM Range", value: "150 – 200 GSM" },
      { label: "Material", value: "Virgin kraft board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["medium-pizza-box", "large-pizza-box"],
  },
  {
    slug: "medium-pizza-box",
    name: 'Medium Pizza Box — 250 × 250 × 45 mm',
    shortName: "Medium Pizza Box",
    tagline: "The versatile mid-range choice for growing brands",
    description:
      "Our medium pizza box accommodates 9–10 inch pizzas with precision fit. Engineered with reinforced corner joints and optimal flute structure for superior stacking strength. The go-to choice for dine-in, takeaway, and delivery operations across Australia.",
    dimensions: "250 × 250 × 45 mm",
    dimensionDetail: { length: 250, width: 250, height: 45 },
    category: "pizza-boxes",
    categoryLabel: "Pizza Boxes",
    useCases: [
      "Medium pizzas (9–10 inch)",
      "Dine-in & takeaway restaurants",
      "Delivery operations",
      "Franchise chains",
    ],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "150 – 220 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing, food-safe inks",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Reinforced corner joints",
      "Optimal flute structure for stacking",
      "Food-grade certified material",
      "Custom full-surface printing",
      "Grease-resistant inner coating",
      "Easy-fold assembly design",
    ],
    specs: [
      { label: "Dimensions", value: "250 × 250 × 45 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "GSM Range", value: "150 – 220 GSM" },
      { label: "Material", value: "Virgin kraft board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["small-pizza-box", "large-pizza-box"],
  },
  {
    slug: "large-pizza-box",
    name: 'Large Pizza Box — 300 × 300 × 45 mm',
    shortName: "Large Pizza Box",
    tagline: "Australia's most popular size — built for volume",
    description:
      "The industry standard large pizza box for 11–12 inch pizzas. This is the most commonly ordered size across Australia, engineered for high-volume operations. Features a robust double-wall option for heavy toppings and enhanced thermal retention during delivery.",
    dimensions: "300 × 300 × 45 mm",
    dimensionDetail: { length: 300, width: 300, height: 45 },
    category: "pizza-boxes",
    categoryLabel: "Pizza Boxes",
    useCases: [
      "Standard large pizzas (11–12 inch)",
      "High-volume pizzerias",
      "National delivery chains",
      "Event & catering supply",
    ],
    plyOptions: ["3-Ply", "5-Ply", "7-Ply"],
    gsmRange: "180 – 250 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing, food-safe inks",
    moq: "500 units",
    availability: "In stock — ships within 2–3 business days",
    features: [
      "Double-wall option for heavy loads",
      "Enhanced thermal retention",
      "Food-grade certified material",
      "Full-bleed custom printing",
      "Grease-resistant inner coating",
      "High stacking strength",
    ],
    specs: [
      { label: "Dimensions", value: "300 × 300 × 45 mm" },
      { label: "Ply Options", value: "3, 5, 7-Ply" },
      { label: "GSM Range", value: "180 – 250 GSM" },
      { label: "Material", value: "Virgin kraft board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["medium-pizza-box", "extra-large-pizza-box"],
  },
  {
    slug: "extra-large-pizza-box",
    name: 'Extra-Large Pizza Box — 330 × 330 × 45 mm',
    shortName: "Extra-Large Pizza Box",
    tagline: "Oversized performance for premium pizza brands",
    description:
      "Designed for 13–14 inch extra-large pizzas, this box delivers premium structural integrity for gourmet and specialty pizza brands. Reinforced fluting provides superior protection against crushing, while the expanded surface area offers maximum branding real estate.",
    dimensions: "330 × 330 × 45 mm",
    dimensionDetail: { length: 330, width: 330, height: 45 },
    category: "pizza-boxes",
    categoryLabel: "Pizza Boxes",
    useCases: [
      "Extra-large pizzas (13–14 inch)",
      "Gourmet & specialty pizza brands",
      "Premium delivery services",
      "Corporate catering",
    ],
    plyOptions: ["5-Ply", "7-Ply"],
    gsmRange: "200 – 280 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing, food-safe inks",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Reinforced fluting for crush resistance",
      "Maximum branding surface area",
      "Food-grade certified material",
      "Premium kraft finish option",
      "Grease-resistant inner coating",
      "Interlocking tab closure",
    ],
    specs: [
      { label: "Dimensions", value: "330 × 330 × 45 mm" },
      { label: "Ply Options", value: "5-Ply, 7-Ply" },
      { label: "GSM Range", value: "200 – 280 GSM" },
      { label: "Material", value: "Virgin kraft board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["large-pizza-box", "family-party-pizza-box"],
  },
  {
    slug: "family-party-pizza-box",
    name: 'Family / Party Pizza Box — 400 × 400 × 50 mm',
    shortName: "Family / Party Box",
    tagline: "Maximum capacity for family & party-sized pizzas",
    description:
      "Our largest pizza box, purpose-built for 15–16 inch family and party-sized pizzas. Heavy-duty 7-ply construction ensures no sagging or deformation during transport. Double-scored fold lines allow for effortless assembly at scale.",
    dimensions: "400 × 400 × 50 mm",
    dimensionDetail: { length: 400, width: 400, height: 50 },
    category: "pizza-boxes",
    categoryLabel: "Pizza Boxes",
    useCases: [
      "Family/party-sized pizzas (15–16 inch)",
      "Large event catering",
      "Wholesale & bulk delivery",
      "Stadium & venue concessions",
    ],
    plyOptions: ["5-Ply", "7-Ply"],
    gsmRange: "220 – 300 GSM",
    material: "Heavy-duty virgin kraft corrugated board",
    printOptions: "Up to 4-color flexo printing, food-safe inks",
    moq: "300 units",
    availability: "Made to order — ships within 5–7 business days",
    features: [
      "Heavy-duty 7-ply construction",
      "No-sag reinforced base",
      "Double-scored fold lines",
      "Food-grade certified material",
      "Full-surface custom printing",
      "Bulk-pack shipping ready",
    ],
    specs: [
      { label: "Dimensions", value: "400 × 400 × 50 mm" },
      { label: "Ply Options", value: "5-Ply, 7-Ply" },
      { label: "GSM Range", value: "220 – 300 GSM" },
      { label: "Material", value: "Heavy-duty kraft" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "300 units" },
    ],
    relatedSlugs: ["extra-large-pizza-box", "large-pizza-box"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return products.filter((p) => slugs.includes(p.slug));
}

export const categories = [
  { id: "all", label: "All Products" },
  { id: "pizza-boxes", label: "Pizza Boxes" },
] as const;
