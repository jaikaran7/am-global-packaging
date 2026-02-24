import { z } from "zod";
import { customerSchema } from "@/lib/schemas/order";

export const quotationItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional().or(z.literal("custom")),
  variant_id: z.string().uuid().optional().or(z.literal("custom")),
  custom_name: z.string().optional().or(z.literal("")),
  custom_spec: z.string().optional().or(z.literal("")),
  custom_notes: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  quantity: z.number().int().min(1, "Minimum quantity is 1"),
  unit_price: z.number().min(0, "Price must be non-negative"),
}).superRefine((value, ctx) => {
  const hasCustom = Boolean(value.custom_name?.trim());
  if (!hasCustom) {
    if (!value.product_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["product_id"],
        message: "Select a product",
      });
    }
    if (!value.variant_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variant_id"],
        message: "Select a variant",
      });
    }
  }
});

export const quotationSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  new_customer: customerSchema.optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "Add at least one item"),
  notes: z.string().optional().or(z.literal("")),
  terms_text: z.string().optional().or(z.literal("")),
  valid_until: z.string().optional().or(z.literal("")),
  gst_percent: z.number().min(0).max(100).optional(),
  status: z
    .enum(["draft", "sent", "accepted", "rejected", "expired", "revised", "locked", "cancelled"])
    .optional(),
});

export const quotationStatusSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired", "revised", "locked", "cancelled"]),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
