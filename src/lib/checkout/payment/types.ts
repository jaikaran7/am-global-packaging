/**
 * Future payment integrations — keep checkout UI and server actions free of
 * provider-specific code by adapting through these interfaces.
 *
 * Planned: Stripe, Razorpay, PayPal, partial deposits, shipping quotes, coupons.
 */

export type Money = {
  currency: "AUD";
  cents: number;
};

export interface ShippingQuoteRequest {
  country: string;
  postal_code: string;
  line_items: Array<{ sku: string; quantity: number; weightKg?: number }>;
}

export interface ShippingQuoteResult {
  provider: string;
  amount: Money;
  label: string;
}

export interface PaymentIntentRequest {
  orderOrEnquiryReference: string;
  amount: Money;
  metadata: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret?: string;
  redirectUrl?: string;
  provider: "stripe" | "razorpay" | "paypal" | "manual";
}

export interface CheckoutPaymentAdapter {
  id: string;
  createPaymentIntent(req: PaymentIntentRequest): Promise<PaymentIntentResult>;
}

export interface CheckoutShippingAdapter {
  id: string;
  quote(req: ShippingQuoteRequest): Promise<ShippingQuoteResult | null>;
}
