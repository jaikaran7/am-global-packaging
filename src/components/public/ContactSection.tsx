"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send, Phone, MapPin, Mail, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { isAustralianPhone } from "@/lib/validation/phone";
import {
  products,
  categories,
  getCategoryProducts,
} from "@/data/products";

type ProductRow = {
  categoryId: string;
  productSlug: string;
  plyPreference: string;
  quantity: string;
  customName: string;
  customSpec: string;
  customNotes: string;
};

const defaultProductRow = (): ProductRow => ({
  categoryId: "",
  productSlug: "",
  plyPreference: "",
  quantity: "",
  customName: "",
  customSpec: "",
  customNotes: "",
});

async function submitEnquiry(payload: {
  full_name: string;
  company_name?: string | null;
  email: string;
  phone?: string;
  project_details?: string | null;
  items: Array<{
    product_category: string;
    product: string;
    quantity?: number | null;
    ply_preference?: string | null;
    custom_name?: string | null;
    custom_spec?: string | null;
    custom_notes?: string | null;
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
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [productRows, setProductRows] = useState<ProductRow[]>([defaultProductRow()]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [successVisible, setSuccessVisible] = useState<boolean>(false);
  const [expandedProductIndex, setExpandedProductIndex] = useState<number>(0);
  const [productNotice, setProductNotice] = useState<string>("");

  function setRow(index: number, field: keyof ProductRow, value: string) {
    if (productNotice) setProductNotice("");
    setProductRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }
  function addRow() {
    setProductRows((prev) => [...prev, defaultProductRow()]);
  }
  function removeRow(index: number) {
    if (productRows.length <= 1) return;
    setProductRows((prev) => prev.filter((_, i) => i !== index));
    if (isMobile) {
      setExpandedProductIndex((prev) => {
        if (index < prev) return prev - 1;
        if (index === prev) return Math.max(0, prev - 1);
        return prev;
      });
    }
  }

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 768px)");
    const setMatch = () => setIsMobile(media.matches);
    setMatch();
    media.addEventListener("change", setMatch);
    return () => media.removeEventListener("change", setMatch);
  }, []);

  useEffect(() => {
    const categoryId = searchParams?.get("categoryId") || "";
    const productSlug = searchParams?.get("productSlug") || "";
    const quantityParam = searchParams?.get("quantity") || "";
    const plyParam = searchParams?.get("ply") || "";
    if (!categoryId || !productSlug) return;
    setProductRows([
      {
        ...defaultProductRow(),
        categoryId,
        productSlug,
        quantity: quantityParam,
        plyPreference: plyParam,
      },
    ]);
    setExpandedProductIndex(0);
  }, [searchParams]);

  function isProductComplete(row: ProductRow) {
    return Boolean(row.categoryId && row.productSlug);
  }

  function getProductSummary(row: ProductRow, index: number) {
    const categoryLabel = allCategories.find((c) => c.id === row.categoryId)?.label ?? "Category";
    const isCorr = row.categoryId === CORRUGATED_SHEETS_ID;
    const product =
      !isCorr && row.productSlug
        ? products.find((p) => p.slug === row.productSlug)
        : undefined;
    const sheet = isCorr
      ? CORRUGATED_SHEETS_OPTIONS.find((s) => s.id === row.productSlug)
      : undefined;
    const productLabel =
      row.productSlug === "custom"
        ? row.customName || "Custom"
        : product?.shortName ?? sheet?.label ?? "Product";
    return `Product ${index + 1} – ${categoryLabel} – ${productLabel}`;
  }

  function handleAddRow() {
    if (!isMobile) {
      addRow();
      return;
    }
    const activeIndex = Math.min(expandedProductIndex, productRows.length - 1);
    const activeRow = productRows[activeIndex];
    if (!isProductComplete(activeRow)) {
      setProductNotice("Please complete the current product before adding another.");
      return;
    }
    const nextIndex = productRows.length;
    setProductRows((prev) => [...prev, defaultProductRow()]);
    setExpandedProductIndex(nextIndex);
  }

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
    for (let i = 0; i < productRows.length; i++) {
      const row = productRows[i];
      if (!row.categoryId || !row.productSlug) {
        setSubmitStatus("error");
        setSubmitError(`Product ${i + 1}: Please select Category and Product.`);
        return;
      }
      if (row.productSlug === "custom" && !row.customName.trim()) {
        setSubmitStatus("error");
        setSubmitError(`Product ${i + 1}: Please enter a custom product name.`);
        return;
      }
    }

    const items = productRows.map((row) => {
      const catLabel = allCategories.find((c) => c.id === row.categoryId)?.label ?? row.categoryId;
      const isCorr = row.categoryId === CORRUGATED_SHEETS_ID;
      const isCustomCat = row.categoryId === "custom";
      const prod = !isCorr && !isCustomCat ? products.find((p) => p.slug === row.productSlug) : undefined;
      const sheet = isCorr ? CORRUGATED_SHEETS_OPTIONS.find((s) => s.id === row.productSlug) : undefined;
      const productLabel = prod
        ? `${prod.shortName} — ${prod.dimensions}`
        : sheet?.label ?? (row.productSlug === "custom" ? "Custom" : row.productSlug);
      return {
        product_category: catLabel,
        product: row.productSlug === "custom" ? "Custom" : productLabel,
        quantity: row.quantity ? Number(row.quantity) || null : null,
        ply_preference: row.plyPreference || null,
        custom_name: row.productSlug === "custom" ? row.customName || null : null,
        custom_spec: row.productSlug === "custom" ? row.customSpec || null : null,
        custom_notes: row.productSlug === "custom" ? row.customNotes || null : null,
      };
    });

    setSubmitStatus("loading");
    try {
      await submitEnquiry({
        full_name,
        company_name: companyNameValue,
        email,
        phone,
        project_details: project_details || undefined,
        items,
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
      className="relative py-20 md:py-32 bg-cream overflow-hidden"
    >
      <div className="absolute inset-0 kraft-texture opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kraft/20 to-transparent" />

      <div
        ref={ref}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12 lg:px-20 relative"
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
            <div className="bg-white rounded-3xl p-5 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5 w-full max-w-[680px] mx-auto md:max-w-none">
              {submitStatus === "success" && successVisible ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8 min-h-0 md:min-h-[520px]"
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
                        setProductRows([defaultProductRow()]);
                        setExpandedProductIndex(0);
                        setProductNotice("");
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
                  <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1">
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

              <div className="mt-6 space-y-4 border-t border-kraft/10 pt-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-forest tracking-wide">
                    Products *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="text-[11px] font-medium text-kraft hover:underline"
                  >
                    + Add another product
                  </button>
                </div>
                {productNotice && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    {productNotice}
                  </div>
                )}
                {productRows.map((row, index) => {
                  const isCorrugatedSheets = row.categoryId === CORRUGATED_SHEETS_ID;
                  const isCustomCategory = row.categoryId === "custom";
                  const categoryProducts = row.categoryId && !isCorrugatedSheets ? getCategoryProducts(row.categoryId) : [];
                  const selectedProduct = row.categoryId && !isCorrugatedSheets ? products.find((p) => p.slug === row.productSlug) : undefined;
                  const selectedSheetOption = isCorrugatedSheets ? CORRUGATED_SHEETS_OPTIONS.find((s) => s.id === row.productSlug) : undefined;
                  const plyOptions = selectedProduct?.plyOptions ?? selectedSheetOption?.plyOptions ?? [];
                  const hasProductSelection = selectedProduct !== undefined || selectedSheetOption !== undefined;
                  const isExpanded = !isMobile || expandedProductIndex === index;
                  const getProductPlaceholder = () => {
                    if (row.categoryId === "") return "Select category first";
                    if (isCorrugatedSheets) return "Select sheet type";
                    return "Select product";
                  };
                  const getPlyPlaceholder = () => {
                    if (!hasProductSelection) return "Select product first";
                    if (plyOptions.length === 0) return "No ply options";
                    return "Select ply type";
                  };
                  const isCustomProduct = row.productSlug === "custom";
                  return (
                    <div key={index} className="space-y-3 rounded-2xl border border-kraft/10 bg-white/60 p-3 md:p-0 md:border-0 md:bg-transparent">
                      {isMobile && (
                        <button
                          type="button"
                          onClick={() => setExpandedProductIndex(index)}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <div className="text-[11px] font-semibold text-charcoal">
                            {isExpanded
                              ? `Product ${index + 1}`
                              : getProductSummary(row, index)}
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 text-warm-gray transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
                          />
                        </button>
                      )}
                      <div
                        className={`transition-[max-height,opacity] duration-300 ease-out ${isExpanded ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0 overflow-hidden"}`}
                      >
                      {productRows.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove product
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide mb-1">Product Category *</label>
                          <select
                            value={row.categoryId}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRow(index, "categoryId", value);
                              setRow(index, "productSlug", value === "custom" ? "custom" : "");
                              setRow(index, "plyPreference", "");
                              setRow(index, "customName", "");
                              setRow(index, "customSpec", "");
                              setRow(index, "customNotes", "");
                            }}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                          >
                            <option value="">Select category</option>
                            <option value="custom">Custom</option>
                            {allCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide mb-1">Product *</label>
                          <select
                            value={row.productSlug}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRow(index, "productSlug", value);
                              setRow(index, "plyPreference", "");
                              if (value !== "custom") {
                                setRow(index, "customName", "");
                                setRow(index, "customSpec", "");
                                setRow(index, "customNotes", "");
                              }
                            }}
                            disabled={isCustomCategory}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60"
                          >
                            <option value="">{getProductPlaceholder()}</option>
                            {!isCustomCategory && (
                              <>
                                {(isCorrugatedSheets
                                  ? CORRUGATED_SHEETS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))
                                  : categoryProducts.map((p) => ({ value: p.slug, label: `${p.shortName} — ${p.dimensions}` }))
                                ).map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                                <option value="custom">Custom</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1 mt-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide mb-1">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="e.g. 5000"
                            value={row.quantity}
                            onChange={(e) => setRow(index, "quantity", e.target.value)}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide mb-1">Ply Preference</label>
                          <select
                            value={row.plyPreference}
                            onChange={(e) => setRow(index, "plyPreference", e.target.value)}
                            disabled={!hasProductSelection || plyOptions.length === 0}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none disabled:opacity-60"
                          >
                            <option value="">{getPlyPlaceholder()}</option>
                            {plyOptions.map((ply) => (
                              <option key={ply} value={ply}>{ply}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {isCustomProduct && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">Custom Product Name *</label>
                            <input
                              type="text"
                              value={row.customName}
                              onChange={(e) => setRow(index, "customName", e.target.value)}
                              placeholder="Enter custom product"
                              className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">Custom Spec</label>
                            <input
                              type="text"
                              value={row.customSpec}
                              onChange={(e) => setRow(index, "customSpec", e.target.value)}
                              placeholder="Size/spec"
                              className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-2 max-[380px]:col-span-2">
                            <label className="text-xs font-semibold text-charcoal tracking-wide">Custom Notes</label>
                            <input
                              type="text"
                              value={row.customNotes}
                              onChange={(e) => setRow(index, "customNotes", e.target.value)}
                              placeholder="Optional notes"
                              className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                            />
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>

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
                  className="group flex items-start gap-4 md:gap-5 p-4 md:p-6 bg-white rounded-2xl border border-kraft/5 hover:border-kraft/15 hover:shadow-lg hover:shadow-kraft/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/5 flex items-center justify-center flex-shrink-0 group-hover:bg-forest/10 transition-colors">
                    <item.icon className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-kraft tracking-wider uppercase mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm md:text-base font-bold text-charcoal break-words">
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
              <div className="relative rounded-xl overflow-hidden h-[200px] md:h-[210px] bg-gradient-to-br from-offwhite to-cream border border-kraft/20 ring-1 ring-kraft/10">
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
          className="mt-8 md:mt-16 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-forest to-forest-light relative overflow-hidden"
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
