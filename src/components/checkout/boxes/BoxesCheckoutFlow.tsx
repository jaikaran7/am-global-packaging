"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, FormProvider, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { getProductBySlug } from "@/data/products";
import { boxesCheckoutCustomerSchema, type BoxesCheckoutCustomerInput } from "@/lib/checkout/schemas/boxes-checkout";
import { estimateBoxesTotals, estimateBoxesUnitPriceAud } from "@/lib/checkout/boxes-pricing";
import { renderInquirySummaryPdf, type InquirySummaryPdfData } from "@/lib/pdf/renderInquirySummaryPdf";
import { CheckoutFloatInput } from "./CheckoutFloatInput";
import { CheckoutFloatSelect } from "./CheckoutFloatSelect";
import { CHECKOUT_COUNTRIES } from "./countries";
import CheckoutSuccess from "./CheckoutSuccess";
import CheckoutLayout from "@/components/checkout/shared/CheckoutLayout";
import CheckoutSectionCard from "@/components/checkout/shared/CheckoutSectionCard";
import AddressForm from "@/components/checkout/shared/AddressForm";
import ShippingSelector from "@/components/checkout/shared/ShippingSelector";
import PaymentSelector from "@/components/checkout/shared/PaymentSelector";
import QuantityStepper from "@/components/checkout/shared/QuantityStepper";
import OrderSummaryCard from "@/components/checkout/shared/OrderSummaryCard";

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
  /** Omit full-page framing when embedded (e.g. product detail column). */
  embedded?: boolean;
  /** Prefer catalogue slug over `?slug=` (product detail pages). */
  initialProductSlug?: string;
}>;

export default function BoxesCheckoutFlow({
  embedded = false,
  initialProductSlug,
}: BoxesCheckoutFlowProps = {}) {
  const searchParams = useSearchParams();
  const trimmedInitial = typeof initialProductSlug === "string" ? initialProductSlug.trim() : "";
  const slug = trimmedInitial || searchParams.get("slug")?.trim() || "";
  const qtyFromUrl = useMemo(() => {
    const n = Number(searchParams.get("quantity") ?? searchParams.get("qty"));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [searchParams]);
  const plyParam = searchParams.get("ply") ?? "";

  const product = useMemo(() => (slug ? getProductBySlug(slug) : undefined), [slug]);

  const moqNum = useMemo(() => {
    if (!product) return 1;
    const m = product.moq.match(/\d+/);
    return m ? Number(m[0]) : 1;
  }, [product]);

  const [ply, setPly] = useState(plyParam);
  const [quantity, setQuantity] = useState(1);
  const hydratedSlugRef = useRef<string>("");

  const [attachedNames, setAttachedNames] = useState<string[]>([]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("invoice");
  const [submitting, setSubmitting] = useState(false);
  const [successBundle, setSuccessBundle] = useState<{
    reference: string;
    email: string;
    pdf: InquirySummaryPdfData;
    createdIso: string;
  } | null>(null);

  const methods = useForm<BoxesCheckoutCustomerInput>({
    resolver: zodResolver(boxesCheckoutCustomerSchema) as Resolver<BoxesCheckoutCustomerInput>,
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
      plyParam && product.plyOptions.includes(plyParam) ? plyParam : product.plyOptions[0];

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
            preferred_contact_method: draft.customer.preferred_contact_method ?? "either",
          });
        }
      }
    }

    setQuantity(q);
    setPly(nextPly);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate when URL/slug/catalogue load; omit methods refs
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

  const adjustQty = (delta: number) => {
    setQuantity((q) => Math.max(moqNum, Math.max(1, q + delta)));
  };

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
      const notesMerged = [
        customer.custom_notes?.trim(),
        attachedNames.length ? `Referenced files (not uploaded): ${attachedNames.join("; ")}` : null,
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
        throw new Error(typeof data?.error === "string" ? data.error : "Submission failed");
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
        typeof data.created_at === "string" ? data.created_at : new Date().toISOString();

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
        variant_summary: typeof data.variant_summary === "string" ? data.variant_summary : variantSummary,
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
        <p className="text-warm-gray text-sm mb-6">Choose a product to start checkout.</p>
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
        <Link href="/boxes/products" className="text-forest font-semibold text-sm hover:text-kraft">
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

  const formId = "boxes-checkout-form";
  const checkoutCta = (
    <button
      type="submit"
      form={formId}
      disabled={submitting}
      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-offwhite hover:bg-forest-light transition-all shadow-lg shadow-forest/20 disabled:opacity-60"
    >
      {submitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          Sending...
        </>
      ) : (
        "Submit Inquiry"
      )}
    </button>
  );

  const leftColumn = (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={onSubmit} className="space-y-6">
        <CheckoutSectionCard title="Customer Information" description="Tell us who we should contact for this order.">
          <AddressForm>
            <CheckoutFloatInput id="full_name" label="Full name" {...methods.register("full_name")} error={methods.formState.errors.full_name?.message} />
            <CheckoutFloatInput id="company_name" label="Company name" {...methods.register("company_name")} error={methods.formState.errors.company_name?.message} />
            <CheckoutFloatInput id="email" label="Email address" type="email" autoComplete="email" {...methods.register("email")} error={methods.formState.errors.email?.message} />
            <CheckoutFloatInput id="phone" label="Phone number" type="tel" autoComplete="tel" {...methods.register("phone")} error={methods.formState.errors.phone?.message} />
          </AddressForm>
        </CheckoutSectionCard>

        <CheckoutSectionCard title="Delivery Address" description="Used for freight planning and quotation accuracy.">
          <AddressForm>
            <Controller
              control={methods.control}
              name="country"
              render={({ field }) => (
                <CheckoutFloatSelect id="country" label="Country" {...field} error={methods.formState.errors.country?.message}>
                  {CHECKOUT_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CheckoutFloatSelect>
              )}
            />
            <CheckoutFloatInput id="postal_code" label="Postal code" autoComplete="postal-code" {...methods.register("postal_code")} error={methods.formState.errors.postal_code?.message} />
            <div className="md:col-span-2">
              <CheckoutFloatInput id="delivery_address" label="Delivery address" autoComplete="street-address" {...methods.register("delivery_address")} error={methods.formState.errors.delivery_address?.message} />
            </div>
            <CheckoutFloatInput id="city" label="City / suburb" autoComplete="address-level2" {...methods.register("city")} error={methods.formState.errors.city?.message} />
            <CheckoutFloatInput id="state_region" label="State / region" autoComplete="address-level1" {...methods.register("state_region")} error={methods.formState.errors.state_region?.message} />
          </AddressForm>
        </CheckoutSectionCard>

        <CheckoutSectionCard title="Shipping Method" description="Selection is for planning UI only; final freight is confirmed by our team.">
          <ShippingSelector value={shippingMethod} onChange={setShippingMethod} />
        </CheckoutSectionCard>

        <CheckoutSectionCard title="Payment Method" description="Presentation-only options at this stage.">
          <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
        </CheckoutSectionCard>

        <CheckoutSectionCard title="Order Notes" description="Share print, finishing, timelines, and references.">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <CheckoutFloatInput id="quantity_requirement" label="Quantity requirement (units)" type="number" min={moqNum} {...methods.register("quantity_requirement", { valueAsNumber: true })} error={methods.formState.errors.quantity_requirement?.message} />
              <CheckoutFloatInput id="tax_id" label="GST / VAT / ABN (optional)" {...methods.register("tax_id")} error={methods.formState.errors.tax_id?.message} />
              <Controller
                control={methods.control}
                name="preferred_contact_method"
                render={({ field }) => (
                  <CheckoutFloatSelect id="preferred_contact_method" label="Preferred contact" {...field} error={methods.formState.errors.preferred_contact_method?.message}>
                    <option value="either">No preference</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </CheckoutFloatSelect>
                )}
              />
            </div>
            <textarea
              id="custom_notes"
              rows={4}
              {...methods.register("custom_notes")}
              className="w-full rounded-xl border border-kraft/12 bg-white px-4 py-3 text-sm text-charcoal shadow-sm transition-all hover:border-kraft/25 focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest/30 resize-none"
              placeholder="Finishing, print colours, delivery windows, references..."
            />
            <div className="rounded-xl border border-dashed border-kraft/25 bg-kraft-bg/40 px-4 py-4">
              <p className="text-xs font-semibold text-charcoal mb-2">Artwork & references (optional)</p>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-forest cursor-pointer">
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    setAttachedNames(Array.from(files).map((f) => f.name));
                    toast.message(`${files.length} file(s) referenced (not uploaded).`);
                  }}
                />
                <span className="underline decoration-kraft/40 underline-offset-2">Attach files (local only)</span>
              </label>
              {attachedNames.length > 0 && <p className="mt-2 text-[11px] text-warm-gray">{attachedNames.join(", ")}</p>}
            </div>
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-kraft/20 bg-white px-6 py-3 text-sm font-semibold text-charcoal hover:bg-kraft-bg transition-colors"
            >
              <Bookmark className="w-4 h-4 text-kraft" aria-hidden />
              Save for later
            </button>
          </div>
        </CheckoutSectionCard>
      </form>
    </FormProvider>
  );

  const rightColumn = (
    <OrderSummaryCard
      productTitle={product.name}
      variantSummary={variantSummary}
      imageSrc={img}
      imageAlt={product.shortName}
      optionUi={
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-warm-gray block mb-2">Ply preference</span>
          <select
            value={ply || product.plyOptions[0]}
            onChange={(e) => setPly(e.target.value)}
            className="w-full rounded-xl border border-kraft/12 bg-white px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/15"
          >
            {product.plyOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      }
      quantityUi={
        <div>
          <QuantityStepper
            value={quantity}
            min={moqNum}
            onDecrease={() => adjustQty(-Math.max(1, Math.round(quantity * 0.1)))}
            onIncrease={() => adjustQty(Math.max(1, Math.round(quantity * 0.1)))}
            onChange={(next) => setQuantity(Math.max(moqNum, Number.isFinite(next) ? next : moqNum))}
          />
          <p className="mt-2 text-[11px] text-warm-gray">Minimum order guideline: {product.moq}</p>
        </div>
      }
      unitLabel="Unit estimate (AUD)"
      unitValue={`$${unitAud.toFixed(2)}`}
      subtotalValue={`$${totals.subtotalExGst.toFixed(2)}`}
      gstLabel={`GST (${totals.gstPercent}%)`}
      gstValue={`$${totals.gstAmount.toFixed(2)}`}
      totalValue={`$${totals.totalIncGst.toFixed(2)}`}
      cta={checkoutCta}
    />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <CheckoutLayout
        backLink={
          !embedded ? (
            <Link href={`/boxes/products/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray hover:text-forest transition-colors">
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Back to product
            </Link>
          ) : undefined
        }
        leftColumn={leftColumn}
        rightColumn={rightColumn}
        mobileStickyBar={
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-warm-gray">Estimated total</p>
              <p className="text-sm font-bold text-forest">${totals.totalIncGst.toFixed(2)}</p>
            </div>
            <div className="flex-1">{checkoutCta}</div>
          </div>
        }
      />
    </motion.div>
  );
}
