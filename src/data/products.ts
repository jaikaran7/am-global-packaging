export interface Product {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  dimensions: string;
  dimensionDetail: { length: number; width: number; height: number };
  /** Internal category key — used for filtering */
  category:
  | "pizza-boxes"
  | "specialty"
  | "books"
  | "ecommerce"
  | "general-purpose"
  | "vegetable-boxes"
  | "poultry-boxes";
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
  priceAud?: number;
  pricingTiers?: { label: string; priceAud: number }[];
  images?: string[];
}

export const products: Product[] = [
  // ─────────────── PIZZA BOXES ───────────────
  {
    slug: "small-pizza-box",
    name: "Small Pizza Box — 200 × 200 × 40 mm",
    shortName: "Small Pizza Box",
    tagline: "Compact & efficient for personal-sized pizzas",
    description:
      "Precision-engineered small pizza box designed for 7–8 inch personal pizzas. Features optimized ventilation slots to maintain crispness during delivery, with a lock-tab closure system for secure transit. Ideal for single-serve portions, quick-service restaurants, and cloud kitchens.",
    dimensions: "200 × 200 × 40 mm",
    dimensionDetail: { length: 200, width: 200, height: 40 },
    images: ["/assets/products/pizza-boxes/pizza-box-1-closed-transparent.png", "/assets/products/pizza-boxes/pizza-box-2-open-transparent.png", "/assets/products/pizza-boxes/pizza-box-3-layered-transparent.png", "/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png", "/assets/products/pizza-boxes/pizza-box-small-side-dims-transparent.png", "/assets/products/pizza-boxes/pizza-box-6-side-transparent.png", "/assets/products/pizza-boxes/pizza-box-open-close-combo-transparent.png"],
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
    name: "Medium Pizza Box — 250 × 250 × 45 mm",
    shortName: "Medium Pizza Box",
    tagline: "The versatile mid-range choice for growing brands",
    description:
      "Our medium pizza box accommodates 9–10 inch pizzas with precision fit. Engineered with reinforced corner joints and optimal flute structure for superior stacking strength. The go-to choice for dine-in, takeaway, and delivery operations across Australia.",
    dimensions: "250 × 250 × 45 mm",
    dimensionDetail: { length: 250, width: 250, height: 45 },
    images: ["/assets/products/pizza-boxes/pizza-box-1-closed-transparent.png", "/assets/products/pizza-boxes/pizza-box-2-open-transparent.png", "/assets/products/pizza-boxes/pizza-box-3-layered-transparent.png", "/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png", "/assets/products/pizza-boxes/pizza-box-medium-side-dims-transparent.png", "/assets/products/pizza-boxes/pizza-box-6-side-transparent.png", "/assets/products/pizza-boxes/pizza-box-open-close-combo-transparent.png"],
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
    name: "Large Pizza Box — 300 × 300 × 45 mm",
    shortName: "Large Pizza Box",
    tagline: "Australia's most popular size — built for volume",
    description:
      "The industry standard large pizza box for 11–12 inch pizzas. This is the most commonly ordered size across Australia, engineered for high-volume operations. Features a robust double-wall option for heavy toppings and enhanced thermal retention during delivery.",
    dimensions: "300 × 300 × 45 mm",
    dimensionDetail: { length: 300, width: 300, height: 45 },
    images: ["/assets/products/pizza-boxes/pizza-box-1-closed-transparent.png", "/assets/products/pizza-boxes/pizza-box-2-open-transparent.png", "/assets/products/pizza-boxes/pizza-box-3-layered-transparent.png", "/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png", "/assets/products/pizza-boxes/pizza-box-large-side-dims-transparent.png", "/assets/products/pizza-boxes/pizza-box-6-side-transparent.png", "/assets/products/pizza-boxes/pizza-box-open-close-combo-transparent.png"],
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
    name: "Extra-Large Pizza Box — 330 × 330 × 45 mm",
    shortName: "Extra-Large Pizza Box",
    tagline: "Oversized performance for premium pizza brands",
    description:
      "Designed for 13–14 inch extra-large pizzas, this box delivers premium structural integrity for gourmet and specialty pizza brands. Reinforced fluting provides superior protection against crushing, while the expanded surface area offers maximum branding real estate.",
    dimensions: "330 × 330 × 45 mm",
    dimensionDetail: { length: 330, width: 330, height: 45 },
    images: ["/assets/products/pizza-boxes/pizza-box-1-closed-transparent.png", "/assets/products/pizza-boxes/pizza-box-2-open-transparent.png", "/assets/products/pizza-boxes/pizza-box-3-layered-transparent.png", "/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png", "/assets/products/pizza-boxes/pizza-box-xl-side-dims-transparent.png", "/assets/products/pizza-boxes/pizza-box-6-side-transparent.png", "/assets/products/pizza-boxes/pizza-box-open-close-combo-transparent.png"],
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
    name: "Family / Party Pizza Box — 400 × 400 × 50 mm",
    shortName: "Family / Party Box",
    tagline: "Maximum capacity for family & party-sized pizzas",
    description:
      "Our largest pizza box, purpose-built for 15–16 inch family and party-sized pizzas. Heavy-duty 7-ply construction ensures no sagging or deformation during transport. Double-scored fold lines allow for effortless assembly at scale.",
    dimensions: "400 × 400 × 50 mm",
    dimensionDetail: { length: 400, width: 400, height: 50 },
    images: ["/assets/products/pizza-boxes/pizza-box-1-closed-transparent.png", "/assets/products/pizza-boxes/pizza-box-2-open-transparent.png", "/assets/products/pizza-boxes/pizza-box-3-layered-transparent.png", "/assets/products/pizza-boxes/pizza-box-4-stack-transparent.png", "/assets/products/pizza-boxes/pizza-box-family-side-dims-transparent.png", "/assets/products/pizza-boxes/pizza-box-6-side-transparent.png", "/assets/products/pizza-boxes/pizza-box-open-close-combo-transparent.png"],
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

  // ─────────────── SPECIALTY / HEAVY-DUTY ───────────────
  {
    slug: "tea-chest-box",
    name: "Tea Chest Box — 431 × 406 × 596 mm",
    shortName: "Tea Chest Box",
    tagline: "Heavy-duty chest for bulk storage and export",
    description:
      "A premium heavy-duty tea chest box built with 5-Ply (3BC) corrugated board for maximum structural integrity. Designed for bulk storage, export cartons, and heavy goods transportation. The tall chest profile and reinforced walls make it ideal for warehouse logistics, international shipping, and industrial packing applications.",
    dimensions: "431 × 406 × 596 mm",
    dimensionDetail: { length: 431, width: 406, height: 596 },
    images: [
      "/assets/products/tea chest /tea chest close.png",
      "/assets/products/tea chest /tea chest open .png",
      "/assets/products/tea chest /tea chest open 2.png"
    ],
    category: "specialty",
    categoryLabel: "Specialty / Heavy-Duty",
    priceAud: 3.70,
    useCases: ["Bulk storage", "Export cartons", "Heavy goods", "Warehouse logistics"],
    plyOptions: ["5-Ply (3BC)"],
    gsmRange: "250 – 350 GSM",
    material: "Heavy-duty virgin kraft corrugated board",
    printOptions: "Up to 2-color flexo printing",
    moq: "200 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "5-Ply (3BC) heavy-duty construction",
      "Tall chest profile for maximum capacity",
      "Reinforced double-wall structure",
      "Export-grade durability",
      "Stackable design for warehousing",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "431 × 406 × 596 mm" },
      { label: "Ply", value: "5-Ply (3BC)" },
      { label: "Price", value: "$3.70 AUD / unit" },
      { label: "Material", value: "Heavy-duty kraft" },
      { label: "Print", value: "Up to 2-color flexo" },
      { label: "MOQ", value: "200 units" },
    ],
    relatedSlugs: ["book-box", "a4-box-type-2"],
  },
  {
    slug: "book-box",
    name: "Book Box — 390 × 330 × 330 mm",
    shortName: "Book Box",
    tagline: "Purpose-built for books, catalogs, and printed materials",
    description:
      "A sturdy 5-Ply (1BC) corrugated book box engineered for the weight and density of printed materials. The compact square profile provides excellent stacking stability and protects contents from crushing during transit. Ideal for publishers, bookstores, retail shipping, and boxed set packaging.",
    dimensions: "390 × 330 × 330 mm",
    dimensionDetail: { length: 390, width: 330, height: 330 },
    category: "specialty",
    categoryLabel: "Specialty / Heavy-Duty",
    priceAud: 2.95,
    useCases: ["Books", "Catalogs", "Boxed sets", "Retail shipping"],
    plyOptions: ["5-Ply (1BC)"],
    gsmRange: "200 – 280 GSM",
    material: "Virgin kraft corrugated board",
    printOptions: "Up to 4-color flexo printing",
    moq: "300 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "5-Ply (1BC) construction for heavy loads",
      "Compact square profile",
      "Superior stacking stability",
      "Crush-resistant structure",
      "Custom branding available",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "390 × 330 × 330 mm" },
      { label: "Ply", value: "5-Ply (1BC)" },
      { label: "Price", value: "$2.95 AUD / unit" },
      { label: "Material", value: "Virgin kraft board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "300 units" },
    ],
    relatedSlugs: ["tea-chest-box", "a4-box-type-1"],
  },

  // ─────────────── ECOMMERCE / FBA ───────────────
  {
    slug: "amazon-fba-carton",
    name: "Amazon FBA Carton — 350 × 250 × 200 mm",
    shortName: "Amazon FBA Carton",
    tagline: "Optimized for ecommerce fulfillment and FBA compliance",
    description:
      "A compact, rigid carton specifically sized for Amazon FBA requirements and direct-to-consumer shipping. Features tuck flaps for secure closure and a pre-printed shipping label area. Designed for high-volume warehouse fulfillment operations with excellent palletization efficiency.",
    dimensions: "350 × 250 × 200 mm",
    dimensionDetail: { length: 350, width: 250, height: 200 },
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    priceAud: 1.05,
    useCases: ["Amazon FBA", "D2C shipping", "Warehouse fulfillment", "Ecommerce logistics"],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "150 – 220 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 2-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 2–3 business days",
    features: [
      "Amazon FBA compliant dimensions",
      "Tuck flap secure closure",
      "Pre-printed shipping label area",
      "Excellent palletization efficiency",
      "Lightweight yet rigid structure",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "350 × 250 × 200 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "Price", value: "$1.05 AUD / unit" },
      { label: "Material", value: "Kraft / Recycled board" },
      { label: "Print", value: "Up to 2-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["a4-box-type-1", "a4-box-type-2"],
  },

  // ─────────────── A4 / GENERAL PURPOSE ───────────────
  {
    slug: "a4-box-type-1",
    name: "A4 Box Type 1 — 320 × 220 × 240 mm",
    shortName: "A4 Box Type 1",
    tagline: "Compact A4 box for documents, small goods, and office shipping",
    description:
      "A compact A4-format box ideal for documents, small goods, and everyday office shipping. Features tiered pricing for bulk orders — from $0.80 per unit at 500 units to $1.05 at 1,500+ units. The slim profile makes it perfect for lightweight shipments and cost-effective fulfillment.",
    dimensions: "320 × 220 × 240 mm",
    dimensionDetail: { length: 320, width: 220, height: 240 },
    images: [
      "/assets/products/A4-boxes%20/A4%20box%20close%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20group%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20&%20close.png",
      "/assets/products/A4-boxes%20/a4%20type%201.png"
    ],
    category: "general-purpose",
    categoryLabel: "A4 Boxes",
    pricingTiers: [
      { label: "500 units", priceAud: 0.80 },
      { label: "1,500+ units", priceAud: 1.05 },
    ],
    useCases: ["Documents", "Small goods", "Office shipping", "Lightweight fulfillment"],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "120 – 200 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 2–3 business days",
    features: [
      "Tiered volume pricing",
      "Compact & lightweight design",
      "Available in 3-Ply and 5-Ply",
      "Cost-effective for high-volume orders",
      "Custom branding available",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "320 × 220 × 240 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "500 units", value: "$0.80 AUD / unit" },
      { label: "1,500+ units", value: "$1.05 AUD / unit" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["a4-box-type-2", "amazon-fba-carton"],
  },
  {
    slug: "a4-box-type-2",
    name: "A4 Box Type 2 — 440 × 330 × 300 mm",
    shortName: "A4 Box Type 2",
    tagline: "Generous A4 box for documents, office storage, and bulk packing",
    description:
      "A larger-format A4 box designed for files, documents, office storage, and general-purpose bulk packing. The generous depth accommodates thick document stacks, binders, and mixed office supplies. Available in both 3-Ply and 5-Ply configurations for varying weight requirements.",
    dimensions: "440 × 330 × 300 mm",
    dimensionDetail: { length: 440, width: 330, height: 300 },
    images: [
      "/assets/products/A4-boxes%20/A4%20box%20close%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20group%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20&%20close.png",
      "/assets/products/A4-boxes%20/a4%20type%202.png"
    ],
    category: "general-purpose",
    categoryLabel: "A4 Boxes",
    priceAud: 3.50,
    useCases: ["Documents & files", "Office storage", "Bulk packing", "General-purpose shipping"],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "150 – 250 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Generous depth for thick document stacks",
      "Available in 3-Ply and 5-Ply",
      "Suitable for binders and office supplies",
      "Strong base for heavy contents",
      "Custom branding available",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "440 × 330 × 300 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "Price", value: "$3.50 AUD / unit" },
      { label: "Material", value: "Kraft / Recycled board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["a4-box-type-1", "a4-box-type-3"],
  },
  {
    slug: "a4-box-type-3",
    name: "A4 Box Type 3 — 321 × 220 × 203 mm",
    shortName: "A4 Box Type 3",
    tagline: "Slim-profile A4 box optimised for tight document stacks",
    description:
      "A slim-profile A4 box with a slightly reduced height for single-layer document stacks and lightweight goods. The narrow footprint maximises pallet density and reduces freight costs. Available in 3-Ply and 5-Ply configurations for varying strength requirements.",
    dimensions: "321 × 220 × 203 mm",
    dimensionDetail: { length: 321, width: 220, height: 203 },
    images: [
      "/assets/products/A4-boxes%20/A4%20box%20close%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20group%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20&%20close.png",
      "/assets/products/A4-boxes%20/A4%20type%203.png"
    ],
    category: "general-purpose",
    categoryLabel: "A4 Boxes",
    useCases: ["Documents", "Stationery", "Office shipping", "Retail packing"],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "120 – 200 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Slim reduced-height profile",
      "High pallet density",
      "Available in 3-Ply and 5-Ply",
      "Lightweight for lower freight costs",
      "Custom branding available",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "321 × 220 × 203 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "Material", value: "Kraft / Recycled board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["a4-box-type-1", "a4-box-type-4"],
  },
  {
    slug: "a4-box-type-4",
    name: "A4 Box Type 4 — 369 × 269 × 211 mm",
    shortName: "A4 Box Type 4",
    tagline: "Mid-depth A4 box for mixed documents and small goods",
    description:
      "A mid-depth A4 box that bridges the gap between Type 1 and Type 2, ideal for mixed document packs, small goods, and retail kits. The wider base accommodates A4 materials with room for protective inserts. Available in 3-Ply and 5-Ply.",
    dimensions: "369 × 269 × 211 mm",
    dimensionDetail: { length: 369, width: 269, height: 211 },
    images: [
      "/assets/products/A4-boxes%20/A4%20box%20close%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20group%20.png",
      "/assets/products/A4-boxes%20/A4%20box%20open%20&%20close.png",
      "/assets/products/A4-boxes%20/A4%20type%204.png"
    ],
    category: "general-purpose",
    categoryLabel: "A4 Boxes",
    useCases: ["Mixed documents", "Small goods", "Retail kits", "Office packing"],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "130 – 220 GSM",
    material: "Virgin kraft / Recycled corrugated board",
    printOptions: "Up to 4-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Mid-depth versatile profile",
      "Wide base for protective inserts",
      "Available in 3-Ply and 5-Ply",
      "Suitable for retail kits and gift packs",
      "Custom branding available",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "369 × 269 × 211 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "Material", value: "Kraft / Recycled board" },
      { label: "Print", value: "Up to 4-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["a4-box-type-3", "a4-box-type-2"],
  },

  // ─────────────── VEGETABLE BOXES ───────────────
  {
    slug: "vegetable-box",
    name: "Vegetable Box — 500 × 300 × 200 mm",
    shortName: "Vegetable Box",
    tagline: "Ventilated open-top crate for fresh produce and vegetables",
    description:
      "A purpose-built corrugated vegetable box with ventilation cut-outs and an open-top design for maximum airflow. Heavy-duty fluting maintains strength under moist produce conditions. Suitable for markets, growers, wholesalers, and supermarket supply chains.",
    dimensions: "500 × 300 × 200 mm",
    dimensionDetail: { length: 500, width: 300, height: 200 },
    category: "vegetable-boxes",
    categoryLabel: "Vegetable Boxes",
    useCases: [
      "Fresh vegetables",
      "Market produce",
      "Wholesale supply",
      "Supermarket logistics",
    ],
    plyOptions: ["3-Ply", "5-Ply"],
    gsmRange: "180 – 260 GSM",
    material: "Heavy-duty virgin kraft corrugated board",
    printOptions: "Up to 2-color flexo printing",
    moq: "500 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Ventilation cut-outs for airflow",
      "Open-top design for easy loading",
      "Moisture-resistant outer treatment",
      "Heavy-duty fluting",
      "Stackable when full",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "500 × 300 × 200 mm" },
      { label: "Ply Options", value: "3-Ply, 5-Ply" },
      { label: "Material", value: "Heavy-duty kraft" },
      { label: "Print", value: "Up to 2-color flexo" },
      { label: "MOQ", value: "500 units" },
    ],
    relatedSlugs: ["poultry-box", "tea-chest-box"],
  },

  // ─────────────── POULTRY BOXES ───────────────
  {
    slug: "poultry-box",
    name: "Poultry Box — 369 × 269 × 211 mm",
    shortName: "Poultry Box",
    tagline: "Heavy-duty poultry carton for chilled and frozen distribution",
    description:
      "A robust corrugated poultry box built for chilled and frozen poultry distribution. Features a wax or moisture-resistant coating option to withstand cold-chain environments. The reinforced base prevents sagging under heavy bird weight during transport and storage.",
    dimensions: "369 × 269 × 211 mm",
    dimensionDetail: { length: 369, width: 269, height: 211 },
    images: [
      "/assets/products/Poultry/polutry close .png",
      "/assets/products/Poultry/polutry open.png",
      "/assets/products/Poultry/polutry sizes.png",
      "/assets/products/Poultry/polutry 4th.png"
    ],
    category: "poultry-boxes",
    categoryLabel: "Poultry Boxes",
    priceAud: 1.80,
    useCases: [
      "Chilled poultry",
      "Frozen chicken distribution",
      "Cold-chain logistics",
      "Wholesale butchery",
    ],
    plyOptions: ["5-Ply"],
    gsmRange: "200 – 300 GSM",
    material: "Moisture-resistant virgin kraft corrugated board",
    printOptions: "Up to 2-color flexo printing",
    moq: "300 units",
    availability: "In stock — ships within 3–5 business days",
    features: [
      "Moisture / wax-resistant coating",
      "Reinforced base for heavy loads",
      "Cold-chain certified",
      "Tight-fit lid closure",
      "Stackable under refrigeration",
      "Flat-pack for efficient storage",
    ],
    specs: [
      { label: "Dimensions", value: "369 × 269 × 211 mm" },
      { label: "Ply", value: "5-Ply" },
      { label: "Price", value: "$1.80 AUD / unit" },
      { label: "Material", value: "Moisture-resistant kraft" },
      { label: "Print", value: "Up to 2-color flexo" },
      { label: "MOQ", value: "300 units" },
    ],
    relatedSlugs: ["vegetable-box", "tea-chest-box"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return products.filter((p) => slugs.includes(p.slug));
}

/** Ordered category list used in nav / sidebar */
export const categories = [
  { id: "all", label: "All Products" },
  { id: "pizza-boxes", label: "Pizza Boxes" },
  { id: "general-purpose", label: "A4 Boxes" },
  { id: "specialty", label: "Specialty & Heavy Duty" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "vegetable-boxes", label: "Vegetable Boxes" },
  { id: "poultry-boxes", label: "Poultry Boxes" },
] as const;

/** URL slug for each category (used in /products/[slug] for category landing) */
export const categoryRouteSlugs: Record<string, string> = {
  "pizza-boxes": "pizza-boxes",
  "general-purpose": "a4-boxes",
  specialty: "specialty-heavy-duty",
  ecommerce: "e-commerce",
  "vegetable-boxes": "vegetable-boxes",
  "poultry-boxes": "poultry-boxes",
};

/** Category IDs that are category-landing routes (not product slugs) */
const CATEGORY_ROUTE_SLUGS = new Set(Object.values(categoryRouteSlugs));

/** True if slug is a category route (e.g. pizza-boxes, a4-boxes), not a product slug */
export function isCategoryRouteSlug(slug: string): boolean {
  return CATEGORY_ROUTE_SLUGS.has(slug);
}

/** Get category id from a category route slug (e.g. a4-boxes → general-purpose) */
export function getCategoryIdByRouteSlug(routeSlug: string): string | undefined {
  for (const [id, rs] of Object.entries(categoryRouteSlugs)) {
    if (rs === routeSlug) return id;
  }
  return undefined;
}

/** Categories only (no "all") for All Products page cards; includes routeSlug and label */
export const productCategories = categories.filter((c) => c.id !== "all").map((cat) => ({
  id: cat.id,
  label: cat.label,
  routeSlug: categoryRouteSlugs[cat.id] ?? cat.id,
}));

/** Returns the first (default) product slug for a given category */
export function getDefaultSlugForCategory(categoryId: string): string {
  const map: Record<string, string> = {
    "pizza-boxes": "small-pizza-box",
    "general-purpose": "a4-box-type-1",
    specialty: "tea-chest-box",
    ecommerce: "amazon-fba-carton",
    "vegetable-boxes": "vegetable-box",
    "poultry-boxes": "poultry-box",
  };
  return map[categoryId] ?? products.find((p) => p.category === categoryId)?.slug ?? products[0].slug;
}

/** Returns all products in the same category, ordered as product-type cards */
export function getCategoryProducts(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}
