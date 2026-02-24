"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send, Phone, MapPin, Mail, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { isAustralianPhone } from "@/lib/validation/phone";
import {
  products,
  categories,
  getCategoryProducts,
} from "@/data/products";

async function submitEnquiry(payload: {
  full_name: string;
  company_name?: string | null;
  email: string;
  phone?: string;
  product_category: string;
  product: string;
  quantity?: number | null;
  ply_preference?: string | null;
  project_details?: string | null;
  custom_name?: string | null;
  custom_spec?: string | null;
  custom_notes?: string | null;
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

const productCategories = categories.filter((c) => c.id !== "all");

/** Corrugated Sheets options (not in main products catalogue) */
const CORRUGATED_SHEETS_OPTIONS = [
  { id: "standard-single-wall", label: "Standard Single-Wall (3-Ply)", plyOptions: ["3-Ply"] },
  { id: "double-wall", label: "Double-Wall (5-Ply)", plyOptions: ["5-Ply"] },
  { id: "heavy-duty", label: "Heavy-Duty / Industrial (7-Ply)", plyOptions: ["7-Ply"] },
  { id: "custom-thickness", label: "Custom thickness / dimensions", plyOptions: ["3-Ply", "5-Ply", "7-Ply"] },
] as const;
const CORRUGATED_SHEETS_ID = "corrugated-sheets";

const allCategories = [
  ...productCategories,
  { id: CORRUGATED_SHEETS_ID, label: "Corrugated Sheets" },
];

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [categoryId, setCategoryId] = useState<string>("");
  const [productSlug, setProductSlug] = useState<string>("");
  const [plyPreference, setPlyPreference] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [customSpec, setCustomSpec] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [successVisible, setSuccessVisible] = useState<boolean>(false);

  const isCorrugatedSheets = categoryId === CORRUGATED_SHEETS_ID;
  const isCustomCategory = categoryId === "custom";
  const categoryProducts = useMemo(
    () => (categoryId && !isCorrugatedSheets ? getCategoryProducts(categoryId) : []),
    [categoryId, isCorrugatedSheets]
  );
  const selectedProduct = useMemo(
    () => (categoryId && !isCorrugatedSheets ? products.find((p) => p.slug === productSlug) : undefined),
    [categoryId, productSlug, isCorrugatedSheets]
  );
  const selectedSheetOption = useMemo(
    () => (isCorrugatedSheets ? CORRUGATED_SHEETS_OPTIONS.find((s) => s.id === productSlug) : undefined),
    [isCorrugatedSheets, productSlug]
  );
  const plyOptions = selectedProduct?.plyOptions ?? selectedSheetOption?.plyOptions ?? [];
  const hasProductSelection = selectedProduct !== undefined || selectedSheetOption !== undefined;
  function getProductPlaceholder(): string {
    if (categoryId === "") return "Select category first";
    if (isCorrugatedSheets) return "Select sheet type";
    return "Select product";
  }
  function getPlyPlaceholder(): string {
    if (!hasProductSelection) return "Select product first";
    if (plyOptions.length === 0) return "No ply options";
    return "Select ply type";
  }

  const productCategoryLabel = allCategories.find((c) => c.id === categoryId)?.label ?? categoryId;
  const productLabel = selectedProduct
    ? `${selectedProduct.shortName} — ${selectedProduct.dimensions}`
    : selectedSheetOption?.label ?? productSlug;
  const isCustomProduct = productSlug === "custom";

  function validatePhone(value: string): string {
    if (!value) return "";
    return isAustralianPhone(value)
      ? ""
      : "Please enter a valid Australian mobile number.";
  }

  useEffect(() => {
    if (submitStatus !== "success") return;
    setSuccessVisible(true);
    const timeoutId = window.setTimeout(() => {
      setSuccessVisible(false);
      setSubmitStatus("idle");
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [submitStatus]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    setPhoneError("");
    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("full_name") as HTMLInputElement)?.value?.trim();
    const company_name = (form.elements.namedItem("company_name") as HTMLInputElement)?.value?.trim();
    const companyNameValue = company_name || "Not provided";
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const phoneRaw = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() || "";
    const phone = phoneRaw || undefined;
    const project_details = (form.elements.namedItem("project_details") as HTMLTextAreaElement)?.value?.trim() || undefined;

    if (!full_name || !email) {
      setSubmitStatus("error");
      setSubmitError("Please fill in required fields: Full Name, Email.");
      return;
    }
    const phoneValidation = validatePhone(phoneRaw);
    if (phoneValidation) {
      setSubmitStatus("error");
      setPhoneError(phoneValidation);
      return;
    }
    if (!categoryId || !productSlug) {
      setSubmitStatus("error");
      setSubmitError("Please select Product Category and Product.");
      return;
    }
    if (isCustomProduct && !customName.trim()) {
      setSubmitStatus("error");
      setSubmitError("Please enter a custom product name.");
      return;
    }

    setSubmitStatus("loading");
    try {
      await submitEnquiry({
        full_name,
        company_name: companyNameValue,
        email,
        phone,
        product_category: productCategoryLabel,
        product: isCustomProduct ? "Custom" : productLabel,
        quantity: quantity ? Number(quantity) || null : null,
        ply_preference: plyPreference || null,
        project_details: project_details || null,
        custom_name: isCustomProduct ? customName || null : null,
        custom_spec: isCustomProduct ? customSpec || null : null,
        custom_notes: isCustomProduct ? customNotes || null : null,
      });
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section
      id="contact"
      className="relative py-32 bg-cream overflow-hidden"
    >
      <div className="absolute inset-0 kraft-texture opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

      <div
        ref={ref}
        className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative"
      >
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
              Get In Touch
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Request a quote for
            <br />
            <span className="text-forest">bulk orders</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">
            Tell us about your packaging requirements and our team will provide a
            custom quote within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5">
              {submitStatus === "success" && successVisible ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8 min-h-[360px] md:min-h-[520px]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center text-forest"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.08, 1] }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CheckCircle className="w-7 h-7" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-charcoal">
                      Thank you for your quote request!
                    </h3>
                    <p className="mt-3 text-sm md:text-base text-warm-gray">
                      Our team will review your details and contact you within 24 hours.
                    </p>
                    <p className="mt-2 text-xs text-warm-gray/70">
                      For urgent inquiries, email info@amglobalpackagingsolutions.com
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitStatus("idle");
                        setSuccessVisible(false);
                        setSubmitError("");
                        setPhoneError("");
                        formRef.current?.reset();
                        setCategoryId("");
                        setProductSlug("");
                        setPlyPreference("");
                        setQuantity("");
                        setCustomName("");
                        setCustomSpec("");
                        setCustomNotes("");
                      }}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 text-sm"
                    >
                      Submit Another Request
                    </button>
                    <a
                      href="#"
                      className="inline-flex items-center justify-center text-sm text-warm-gray hover:text-forest transition-colors"
                    >
                      Back to Home
                    </a>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.form
                    key="quote-form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                  {submitStatus === "error" && submitError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">
                        Full Name *
                      </label>
                      <input
                        name="full_name"
                        type="text"
                        placeholder="John Doe"
                        required
                        disabled={submitStatus === "loading"}
                        className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">
                        Company Name
                      </label>
                      <input
                        name="company_name"
                        type="text"
                        placeholder="Your Company"
                        disabled={submitStatus === "loading"}
                        className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">
                        Email *
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        required
                        disabled={submitStatus === "loading"}
                        className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">
                        Phone
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+61 4XX XXX XXX"
                        disabled={submitStatus === "loading"}
                        onBlur={(e) => setPhoneError(validatePhone(e.target.value.trim()))}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          if (value.length === 0) {
                            setPhoneError("");
                            return;
                          }
                          if (value.length >= 6 || phoneError) {
                            setPhoneError(validatePhone(value));
                          }
                        }}
                        className={`px-4 py-3.5 bg-offwhite rounded-xl border text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                          phoneError
                            ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                            : "border-kraft/10 focus:border-forest/30 focus:ring-forest/10"
                        }`}
                      />
                      {phoneError && (
                        <span className="text-xs text-red-600">
                          {phoneError}
                        </span>
                      )}
                    </div>
                  </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Product Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCategoryId(value);
                      setProductSlug(value === "custom" ? "custom" : "");
                      setPlyPreference("");
                      setCustomName("");
                      setCustomSpec("");
                      setCustomNotes("");
                    }}
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                  >
                    <option value="">Select category</option>
                    <option value="custom">Custom</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Product *
                  </label>
                  <select
                    value={productSlug}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductSlug(value);
                      setPlyPreference("");
                      if (value !== "custom") {
                        setCustomName("");
                        setCustomSpec("");
                        setCustomNotes("");
                      }
                    }}
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                    disabled={isCustomCategory}
                  >
                    <option value="">{getProductPlaceholder()}</option>
                    {isCustomCategory ? null : (
                      <>
                        {(isCorrugatedSheets
                          ? CORRUGATED_SHEETS_OPTIONS.map((s) => ({
                              value: s.id,
                              label: s.label,
                            }))
                          : categoryProducts.map((p) => ({
                              value: p.slug,
                              label: `${p.shortName} — ${p.dimensions}`,
                            }))
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </>
                    )}
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 5000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Ply Preference
                  </label>
                  <select
                    value={plyPreference}
                    onChange={(e) => setPlyPreference(e.target.value)}
                    disabled={!hasProductSelection || plyOptions.length === 0}
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60"
                  >
                    <option value="">{getPlyPlaceholder()}</option>
                    {plyOptions.map((ply) => (
                      <option key={ply} value={ply}>
                        {ply}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isCustomProduct && (
                <div className="grid sm:grid-cols-3 gap-5 mt-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-charcoal tracking-wide">
                      Custom Product Name *
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                      placeholder="Enter custom product"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-charcoal tracking-wide">
                      Custom Spec
                    </label>
                    <input
                      type="text"
                      value={customSpec}
                      onChange={(e) => setCustomSpec(e.target.value)}
                      className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                      placeholder="Size/spec"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-charcoal tracking-wide">
                      Custom Notes
                    </label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-5">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Project Details
                </label>
                <textarea
                  name="project_details"
                  rows={4}
                  placeholder="Tell us about your packaging requirements, dimensions, special features..."
                  disabled={submitStatus === "loading"}
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all resize-none disabled:opacity-60"
                />
              </div>

                  <button
                    type="submit"
                    disabled={submitStatus === "loading" || Boolean(phoneError)}
                    className="group w-full mt-8 inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 text-sm disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {submitStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Quote Request
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-warm-gray text-center mt-4">
                    We respond to all inquiries within 24 hours during business days.
                  </p>
                  </motion.form>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Right: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col gap-8"
          >
            {/* Contact cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "0434 396 360",
                  sub: "Mon-Fri, 9AM - 5PM AEST",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "enquiries@amglobalpackagingsolutions.com",
                  sub: "We respond within 24 hours",
                },
                {
                  icon: MapPin,
                  label: "Factory & Office",
                  value: "148 Bulli Road, Constitution Hill",
                  sub: "NSW 2145, Australia",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-kraft/5 hover:border-kraft/15 hover:shadow-lg hover:shadow-kraft/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/5 flex items-center justify-center flex-shrink-0 group-hover:bg-forest/10 transition-colors">
                    <item.icon className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-kraft tracking-wider uppercase mb-1">
                      {item.label}
                    </div>
                    <div className="text-base font-bold text-charcoal">
                      {item.value}
                    </div>
                    <div className="text-xs text-warm-gray mt-0.5">
                      {item.sub}
                    </div>
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
              <div className="relative rounded-xl overflow-hidden h-[210px] bg-gradient-to-br from-offwhite to-cream border border-kraft/20 ring-1 ring-kraft/10">
                <iframe
                  title="AM Global Packaging location map"
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

        {/* Bulk order banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 md:mt-16 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-forest to-forest-light relative overflow-hidden"
        >
          <div className="absolute inset-0 corrugated-pattern opacity-10" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-kraft-light text-xs font-semibold tracking-widest uppercase mb-3">
                Bulk Orders
              </div>
              <h3 className="text-2xl font-bold text-offwhite mb-2">
                Need 25,000+ units?
              </h3>
              <p className="text-offwhite/60 text-sm leading-relaxed max-w-xl">
                Contact our enterprise team for volume pricing, coordinated production,
                and custom supply chain solutions.
              </p>
            </div>
            <a
              href="mailto:sales@amglobalpackagingsolutions.com"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-kraft text-white font-semibold rounded-full hover:bg-kraft-light transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl whitespace-nowrap text-sm"
            >
              sales@amglobalpackagingsolutions.com
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
