# B2B checkout & inquiry architecture (AM Global Packaging)

This document complements the corrugated **boxes** flow at `/boxes/checkout`. Papers continue to use `/papers/contact` until a parallel checkout exists.

## Folder layout

```
src/app/boxes/checkout/page.tsx          # Route + Suspense + metadata
src/app/api/checkout/boxes/route.ts     # Validates with Zod, persists enquiry
src/components/checkout/boxes/         # Premium UI kit for this vertical
src/lib/checkout/
  schemas/boxes-checkout.ts             # Shared Zod contracts (API + form alignment)
  boxes-pricing.ts                      # AU GST + tiered AUD estimates
  checkout-phone.ts                     # AU vs international sanity checks
  enquiry-reference.ts
  payment/types.ts                     # Stripe / Razorpay / PayPal stubs
src/lib/pdf/renderInquirySummaryPdf.ts  # Customer-facing summary PDF (browser download)
supabase/migrations/20260510120000_enquiries_checkout_fields.sql
```

## Database

The app uses **Supabase (Postgres)**, not Prisma. Extend `enquiries` with optional checkout columns via the migration above. If the migration is not applied, `POST /api/checkout/boxes` falls back to legacy columns + JSON in `project_details`/`notes`.

### Prisma-style model (if you ever migrate)

```prisma
model Enquiry {
  id                        String   @id @default(uuid())
  referenceNumber           String?  @unique
  fullName                  String
  companyName               String
  email                     String
  phone                     String?
  productLine               String   @default("boxes")
  productCategory           String
  product                   String
  quantity                  Int?
  plyPreference             String?
  projectDetails            String?
  customNotes               String?
  country                   String?
  deliveryAddress           String?
  city                      String?
  stateRegion               String?
  postalCode                String?
  taxId                     String?
  preferredContactMethod    String?
  checkoutMetadata          Json?
  createdAt                 DateTime @default(now())
  enquiryItems              EnquiryItem[]
}

model EnquiryItem {
  id              String  @id @default(uuid())
  enquiryId       String
  productCategory String
  product         String
  quantity        Int
  plyPreference   String?
  customSpec      String?
  customNotes     String?
}
```

## Payment-ready extension points

1. **`src/lib/checkout/payment/types.ts`** — define `CheckoutPaymentAdapter` implementations (Stripe, Razorpay, PayPal).
2. **Checkout session** — introduce `checkout_sessions` table with `status: draft | awaiting_payment | paid`, line items JSON, and `payment_provider` metadata.
3. **Server actions** — `createPaymentIntentForEnquiry(ref)` returns client secret; webhooks mark session paid and notify ops.
4. **Multi-product cart** — replace single `product` in URL with `cart_id` or signed cookie referencing `checkout_line_items`.
5. **Coupons & tax by region** — plug into `boxes-pricing.ts` behind `PricingStrategy` interface.

## UX practices (B2B inquiry)

- Show **indicative** pricing with a clear “confirmed by team” disclaimer.
- Capture **structured delivery** data for freight quotes.
- Offer **save for later** (local draft) before account login exists.
- Provide **PDF receipt of intent** to reduce anxiety and forward internally.

## Operations

- Run Supabase migration after deploy: `supabase db push` or apply SQL in dashboard.
- Optional: mirror `USD_TO_AUD_RATE` logic if papers checkout is added later.
