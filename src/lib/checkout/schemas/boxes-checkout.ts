import { z } from "zod";

export const boxesCheckoutProductSchema = z.object({
  slug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  ply: z.string().min(1),
});

export type BoxesCheckoutProductInput = z.infer<typeof boxesCheckoutProductSchema>;

const contactEnum = z.enum(["email", "phone", "either"]);

/** Output type after defaults (no optional on preferred contact). */
export const boxesCheckoutCustomerSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(200),
  company_name: z.string().min(2, "Company name is required").max(200),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone number is required").max(40),
  country: z.string().min(2, "Country is required").max(120),
  delivery_address: z.string().min(5, "Delivery address is required").max(500),
  city: z.string().min(2, "City is required").max(120),
  state_region: z.string().min(2, "State / region is required").max(120),
  postal_code: z.string().min(3, "Postal code is required").max(20),
  quantity_requirement: z.number().int().min(1).max(1_000_000),
  custom_notes: z.string().max(5000).optional().or(z.literal("")),
  tax_id: z.string().max(80).optional().or(z.literal("")),
  preferred_contact_method: contactEnum.default("either"),
});

export type BoxesCheckoutCustomerInput = z.infer<typeof boxesCheckoutCustomerSchema>;

export const boxesCheckoutRequestSchema = z.object({
  product: boxesCheckoutProductSchema,
  customer: boxesCheckoutCustomerSchema,
  /** Client-computed hints (re-validated server-side against product slug). */
  client_pricing_version: z.string().optional(),
});

export type BoxesCheckoutRequestInput = z.infer<typeof boxesCheckoutRequestSchema>;
