"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Send,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { isAustralianPhone } from "@/lib/validation/phone";
import { quoteContent } from "@/content/papers-home/quoteContent";
import { contactContent } from "@/content/papers-home/contactContent";

type FormState = "idle" | "loading" | "success" | "error";

/** Matches `/api/papers/products` payload (AUD prices irrelevant for quote form). */
type PaperVariant = {
  id: string;
  name: string;
  size_label: string | null;
  gsm: number | null;
};

type PaperProduct = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  size_label: string | null;
  variants: PaperVariant[];
};

const CUSTOM_SIZE = "__custom_size__";
const CUSTOM_GSM = "__custom_gsm__";

/** Friendly labels for common catalogue GSM values — falls back to "N GSM". */
const GSM_LABELS: Record<number, string> = {
  100: "100 GSM — Light",
  200: "200 GSM — Medium",
  250: "250 GSM — Firm",
  320: "320 GSM — Heavy",
  350: "350 GSM — Extra Heavy",
};

function gsmOptionLabel(n: number): string {
  return GSM_LABELS[n] ?? `${n} GSM`;
}

/** Unique sizes from variants + optional product-level size. */
function sizeOptionsForProduct(product: PaperProduct | null): string[] {
  if (!product) return [];
  const fromVariants = product.variants
    .map((v) => v.size_label?.trim())
    .filter((s): s is string => Boolean(s));
  const set = new Set(fromVariants);
  const productLevel = product.size_label?.trim();
  if (productLevel) set.add(productLevel);
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function gsmValuesForProduct(product: PaperProduct | null): number[] {
  if (!product) return [];
  const nums = product.variants
    .map((v) => v.gsm)
    .filter((g): g is number => typeof g === "number" && !Number.isNaN(g));
  return [...new Set(nums)].sort((a, b) => a - b);
}

async function submitEnquiry(payload: {
  full_name: string;
  company_name?: string | null;
  email: string;
  phone?: string;
  project_details?: string | null;
  product_line?: string;
  items: Array<{
    product_category: string;
    product: string;
    quantity?: number | null;
    ply_preference?: string | null;
    custom_name?: string | null;
    custom_spec?: string | null;
    custom_notes?: string | null;
    product_id?: string | null;
    variant_id?: string | null;
  }>;
}) {
  const res = await fetch("/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to submit enquiry");
  }
  return res.json();
}

async function fetchPaperProducts(searchType: string | null): Promise<PaperProduct[]> {
  let url = "/api/papers/products";
  if (searchType === "cotton" || searchType === "marble") {
    url = `/api/papers/products?type=${encodeURIComponent(searchType)}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not load paper products.");
  }
  const data = await res.json();
  const items = (data.items ?? []) as PaperProduct[];
  return items;
}

const { fields } = quoteContent.form;

export default function PapersQuoteForm() {
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const urlPrefillApplied = useRef<string>("");

  const [products, setProducts] = useState<PaperProduct[]>([]);
  const [catalogueError, setCatalogueError] = useState("");
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  const [submitStatus, setSubmitStatus] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);

  /** Selected catalogue product slug */
  const [selectedSlug, setSelectedSlug] = useState("");
  const [size, setSize] = useState("");
  const [sizeCustom, setSizeCustom] = useState("");
  const [gsm, setGsm] = useState("");
  const [gsmCustom, setGsmCustom] = useState("");

  const searchType =
    searchParams?.get("type") === "cotton" || searchParams?.get("type") === "marble"
      ? searchParams.get("type")
      : null;

  useEffect(() => {
    let cancelled = false;
    setCatalogueLoading(true);
    setCatalogueError("");
    fetchPaperProducts(searchType)
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCatalogueError(e instanceof Error ? e.message : "Could not load products.");
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchType]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === selectedSlug) ?? null,
    [products, selectedSlug]
  );

  const sizeChoices = useMemo(() => sizeOptionsForProduct(selectedProduct), [selectedProduct]);
  const gsmChoices = useMemo(() => gsmValuesForProduct(selectedProduct), [selectedProduct]);

  const resetPaperFields = useCallback(() => {
    setSize("");
    setSizeCustom("");
    setGsm("");
    setGsmCustom("");
  }, []);

  const applyUrlPrefill = useCallback(() => {
    const slug = searchParams?.get("slug") ?? "";
    const variantId = searchParams?.get("variant") ?? "";
    if (!slug) return;

    const key = `${slug}|${variantId}`;
    if (urlPrefillApplied.current === key) return;

    const p = products.find((x) => x.slug === slug);
    if (!p) return;

    urlPrefillApplied.current = key;
    setSelectedSlug(slug);

    if (!variantId) {
      resetPaperFields();
      return;
    }

    const v = p.variants.find((x) => x.id === variantId);
    if (!v) {
      resetPaperFields();
      return;
    }

    const sizes = sizeOptionsForProduct(p);
    const gsms = gsmValuesForProduct(p);
    const sl = v.size_label?.trim();

    if (sl && sizes.includes(sl)) {
      setSize(sl);
      setSizeCustom("");
    } else if (sl) {
      setSize(CUSTOM_SIZE);
      setSizeCustom(sl);
    } else {
      setSize(CUSTOM_SIZE);
      setSizeCustom("");
    }

    if (v.gsm != null && gsms.includes(v.gsm)) {
      setGsm(String(v.gsm));
      setGsmCustom("");
    } else if (v.gsm != null) {
      setGsm(CUSTOM_GSM);
      setGsmCustom(String(v.gsm));
    } else {
      setGsm(CUSTOM_GSM);
      setGsmCustom("");
    }
  }, [products, resetPaperFields, searchParams]);

  useEffect(() => {
    if (!products.length) return;
    applyUrlPrefill();
  }, [products, applyUrlPrefill]);

  useEffect(() => {
    if (submitStatus !== "success") return;
    setSuccessVisible(true);
    const id = window.setTimeout(() => {
      setSuccessVisible(false);
      setSubmitStatus("idle");
    }, 5000);
    return () => window.clearTimeout(id);
  }, [submitStatus]);

  function validatePhone(value: string): string {
    if (!value) return "";
    return isAustralianPhone(value) ? "" : quoteContent.form.errors.phone;
  }

  function effectiveSizeLabel(): string {
    if (size === CUSTOM_SIZE) return sizeCustom.trim();
    return size;
  }

  function effectiveGsmLabel(): string {
    if (gsm === CUSTOM_GSM) return gsmCustom.trim();
    const n = Number(gsm);
    if (!Number.isNaN(n)) return gsmOptionLabel(n);
    return gsm;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    setPhoneError("");

    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("full_name") as HTMLInputElement)?.value?.trim();
    const company_name = (form.elements.namedItem("company_name") as HTMLInputElement)?.value?.trim() || null;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const phoneRaw = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() || "";
    const phone = phoneRaw || undefined;
    const quantity = (form.elements.namedItem("quantity") as HTMLInputElement)?.value?.trim();
    const requirements = (form.elements.namedItem("requirements") as HTMLTextAreaElement)?.value?.trim() || undefined;

    if (!full_name || !email) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.required);
      return;
    }
    const phoneValidation = validatePhone(phoneRaw);
    if (phoneValidation) {
      setSubmitStatus("error");
      setPhoneError(phoneValidation);
      return;
    }
    if (!selectedSlug || !selectedProduct) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.productTypeRequired);
      return;
    }
    if (!size) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.sizeRequired);
      return;
    }
    if (size === CUSTOM_SIZE && !sizeCustom.trim()) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.customSizeRequired);
      return;
    }
    if (!gsm) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.gsmRequired);
      return;
    }
    if (gsm === CUSTOM_GSM && !gsmCustom.trim()) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.customGsmRequired);
      return;
    }

    const szLabel = effectiveSizeLabel();
    const gsmLabel = effectiveGsmLabel();

    let variantId: string | null = null;
    if (size !== CUSTOM_SIZE && gsm !== CUSTOM_GSM) {
      const n = Number(gsm);
      const match = selectedProduct.variants.find((v) => {
        if (v.gsm !== n) return false;
        const vSize =
          v.size_label?.trim() ||
          selectedProduct.size_label?.trim() ||
          "";
        return vSize === size;
      });
      variantId = match?.id ?? null;
    }

    const items = [
      {
        product_category: selectedProduct.title,
        product: `${szLabel} — ${gsmLabel}`,
        quantity: quantity ? Number(quantity) || null : null,
        ply_preference: null,
        custom_name: null,
        custom_spec: `Catalogue slug: ${selectedProduct.slug}`,
        custom_notes: requirements || null,
        product_id: selectedProduct.id,
        variant_id: variantId,
      },
    ];

    setSubmitStatus("loading");
    try {
      await submitEnquiry({
        full_name,
        company_name,
        email,
        phone,
        project_details: requirements || undefined,
        product_line: "papers",
        items,
      });
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err instanceof Error ? err.message : quoteContent.form.errors.generic);
    }
  }

  function onProductChange(slug: string) {
    setSelectedSlug(slug);
    resetPaperFields();
    urlPrefillApplied.current = "";
  }

  return (
    <section id="contact" className="relative py-20 md:py-32 bg-cream overflow-hidden">
      <div className="absolute inset-0 kraft-texture opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

      <div ref={ref} className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12 lg:px-20 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-kraft" />
            <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
              {contactContent.hero.badge}
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            {contactContent.hero.heading}
            <br />
            <span className="text-forest">{contactContent.hero.headingAccent}</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">{contactContent.hero.description}</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-white rounded-3xl p-5 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5 w-full max-w-[680px] mx-auto md:max-w-none">
              {submitStatus === "success" && successVisible ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8 md:min-h-[520px]"
                >
                  <motion.div
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center text-forest"
                  >
                    <CheckCircle className="w-7 h-7" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-charcoal">{quoteContent.form.success.heading}</h3>
                    <p className="mt-3 text-sm md:text-base text-warm-gray">{quoteContent.form.success.message}</p>
                    <p className="mt-2 text-xs text-warm-gray/70">{quoteContent.form.success.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitStatus("idle");
                      setSuccessVisible(false);
                      setSubmitError("");
                      setPhoneError("");
                      urlPrefillApplied.current = "";
                      formRef.current?.reset();
                      setSelectedSlug("");
                      resetPaperFields();
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 text-sm"
                  >
                    {quoteContent.form.success.button}
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.form
                    key="paper-quote-form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    {submitStatus === "error" && submitError && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {submitError}
                      </div>
                    )}
                    {catalogueError && (
                      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                        {catalogueError}
                      </div>
                    )}

                    {/* Contact details */}
                    <div className="mb-2 text-xs font-semibold text-kraft tracking-wide uppercase">
                      {quoteContent.form.sections.contact}
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1 mb-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-charcoal tracking-wide">
                          {fields.fullName.label} *
                        </label>
                        <input
                          name="full_name"
                          type="text"
                          placeholder={fields.fullName.placeholder}
                          required
                          disabled={submitStatus === "loading"}
                          className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-charcoal tracking-wide">
                          {fields.companyName.label}
                        </label>
                        <input
                          name="company_name"
                          type="text"
                          placeholder={fields.companyName.placeholder}
                          disabled={submitStatus === "loading"}
                          className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.email.label} *</label>
                        <input
                          name="email"
                          type="email"
                          placeholder={fields.email.placeholder}
                          required
                          disabled={submitStatus === "loading"}
                          className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.phone.label}</label>
                        <input
                          name="phone"
                          type="tel"
                          placeholder={fields.phone.placeholder}
                          disabled={submitStatus === "loading"}
                          onBlur={(e) => setPhoneError(validatePhone(e.target.value.trim()))}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            if (!v) {
                              setPhoneError("");
                              return;
                            }
                            if (v.length >= 6 || phoneError) setPhoneError(validatePhone(v));
                          }}
                          className={`px-4 py-3.5 bg-offwhite rounded-xl border text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                            phoneError
                              ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                              : "border-kraft/10 focus:border-forest/30 focus:ring-forest/10"
                          }`}
                        />
                        {phoneError && <span className="text-xs text-red-600">{phoneError}</span>}
                      </div>
                    </div>

                    {/* Paper requirements */}
                    <div className="border-t border-kraft/10 pt-5 mb-6">
                      <div className="mb-4 text-xs font-semibold text-kraft tracking-wide uppercase">
                        {quoteContent.form.sections.paper}
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1">
                        {/* Product */}
                        <div className="flex flex-col gap-1.5 col-span-2 max-[380px]:col-span-1">
                          <label className="text-xs font-semibold text-charcoal tracking-wide">
                            {fields.productType.label} *
                          </label>
                          <div className="relative">
                            <select
                              value={selectedSlug}
                              onChange={(e) => onProductChange(e.target.value)}
                              disabled={submitStatus === "loading" || catalogueLoading}
                              className="w-full px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60 pr-10"
                            >
                              <option value="">
                                {catalogueLoading ? "Loading catalogue…" : fields.productType.placeholder}
                              </option>
                              {products.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                  {p.title}
                                </option>
                              ))}
                            </select>
                            {catalogueLoading && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-kraft pointer-events-none" />
                            )}
                          </div>
                        </div>

                        {/* Size, GSM, quantity — single row */}
                        <div className="col-span-2 max-[380px]:col-span-1 grid grid-cols-3 gap-2 sm:gap-4">
                          {/* Size */}
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.size.label} *</label>
                            <select
                              value={size}
                              onChange={(e) => {
                                setSize(e.target.value);
                                setSizeCustom("");
                              }}
                              disabled={!selectedProduct || catalogueLoading || submitStatus === "loading"}
                              className="w-full min-w-0 px-3 sm:px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60"
                            >
                              <option value="">
                                {selectedProduct ? fields.size.placeholder : "Select a product first"}
                              </option>
                              {sizeChoices.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                              <option value={CUSTOM_SIZE}>{fields.size.customOptionLabel}</option>
                            </select>
                            {size === CUSTOM_SIZE && (
                              <input
                                type="text"
                                value={sizeCustom}
                                onChange={(e) => setSizeCustom(e.target.value)}
                                placeholder={fields.size.customPlaceholder}
                                disabled={submitStatus === "loading"}
                                className="mt-2 px-3 sm:px-4 py-3 bg-white rounded-xl border border-kraft/15 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                              />
                            )}
                          </div>

                          {/* GSM */}
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.gsm.label} *</label>
                            <select
                              value={gsm}
                              onChange={(e) => {
                                setGsm(e.target.value);
                                setGsmCustom("");
                              }}
                              disabled={!selectedProduct || catalogueLoading || submitStatus === "loading"}
                              className="w-full min-w-0 px-3 sm:px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60"
                            >
                              <option value="">
                                {selectedProduct ? fields.gsm.placeholder : "Select a product first"}
                              </option>
                              {gsmChoices.map((g) => (
                                <option key={g} value={String(g)}>
                                  {gsmOptionLabel(g)}
                                </option>
                              ))}
                              <option value={CUSTOM_GSM}>{fields.gsm.customOptionLabel}</option>
                            </select>
                            {gsm === CUSTOM_GSM && (
                              <input
                                type="text"
                                value={gsmCustom}
                                onChange={(e) => setGsmCustom(e.target.value)}
                                placeholder={fields.gsm.customPlaceholder}
                                disabled={submitStatus === "loading"}
                                className="mt-2 px-3 sm:px-4 py-3 bg-white rounded-xl border border-kraft/15 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                              />
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.quantity.label}</label>
                            <input
                              name="quantity"
                              type="number"
                              min={1}
                              placeholder={fields.quantity.placeholder}
                              disabled={submitStatus === "loading"}
                              className="w-full min-w-0 px-3 sm:px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="flex flex-col gap-2 mb-8">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">{fields.requirements.label}</label>
                      <textarea
                        name="requirements"
                        rows={4}
                        placeholder={fields.requirements.placeholder}
                        disabled={submitStatus === "loading"}
                        className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all resize-none disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitStatus === "loading" || Boolean(phoneError) || catalogueLoading || !products.length}
                      className="group w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 text-sm disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {submitStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {quoteContent.form.submitting}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {quoteContent.form.submit}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-warm-gray text-center mt-4">{quoteContent.form.responseNote}</p>
                  </motion.form>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Right: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              {[
                { icon: Phone, ...contactContent.contactCards[0] },
                { icon: Mail, ...contactContent.contactCards[1] },
                { icon: MapPin, ...contactContent.contactCards[2] },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="group flex items-start gap-4 md:gap-5 p-4 md:p-6 bg-white rounded-2xl border border-kraft/5 hover:border-kraft/15 hover:shadow-lg hover:shadow-kraft/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/5 flex items-center justify-center flex-shrink-0 group-hover:bg-forest/10 transition-colors">
                    <item.icon className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-kraft tracking-wider uppercase mb-1">{item.label}</div>
                    <div className="text-sm md:text-base font-bold text-charcoal break-words">{item.value}</div>
                    <div className="text-xs text-warm-gray mt-0.5">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <div className="rounded-2xl bg-white border border-kraft/10 p-5 md:p-6 shadow-sm shadow-kraft/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-kraft mb-4">
                <MapPin className="w-4 h-4 text-kraft" />
                Find Us on Google Maps
              </div>
              <div className="relative rounded-xl overflow-hidden h-[200px] md:h-[210px] bg-gradient-to-br from-offwhite to-cream border border-kraft/20 ring-1 ring-kraft/10">
                <iframe
                  title="AM Global Papers location map"
                  src="https://www.google.com/maps?q=-33.792362213134766,150.9712677001953&z=17&hl=en&output=embed"
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-warm-gray">
                <span>Click the map to open directions</span>
                <a
                  href="https://www.google.com/maps?q=-33.792362213134766,150.9712677001953&z=17&hl=en"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-kraft hover:text-kraft-light transition-colors"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bulk banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 md:mt-16 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-forest to-forest-light relative overflow-hidden"
        >
          <div className="absolute inset-0 corrugated-pattern opacity-10" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-kraft-light text-xs font-semibold tracking-widest uppercase mb-3">
                {contactContent.bulkBanner.label}
              </div>
              <h3 className="text-2xl font-bold text-offwhite mb-2">{contactContent.bulkBanner.heading}</h3>
              <p className="text-offwhite/60 text-sm leading-relaxed max-w-xl">{contactContent.bulkBanner.description}</p>
            </div>
            <a
              href={`mailto:${contactContent.bulkBanner.cta}`}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl whitespace-nowrap text-sm"
            >
              {contactContent.bulkBanner.cta}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
