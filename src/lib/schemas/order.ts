import { z } from "zod";
import { isAustralianPhone } from "@/lib/validation/phone";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isAustralianPhone(value), {
      message: "Enter a valid Australian phone number",
    }),
  company: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const orderItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional().or(z.literal("custom")),
  variant_id: z.string().uuid().optional().or(z.literal("custom")),
  custom_name: z.string().optional().or(z.literal("")),
  custom_spec: z.string().optional().or(z.literal("")),
  custom_notes: z.string().optional().or(z.literal("")),
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

export const orderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  new_customer: customerSchema.optional().nullable(),
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
  notes: z.string().optional().or(z.literal("")),
  tax: z.number().min(0).optional(),
  shipping_provider: z.string().optional().or(z.literal("")),
  tracking_id: z.string().optional().or(z.literal("")),
  shipped_date: z.string().optional().or(z.literal("")),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "draft",
    "pending_confirmation",
    "confirmed",
    "in_production",
    "shipped",
    "delivered",
    "cancelled",
    "obsolete",
  ]),
  shipping_provider: z.string().optional(),
  tracking_id: z.string().optional(),
  shipped_date: z.string().optional(),
});

export const stockAdjustSchema = z.object({
  variant_id: z.string().uuid(),
  type: z.enum(["add", "remove"]),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;

export const ORDER_STATUSES = [
  "draft",
  "pending_confirmation",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
  "obsolete",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  draft: {
    label: "Draft",
    color: "#6b7280",
    bgColor: "rgba(107,114,128,0.1)",
    borderColor: "rgba(107,114,128,0.3)",
  },
  pending_confirmation: {
    label: "Pending confirmation",
    color: "#d97706",
    bgColor: "rgba(217,119,6,0.1)",
    borderColor: "rgba(217,119,6,0.3)",
  },
  confirmed: {
    label: "Confirmed",
    color: "#16a34a",
    bgColor: "rgba(22,163,74,0.1)",
    borderColor: "rgba(22,163,74,0.3)",
  },
  in_production: {
    label: "In Production",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.1)",
    borderColor: "rgba(245,158,11,0.3)",
  },
  shipped: {
    label: "Shipped",
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.1)",
    borderColor: "rgba(59,130,246,0.3)",
  },
  delivered: {
    label: "Delivered",
    color: "#16a34a",
    bgColor: "rgba(22,163,74,0.15)",
    borderColor: "rgba(22,163,74,0.4)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  obsolete: {
    label: "Obsolete",
    color: "#64748b",
    bgColor: "rgba(100,116,139,0.1)",
    borderColor: "rgba(100,116,139,0.3)",
  },
};

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["confirmed", "cancelled", "obsolete"],
  pending_confirmation: ["confirmed", "in_production", "cancelled", "obsolete"],
  confirmed: ["in_production", "cancelled", "obsolete"],
  in_production: ["shipped", "cancelled", "obsolete"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  obsolete: [],
};
