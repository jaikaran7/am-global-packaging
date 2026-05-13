"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getProductBySlug } from "@/data/products";
import {
  boxesCheckoutCustomerSchema,
  type BoxesCheckoutCustomerInput,
} from "@/lib/checkout/schemas/boxes-checkout";
import {
  estimateBoxesTotals,
  estimateBoxesUnitPriceAud,
} from "@/lib/checkout/boxes-pricing";
import {
  renderInquirySummaryPdf,
  type InquirySummaryPdfData,
} from "@/lib/pdf/renderInquirySummaryPdf";
import CheckoutSuccess from "./CheckoutSuccess";
import { CheckoutLayout } from "@/components/checkout/shared/CheckoutLayout";
import {
  CheckoutSectionCard,
} from "@/components/checkout/shared/CheckoutSectionCard";
import {
  ShippingSelector,
  DEFAULT_SHIPPING_OPTIONS,
} from "@/components/checkout/shared/ShippingSelector";
import {
  PaymentSelector,
  DEFAULT_PAYMENT_OPTIONS,
} from "@/components/checkout/shared/PaymentSelector";
import { OrderSummaryCard } from "@/components/checkout/shared/OrderSummaryCard";
import {
  CustomerInfoFields,
  DeliveryAddressFields,
  CheckoutCommercialFields,
  OrderNotesField,
} from "@/components/checkout/shared/CheckoutCustomerFields";
import { DEFAULT_CHECKOUT_STEPS } from "@/components/checkout/shared/CheckoutStepper";
import { AttachmentReferenceCard } from "@/components/checkout/shared/AttachmentReferenceCard";

const DRAFT_KEY = "amg.boxes.checkout.draft.v1";

type DraftShape = {
  customer: Partial<BoxesCheckoutCustomerInput>;
  quantity: number;
  ply: string;
  slug: string;
};

function readDraft(): DraftShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftShape;
  } catch {
    return null;
  }
}

function writeDraft(data: DraftShape) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export type BoxesCheckoutFlowProps = Readonly<{
  embedded?: boolean;
  initialProductSlug?: string;
}>;

const fmtAud = (n: number) => `$${n.toFixed(2)}`;

export default function BoxesCheckoutFlow({
  initialProductSlug,
}: BoxesCheckoutFlowProps = {}) {
  const searchParams = useSearchParams();
  const trimmedInitial =
    typeof initialProductSlug === "string" ? initialProductSlug.trim() : "";
  const slug = trimmedInitial || searchParams.get("slug")?.trim() || "";
  const qtyFromUrl = useMemo(() => {
    const n = Number(searchParams.get("quantity") ?? searchParams.get("qty"));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [searchParams]);
  const plyParam = searchParams.get("ply") ?? "";

  const product = useMemo(
    () => (slug ? getProductBySlug(slug) : undefined),
    [slug]
  );

  const moqNum = useMemo(() => {
    if (!product) return 1;
    const m = product.moq.match(/\d+/);
    return m ? Number(m[0]) : 1;
  }, [product]);

  const [ply, setPly] = useState(plyParam);
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<string>(
    DEFAULT_SHIPPING_OPTIONS[0].id
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    DEFAULT_PAYMENT_OPTIONS[0].id
  );
  const hydratedSlugRef = useRef<string>("");

  const [attachedNames, setAttachedNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successBundle, setSuccessBundle] = useState<{
    reference: string;
    email: string;
    pdf: InquirySummaryPdfData;
    createdIso: string;
  } | null>(null);

  const methods = useForm<BoxesCheckoutCustomerInput>({
    resolver: zodResolver(
      boxesCheckoutCustomerSchema
    ) as Resolver<BoxesCheckoutCustomerInput>,
    defaultValues: {
      full_name: "",
      company_name: "",
      email: "",
      phone: "",
      country: "Australia",
      delivery_address: "",
      city: "",
      state_region: "",
      postal_code: "",
      quantity_requirement: quantity,
      custom_notes: "",
      tax_id: "",
      preferred_contact_method: "either",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!product) return;

    let q = Math.max(qtyFromUrl > 0 ? qtyFromUrl : moqNum, moqNum);

    let nextPly =
      plyParam && product.plyOptions.includes(plyParam)
        ? plyParam
        : product.plyOptions[0];

    if (hydratedSlugRef.current !== slug) {
      hydratedSlugRef.current = slug;
      const draft = readDraft();
      if (draft?.slug === slug) {
        if (draft.quantity) q = Math.max(draft.quantity, moqNum);
        if (draft.ply && product.plyOptions.includes(draft.ply)) nextPly = draft.ply;
        if (draft.customer) {
          methods.reset({
            full_name: draft.customer.full_name ?? "",
            company_name: draft.customer.company_name ?? "",
            email: draft.customer.email ?? "",
            phone: draft.customer.phone ?? "",
            country: draft.customer.country ?? "Australia",
            delivery_address: draft.customer.delivery_address ?? "",
            city: draft.customer.city ?? "",
            state_region: draft.customer.state_region ?? "",
            postal_code: draft.customer.postal_code ?? "",
            quantity_requirement: q,
            custom_notes: draft.customer.custom_notes ?? "",
            tax_id: draft.customer.tax_id ?? "",
            preferred_contact_method:
              draft.customer.preferred_contact_method ?? "either",
          });
        }
      }
    }

    setQuantity(q);
    setPly(nextPly);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate on URL/slug/catalogue load
  }, [product, slug, qtyFromUrl, moqNum, plyParam]);

  useEffect(() => {
    methods.setValue("quantity_requirement", quantity);
  }, [quantity, methods]);

  const variantSummary = useMemo(() => {
    if (!product) return "";
    return `${ply || product.plyOptions[0]} · ${product.gsmRange} · ${product.dimensions}`;
  }, [product, ply]);

  const unitAud = useMemo(
    () => (product ? estimateBoxesUnitPriceAud(product, quantity) : 0),
    [product, quantity]
  );
  const totals = useMemo(
    () => estimateBoxesTotals(unitAud, quantity),
    [unitAud, quantity]
  );

  const saveDraft = useCallback(() => {
    if (!product) return;
    const vals = methods.getValues();
    writeDraft({
      slug: product.slug,
      ply: ply || product.plyOptions[0],
      quantity,
      customer: vals,
    });
    toast.success("Saved for later on this device.");
  }, [methods, product, ply, quantity]);

  const onSubmit = methods.handleSubmit(async (customer) => {
    if (!product || !(ply || product.plyOptions[0])) return;
    setSubmitting(true);
    try {
      const plyUse = ply || product.plyOptions[0];
      const shippingLabel =
        DEFAULT_SHIPPING_OPTIONS.find((s) => s.id === shippingMethod)?.label ?? "";
      const paymentLabel =
        DEFAULT_PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.label ?? "";
      const notesMerged = [
        customer.custom_notes?.trim(),
        shippingLabel ? `Preferred shipping: ${shippingLabel}` : null,
        paymentLabel ? `Preferred payment: ${paymentLabel}` : null,
        attachedNames.length
          ? `Referenced files (not uploaded): ${attachedNames.join("; ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/checkout/boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { slug: product.slug, quantity, ply: plyUse },
          customer: { ...customer, custom_notes: notesMerged || undefined },
          client_pricing_version: "v1",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Submission failed"
        );
      }

      const ref =
        typeof data.reference_number === "string"
          ? data.reference_number
          : typeof data.reference_fallback === "string"
            ? data.reference_fallback
            : `ENQ-${String(data.enquiry?.id ?? "").slice(0, 8).toUpperCase()}`;

      const mergedTotals = data.totals ?? totals;
      const delivery_summary = `${customer.delivery_address}, ${customer.city} ${customer.state_region} ${customer.postal_code}`;
      const createdIso =
        typeof data.created_at === "string"
          ? data.created_at
          : new Date().toISOString();

      const pdfPayload: InquirySummaryPdfData = {
        reference: ref,
        createdAtIso: createdIso,
        customer_name: customer.full_name.trim(),
        company_name: customer.company_name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        country: customer.country.trim(),
        delivery_summary,
        product_title: product.name,
        variant_summary:
          typeof data.variant_summary === "string"
            ? data.variant_summary
            : variantSummary,
        quantity: mergedTotals.quantity ?? quantity,
        unit_price_aud: mergedTotals.unitPriceAud ?? unitAud,
        subtotal_ex_gst_aud: mergedTotals.subtotalExGst,
        gst_percent: mergedTotals.gstPercent ?? 10,
        gst_aud: mergedTotals.gstAmount,
        total_inc_gst_aud: mergedTotals.totalIncGst,
      };

      setSuccessBundle({
        reference: ref,
        email: customer.email.trim(),
        pdf: pdfPayload,
        createdIso,
      });
      localStorage.removeItem(DRAFT_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  const downloadPdf = async () => {
    if (!successBundle) return;
    const bytes = await renderInquirySummaryPdf(successBundle.pdf);
    const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${successBundle.reference}-inquiry.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!slug) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="text-warm-gray text-sm mb-6">
          Choose a product to start checkout.
        </p>
        <Link
          href="/boxes/products"
          className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-offwhite hover:bg-forest-light transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="text-charcoal font-medium mb-2">Product unavailable</p>
        <Link
          href="/boxes/products"
          className="text-forest font-semibold text-sm hover:text-kraft"
        >
          ← Back to catalogue
        </Link>
      </div>
    );
  }

  if (successBundle) {
    return (
      <CheckoutSuccess
        referenceDisplay={successBundle.reference}
        email={successBundle.email}
        productTitle={successBundle.pdf.product_title}
        variantSummary={successBundle.pdf.variant_summary}
        totalIncGst={successBundle.pdf.total_inc_gst_aud}
        onDownloadPdf={downloadPdf}
      />
    );
  }

  const img =
    product.images?.[0] ?? "/assets/products/A4-boxes%20/A4%20box%20close%20.png";

  const variantPickerSlot = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-kraft mb-2.5">
        Ply preference
      </p>
      <div className="flex flex-wrap gap-2">
        {product.plyOptions.map((p) => {
          const active = (ply || product.plyOptions[0]) === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPly(p)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                active
                  ? "bg-forest text-offwhite border-forest shadow-sm shadow-forest/15"
                  : "bg-white text-charcoal/80 border-kraft/15 hover:border-kraft/30 hover:bg-kraft-pale/30"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );

  const orderCta = (
    <button
      type="submit"
      form="boxes-checkout-form"
      disabled={submitting}
      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-offwhite hover:bg-forest-light transition-all shadow-lg shadow-forest/20 disabled:opacity-60"
    >
      {submitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          Submitting…
        </>
      ) : (
        <>
          Submit purchase inquiry
          <ArrowRight className="w-4 h-4" aria-hidden />
        </>
      )}
    </button>
  );

  return (
    <CheckoutLayout
      steps={DEFAULT_CHECKOUT_STEPS}
      activeStepId="review"
      eyebrow="Corrugated · Purchase inquiry"
      title={`Checkout — ${product.shortName}`}
      subtitle="Complete your details below. Our B2B team confirms final pricing, freight, and customization before we proceed."
      backHref={`/boxes/products/${product.slug}`}
      backLabel="Back to product"
      summarySlot={
        <OrderSummaryCard
          productTitle={product.name}
          productSubtitle={product.tagline}
          productImageSrc={img}
          productImageAlt={product.shortName}
          variantBadges={[
            ply || product.plyOptions[0],
            product.dimensions,
            product.gsmRange,
          ]}
          variantPickerSlot={variantPickerSlot}
          quantity={quantity}
          onQuantityChange={(n) => setQuantity(Math.max(moqNum, n))}
          quantityMin={moqNum}
          quantityHelp={`Minimum order guideline: ${product.moq}`}
          pricingLines={[
            {
              label: `Unit price · ${quantity.toLocaleString()} × ${fmtAud(unitAud)}`,
              value: fmtAud(totals.subtotalExGst),
            },
            { label: "Shipping", value: "Confirmed by team" },
            {
              label: `GST (${totals.gstPercent}%)`,
              value: fmtAud(totals.gstAmount),
            },
          ]}
          totalLabel="Estimated total"
          totalValue={`${fmtAud(totals.totalIncGst)} AUD`}
          totalHint={`Indicative catalogue pricing. Final pricing and freight will be confirmed by our team. GST shown at ${totals.gstPercent}% for Australian supply.`}
          ctaSlot={orderCta}
          policyNote="By submitting, you agree to receive a response by your preferred contact method. We never share your details."
        />
      }
      mobileStickyCta={
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-warm-gray">
              Estimated total
            </p>
            <p className="text-base font-bold text-forest tabular-nums">
              {fmtAud(totals.totalIncGst)} AUD
            </p>
          </div>
          <button
            type="submit"
            form="boxes-checkout-form"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-offwhite hover:bg-forest-light transition-all shadow-lg shadow-forest/20 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <>
                Submit
                <ArrowRight className="w-4 h-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form
          id="boxes-checkout-form"
          onSubmit={onSubmit}
          className="space-y-6 md:space-y-7"
        >
          <CheckoutSectionCard
            index={1}
            id="customer-info"
            title="Customer information"
            description="Who should we send the quote and order confirmation to?"
          >
            <CustomerInfoFields />
          </CheckoutSectionCard>

          <CheckoutSectionCard
            index={2}
            id="delivery-address"
            title="Delivery address"
            description="Where should we ship your packaging?"
          >
            <DeliveryAddressFields />
          </CheckoutSectionCard>

          <CheckoutSectionCard
            index={3}
            id="shipping-method"
            title="Shipping method"
            description="Choose how you'd like the order delivered."
          >
            <ShippingSelector
              value={shippingMethod}
              onChange={setShippingMethod}
            />
          </CheckoutSectionCard>

          <CheckoutSectionCard
            index={4}
            id="payment-method"
            title="Payment method"
            description="Pick a preferred payment route. Our team confirms before charging."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest">
                <ShieldCheck className="w-3 h-3" aria-hidden />
                B2B
              </span>
            }
          >
            <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-kraft-pale/40 border border-kraft/15 px-4 py-3">
              <Info className="w-4 h-4 text-kraft flex-shrink-0 mt-0.5" aria-hidden />
              <p className="text-[12px] text-charcoal/80 leading-relaxed">
                No payment is captured here — this is a B2B inquiry. We confirm
                pricing, freight, and your preferred payment method by email or
                phone before any charge.
              </p>
            </div>
          </CheckoutSectionCard>

          <CheckoutSectionCard
            index={5}
            id="commercial"
            title="Commercial details"
            description="Tax identifiers and contact preference."
          >
            <CheckoutCommercialFields moq={moqNum} />
          </CheckoutSectionCard>

          <CheckoutSectionCard
            index={6}
            id="notes"
            title="Order notes & references"
            description="Anything else we should know about this order?"
          >
            <OrderNotesField id="custom_notes" />
            <div className="mt-5">
              <AttachmentReferenceCard
                attachedNames={attachedNames}
                onFilesSelected={(files) => {
                  setAttachedNames(Array.from(files).map((f) => f.name));
                  toast.message(`${files.length} file(s) referenced (not uploaded).`);
                }}
              />
            </div>
          </CheckoutSectionCard>

          <div className="hidden lg:flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-offwhite hover:bg-forest-light transition-all shadow-lg shadow-forest/20 disabled:opacity-60 min-w-[220px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Submitting inquiry…
                </>
              ) : (
                <>
                  Submit purchase inquiry
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-kraft/20 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal hover:bg-kraft-bg transition-colors"
            >
              <Bookmark className="w-4 h-4 text-kraft" aria-hidden />
              Save for later
            </button>
            <p className="text-[11px] text-warm-gray sm:max-w-xs leading-relaxed">
              Our team reviews every inquiry and replies with confirmed pricing,
              freight and customization within one business day.
            </p>
          </div>

          <div className="lg:hidden flex justify-center pt-1">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-kraft/20 bg-white px-5 py-2.5 text-xs font-semibold text-charcoal hover:bg-kraft-bg transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-kraft" aria-hidden />
              Save inquiry for later
            </button>
          </div>
        </form>
      </FormProvider>
    </CheckoutLayout>
  );
}
