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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  boxesCheckoutCustomerSchema,
  type BoxesCheckoutCustomerInput,
} from "@/lib/checkout/schemas/boxes-checkout";
import { estimatePapersTotals } from "@/lib/checkout/papers-pricing";
import {
  renderInquirySummaryPdf,
  type InquirySummaryPdfData,
} from "@/lib/pdf/renderInquirySummaryPdf";
import CheckoutSuccess from "@/components/checkout/boxes/CheckoutSuccess";
import { CheckoutLayout } from "@/components/checkout/shared/CheckoutLayout";
import { CheckoutSectionCard } from "@/components/checkout/shared/CheckoutSectionCard";
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

const DRAFT_KEY = "amg.papers.checkout.draft.v1";

type PaperVariantResp = {
  id: string;
  name: string;
  price: number;
  gsm: number | null;
  currency: string;
  tax_rate_percent: number | null;
  stock: number;
  is_available: boolean;
  min_order_quantity?: number | null;
  moq?: number | null;
  size_label: string | null;
  unit_label: string | null;
};

type PaperProductResp = {
  title: string;
  slug: string;
  variants: PaperVariantResp[];
  images: { url: string; is_primary: boolean }[];
  paper_type: string | null;
};

type DraftShape = {
  customer: Partial<BoxesCheckoutCustomerInput>;
  quantity: number;
  variant_id: string;
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

const fmtAud = (n: number) => `$${n.toFixed(2)}`;

export default function PapersCheckoutFlow() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  const variantParam = searchParams.get("variant")?.trim() ?? "";
  const qtyFromUrl = useMemo(() => {
    const n = Number(searchParams.get("quantity") ?? searchParams.get("qty"));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [searchParams]);

  const [product, setProduct] = useState<PaperProductResp | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
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
      quantity_requirement: 1,
      custom_notes: "",
      tax_id: "",
      preferred_contact_method: "either",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoadingProduct(true);
    setLoadError(null);
    fetch(`/api/papers/products/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok)
          throw new Error(
            typeof j?.error === "string" ? j.error : "Failed to load product"
          );
        return j as PaperProductResp;
      })
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (
      product.variants.find((v) => v.id === selectedVariantId) ??
      product.variants[0]
    );
  }, [product, selectedVariantId]);

  const moqNum = useMemo(() => {
    if (!selectedVariant) return 1;
    return Math.max(
      1,
      selectedVariant.min_order_quantity ?? selectedVariant.moq ?? 1
    );
  }, [selectedVariant]);

  const stockCap = selectedVariant?.stock ?? 0;

  useEffect(() => {
    if (!product?.variants?.length) return;

    let nextId = product.variants[0].id;
    if (variantParam && product.variants.some((v) => v.id === variantParam)) {
      nextId = variantParam;
    }

    const variantForMoq =
      product.variants.find((x) => x.id === nextId) ?? product.variants[0];
    const moqLocal = Math.max(
      1,
      variantForMoq.min_order_quantity ?? variantForMoq.moq ?? 1
    );

    let q = Math.max(qtyFromUrl > 0 ? qtyFromUrl : moqLocal, moqLocal);
    if (hydratedSlugRef.current !== slug) {
      hydratedSlugRef.current = slug;
      const draft = readDraft();
      if (
        draft?.slug === slug &&
        product.variants.some((v) => v.id === draft.variant_id)
      ) {
        nextId = draft.variant_id;
        const dv = product.variants.find((x) => x.id === draft.variant_id)!;
        const moqDraft = Math.max(1, dv.min_order_quantity ?? dv.moq ?? 1);
        if (draft.quantity) q = Math.max(draft.quantity, moqDraft);
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

    setSelectedVariantId(nextId);
    const v = product.variants.find((x) => x.id === nextId);
    const moqResolved = Math.max(1, v?.min_order_quantity ?? v?.moq ?? 1);
    const cap = v?.stock ?? 0;
    setQuantity(Math.min(Math.max(q, moqResolved), cap > 0 ? cap : q));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate on slug / first load
  }, [product, slug, variantParam, qtyFromUrl, methods]);

  useEffect(() => {
    if (!selectedVariant) return;
    setQuantity((q) => {
      const cap = selectedVariant.stock;
      const floor = Math.max(
        1,
        selectedVariant.min_order_quantity ?? selectedVariant.moq ?? 1
      );
      if (cap <= 0) return floor;
      return Math.min(Math.max(q, floor), cap);
    });
  }, [selectedVariant]);

  useEffect(() => {
    methods.setValue("quantity_requirement", quantity);
  }, [quantity, methods]);

  const variantSummary = useMemo(() => {
    if (!selectedVariant || !product) return "";
    return [
      selectedVariant.name,
      selectedVariant.gsm != null ? `${selectedVariant.gsm} GSM` : null,
      selectedVariant.size_label,
      selectedVariant.unit_label ? `per ${selectedVariant.unit_label}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [selectedVariant, product]);

  const unitAud = selectedVariant?.price ?? 0;
  const gstPct = selectedVariant?.tax_rate_percent ?? 10;
  const totals = useMemo(
    () => estimatePapersTotals(unitAud, quantity, gstPct),
    [unitAud, quantity, gstPct]
  );

  const saveDraft = useCallback(() => {
    if (!product || !selectedVariant) return;
    const vals = methods.getValues();
    writeDraft({
      slug: product.slug,
      variant_id: selectedVariant.id,
      quantity,
      customer: vals,
    });
    toast.success("Saved for later on this device.");
  }, [methods, product, selectedVariant, quantity]);

  const onSubmit = methods.handleSubmit(async (customer) => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.is_available || selectedVariant.stock <= 0) {
      toast.error("This variant is not available.");
      return;
    }
    setSubmitting(true);
    try {
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

      const res = await fetch("/api/checkout/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            slug: product.slug,
            quantity,
            variant_id: selectedVariant.id,
          },
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
        product_title: product.title,
        variant_summary:
          typeof data.variant_summary === "string"
            ? data.variant_summary
            : variantSummary,
        quantity: mergedTotals.quantity ?? quantity,
        unit_price_aud: mergedTotals.unitPriceAud ?? unitAud,
        subtotal_ex_gst_aud: mergedTotals.subtotalExGst,
        gst_percent: mergedTotals.gstPercent ?? gstPct,
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
          Choose a paper product to start checkout.
        </p>
        <Link
          href="/papers/products"
          className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-offwhite hover:bg-forest-light transition-colors"
        >
          Browse papers
        </Link>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center text-warm-gray text-sm">
        <Loader2 className="w-6 h-6 animate-spin inline-block mb-3" aria-hidden />
        <p>Loading product…</p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="text-charcoal font-medium mb-2">
          {loadError ?? "Product unavailable"}
        </p>
        <Link
          href="/papers/products"
          className="text-forest font-semibold text-sm hover:text-kraft"
        >
          ← Back to papers
        </Link>
      </div>
    );
  }

  if (!product.variants?.length) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="text-charcoal font-medium mb-2">
          No variants available for checkout.
        </p>
        <Link
          href={`/papers/product/${encodeURIComponent(product.slug)}`}
          className="text-forest font-semibold text-sm"
        >
          View product
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
        continueBrowsingHref="/papers/products"
        continueBrowsingLabel="Back to paper collection"
      />
    );
  }

  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary)
  );
  const img =
    sortedImages[0]?.url ??
    (product.paper_type === "marble"
      ? "/assets/papers/marble-02.png"
      : "/assets/papers/cotton-01.png");

  const cannotOrder =
    !selectedVariant || !selectedVariant.is_available || selectedVariant.stock <= 0;

  const variantBadges: string[] = [];
  if (selectedVariant?.gsm != null)
    variantBadges.push(`${selectedVariant.gsm} GSM`);
  if (selectedVariant?.size_label) variantBadges.push(selectedVariant.size_label);
  if (selectedVariant?.unit_label)
    variantBadges.push(`per ${selectedVariant.unit_label}`);

  const variantPickerSlot = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-kraft mb-2.5">
        Variant
      </p>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v) => {
          const active = selectedVariant?.id === v.id;
          const disabled = !v.is_available || v.stock <= 0;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVariantId(v.id)}
              disabled={disabled}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                active
                  ? "bg-forest text-offwhite border-forest shadow-sm shadow-forest/15"
                  : disabled
                    ? "bg-kraft-pale/30 text-warm-gray/60 border-kraft/10 cursor-not-allowed line-through"
                    : "bg-white text-charcoal/80 border-kraft/15 hover:border-kraft/30 hover:bg-kraft-pale/30"
              }`}
            >
              {v.name}
            </button>
          );
        })}
      </div>
      {cannotOrder && (
        <p className="mt-3 text-xs text-red-600 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden />
          This variant is out of stock. Choose another or contact us.
        </p>
      )}
    </div>
  );

  const orderCta = (
    <button
      type="submit"
      form="papers-checkout-form"
      disabled={submitting || cannotOrder}
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
      eyebrow="Handmade papers · Purchase inquiry"
      title={`Checkout — ${product.title}`}
      subtitle="Complete your details below. Our paper specialists confirm final pricing, freight and shipping windows before any payment is taken."
      backHref={`/papers/product/${encodeURIComponent(product.slug)}`}
      backLabel="Back to product"
      summarySlot={
        <OrderSummaryCard
          productTitle={product.title}
          productSubtitle={variantSummary}
          productImageSrc={img}
          productImageAlt={product.title}
          variantBadges={variantBadges}
          variantPickerSlot={variantPickerSlot}
          quantity={quantity}
          onQuantityChange={(n) => {
            if (cannotOrder) return;
            const cap = stockCap > 0 ? stockCap : Number.MAX_SAFE_INTEGER;
            setQuantity(Math.min(cap, Math.max(moqNum, n)));
          }}
          quantityMin={moqNum}
          quantityMax={stockCap > 0 ? stockCap : undefined}
          quantityDisabled={cannotOrder}
          quantityHelp={
            stockCap > 0
              ? `Minimum ${moqNum} · ${stockCap} in stock`
              : "Stock unavailable"
          }
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
          totalHint={`Indicative catalogue pricing. Final pricing, freight and taxes will be confirmed by our team. GST at ${totals.gstPercent}% on the ex-GST subtotal.`}
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
            form="papers-checkout-form"
            disabled={submitting || cannotOrder}
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
          id="papers-checkout-form"
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
            description="Where should we ship your handmade paper?"
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
            <OrderNotesField
              id="custom_notes_papers"
              placeholder="Finishing, colours, delivery windows, references…"
            />
            <div className="mt-5">
              <AttachmentReferenceCard
                title="References (optional)"
                description="Upload is coming soon. List file names or links in the notes above."
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
              disabled={submitting || cannotOrder}
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
              Our team reviews every inquiry and replies with confirmed pricing
              and shipping within one business day.
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
