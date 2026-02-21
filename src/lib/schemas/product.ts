import { z } from "zod";

const dimensionsSchema = z.object({
  length_mm: z.number().optional(),
  width_mm: z.number().optional(),
  height_mm: z.number().optional(),
  unit: z.string().optional(),
}).optional();

/**
 * Product-level schema (marketing / shared fields).
 * Variant-specific fields (price, dimensions, stock) live on variants.
 */
export const productSchema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  short_description: z.string().optional(),
  marketing_text: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Variant-level schema (price, dimensions, stock, tech specs).
 */
export const productVariantSchema = z.object({
  product_id: z.string().uuid().optional(),
  name: z.string().min(1, "Variant name required"),
  sku: z.string().optional(),
  price: z.number().min(0),
  moq: z.number().int().min(0),
  dimensions: dimensionsSchema,
  gsm: z.number().int().optional(),
  ply: z.number().int().optional(),
  technical_spec: z.record(z.string(), z.string()).optional(),
  is_primary: z.boolean(),
  stock_warning_threshold: z.number().int().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
