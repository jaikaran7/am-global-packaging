"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Phone, MapPin, Mail, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/ui/select";
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

  const isCorrugatedSheets = categoryId === CORRUGATED_SHEETS_ID;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("full_name") as HTMLInputElement)?.value?.trim();
    const company_name = (form.elements.namedItem("company_name") as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() || undefined;
    const project_details = (form.elements.namedItem("project_details") as HTMLTextAreaElement)?.value?.trim() || undefined;

    if (!full_name || !email) {
      setSubmitStatus("error");
      setSubmitError("Please fill in required fields: Full Name, Email.");
      return;
    }
    if (phone && !isAustralianPhone(phone)) {
      setSubmitStatus("error");
      setSubmitError("Please enter a valid Australian phone number.");
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
        company_name: company_name || null,
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
      form.reset();
      setCategoryId("");
      setProductSlug("");
      setPlyPreference("");
      setQuantity("");
      setCustomName("");
      setCustomSpec("");
      setCustomNotes("");
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
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5">
              {submitStatus === "success" && (
                <div className="mb-6 p-4 rounded-xl bg-forest/10 border border-forest/20 flex items-center gap-3 text-forest">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Thanks, we&apos;ll contact you within 24 hours.</p>
                </div>
              )}
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
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Product Category *
                  </label>
                  <SearchableSelect
                    value={categoryId}
                    onChange={(value) => {
                      setCategoryId(value);
                      setProductSlug("");
                      setPlyPreference("");
                      setCustomName("");
                      setCustomSpec("");
                      setCustomNotes("");
                    }}
                    options={allCategories.map((cat) => ({ value: cat.id, label: cat.label }))}
                    placeholder="Select category"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Product *
                  </label>
                  <SearchableSelect
                    value={productSlug}
                    onChange={(value) => {
                      setProductSlug(value);
                      setPlyPreference("");
                      if (value !== "custom") {
                        setCustomName("");
                        setCustomSpec("");
                        setCustomNotes("");
                      }
                    }}
                    options={(isCorrugatedSheets
                      ? CORRUGATED_SHEETS_OPTIONS.map((s) => ({
                          value: s.id,
                          label: s.label,
                        }))
                      : categoryProducts.map((p) => ({
                          value: p.slug,
                          label: `${p.shortName} — ${p.dimensions}`,
                        }))
                    ).concat([{ value: "custom", label: "Custom" }])}
                    placeholder={getProductPlaceholder()}
                  />
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
                  <SearchableSelect
                    value={plyPreference}
                    onChange={(value) => setPlyPreference(value)}
                    options={plyOptions.map((ply) => ({ value: ply, label: ply }))}
                    placeholder={getPlyPlaceholder()}
                    disabled={!hasProductSelection || plyOptions.length === 0}
                  />
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
                disabled={submitStatus === "loading"}
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
            </form>
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
                  value: "+91 99XXX XXXXX",
                  sub: "Mon-Sat, 9AM - 7PM IST",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "sales@amglobalpack.com",
                  sub: "We respond within 24 hours",
                },
                {
                  icon: MapPin,
                  label: "Factory & Office",
                  value: "Industrial Area, Sector 63",
                  sub: "Noida, Uttar Pradesh, India",
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

            {/* Bulk order highlight */}
            <div className="bg-forest rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 corrugated-pattern opacity-10" />
              <div className="relative">
                <div className="text-kraft-light text-xs font-semibold tracking-widest uppercase mb-3">
                  Bulk Orders
                </div>
                <h3 className="text-xl font-bold text-offwhite mb-3">
                  Need 25,000+ units?
                </h3>
                <p className="text-offwhite/60 text-sm leading-relaxed mb-6">
                  Contact our enterprise team for volume pricing, dedicated
                  production lines, and custom supply chain solutions.
                </p>
                <a
                  href="mailto:enterprise@amglobalpack.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-kraft-light hover:text-kraft transition-colors"
                >
                  enterprise@amglobalpack.com
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative rounded-2xl overflow-hidden h-[200px] bg-gradient-to-br from-offwhite to-cream border border-kraft/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-kraft/40 mx-auto mb-2" />
                  <div className="text-xs text-warm-gray">
                    Interactive map placeholder
                  </div>
                  <div className="text-[10px] text-warm-gray/60 mt-1">
                    Noida, UP, India
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
