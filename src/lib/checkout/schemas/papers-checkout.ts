import { z } from "zod";
import { boxesCheckoutCustomerSchema } from "@/lib/checkout/schemas/boxes-checkout";

export const papersCheckoutProductSchema = z.object({
  slug: z.string().min(1),
  variant_id: z.string().uuid("Select a valid product variant"),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
});

export type PapersCheckoutProductInput = z.infer<typeof papersCheckoutProductSchema>;

export const papersCheckoutRequestSchema = z.object({
  product: papersCheckoutProductSchema,
  customer: boxesCheckoutCustomerSchema,
  client_pricing_version: z.string().optional(),
});

export type PapersCheckoutRequestInput = z.infer<typeof papersCheckoutRequestSchema>;
