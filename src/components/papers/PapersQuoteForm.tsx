"use client";

import { useRef, useState, useEffect } from "react";
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

const { fields } = quoteContent.form;

export default function PapersQuoteForm() {
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [submitStatus, setSubmitStatus] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);

  const [productType, setProductType] = useState("");
  const [size, setSize] = useState("");
  const [gsm, setGsm] = useState("");

  // Pre-fill from URL params (when coming from product detail page)
  useEffect(() => {
    const typeParam = searchParams?.get("type") ?? "";
    const sizeParam = searchParams?.get("size") ?? "";
    const gsmParam = searchParams?.get("gsm") ?? "";
    if (typeParam) setProductType(typeParam);
    if (sizeParam) {
      const matched = fields.size.options.find(
        (o) => o.label.toLowerCase().includes(sizeParam.toLowerCase()) || o.value === sizeParam.toLowerCase().replace(/ /g, "")
      );
      if (matched) setSize(matched.value);
    }
    if (gsmParam) {
      const matched = fields.gsm.options.find((o) => o.value === gsmParam);
      if (matched) setGsm(matched.value);
    }
  }, [searchParams]);

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
    if (!productType) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.productTypeRequired);
      return;
    }
    if (!size) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.sizeRequired);
      return;
    }
    if (!gsm) {
      setSubmitStatus("error");
      setSubmitError(quoteContent.form.errors.gsmRequired);
      return;
    }

    const typeLabel = fields.productType.options.find((o) => o.value === productType)?.label ?? productType;
    const sizeLabel = fields.size.options.find((o) => o.value === size)?.label ?? size;
    const gsmLabel = fields.gsm.options.find((o) => o.value === gsm)?.label ?? gsm;

    const items = [
      {
        product_category: typeLabel,
        product: `${sizeLabel} — ${gsmLabel}`,
        quantity: quantity ? Number(quantity) || null : null,
        ply_preference: null,
        custom_name: null,
        custom_spec: null,
        custom_notes: requirements || null,
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
      setSubmitError(
        err instanceof Error ? err.message : quoteContent.form.errors.generic
      );
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
              {contactContent.hero.badge}
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            {contactContent.hero.heading}
            <br />
            <span className="text-forest">{contactContent.hero.headingAccent}</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">
            {contactContent.hero.description}
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
                    <h3 className="text-2xl md:text-3xl font-bold text-charcoal">
                      {quoteContent.form.success.heading}
                    </h3>
                    <p className="mt-3 text-sm md:text-base text-warm-gray">
                      {quoteContent.form.success.message}
                    </p>
                    <p className="mt-2 text-xs text-warm-gray/70">
                      {quoteContent.form.success.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitStatus("idle");
                      setSuccessVisible(false);
                      setSubmitError("");
                      setPhoneError("");
                      formRef.current?.reset();
                      setProductType("");
                      setSize("");
                      setGsm("");
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
                        <label className="text-xs font-semibold text-charcoal tracking-wide">
                          {fields.email.label} *
                        </label>
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
                        <label className="text-xs font-semibold text-charcoal tracking-wide">
                          {fields.phone.label}
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          placeholder={fields.phone.placeholder}
                          disabled={submitStatus === "loading"}
                          onBlur={(e) =>
                            setPhoneError(validatePhone(e.target.value.trim()))
                          }
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            if (!v) { setPhoneError(""); return; }
                            if (v.length >= 6 || phoneError) {
                              setPhoneError(validatePhone(v));
                            }
                          }}
                          className={`px-4 py-3.5 bg-offwhite rounded-xl border text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                            phoneError
                              ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                              : "border-kraft/10 focus:border-forest/30 focus:ring-forest/10"
                          }`}
                        />
                        {phoneError && (
                          <span className="text-xs text-red-600">{phoneError}</span>
                        )}
                      </div>
                    </div>

                    {/* Paper requirements */}
                    <div className="border-t border-kraft/10 pt-5 mb-6">
                      <div className="mb-4 text-xs font-semibold text-kraft tracking-wide uppercase">
                        {quoteContent.form.sections.paper}
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1">
                        {/* Product Type */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide">
                            {fields.productType.label} *
                          </label>
                          <select
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                          >
                            <option value="">{fields.productType.placeholder}</option>
                            {fields.productType.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Size */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide">
                            {fields.size.label} *
                          </label>
                          <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                          >
                            <option value="">{fields.size.placeholder}</option>
                            {fields.size.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* GSM */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide">
                            {fields.gsm.label} *
                          </label>
                          <select
                            value={gsm}
                            onChange={(e) => setGsm(e.target.value)}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                          >
                            <option value="">{fields.gsm.placeholder}</option>
                            {fields.gsm.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-charcoal tracking-wide">
                            {fields.quantity.label}
                          </label>
                          <input
                            name="quantity"
                            type="number"
                            min={1}
                            placeholder={fields.quantity.placeholder}
                            disabled={submitStatus === "loading"}
                            className="px-4 py-3.5 bg-white rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="flex flex-col gap-2 mb-8">
                      <label className="text-xs font-semibold text-charcoal tracking-wide">
                        {fields.requirements.label}
                      </label>
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
                      disabled={submitStatus === "loading" || Boolean(phoneError)}
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

                    <p className="text-[11px] text-warm-gray text-center mt-4">
                      {quoteContent.form.responseNote}
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
                    <div className="text-xs font-semibold text-kraft tracking-wider uppercase mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm md:text-base font-bold text-charcoal break-words">
                      {item.value}
                    </div>
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
              <h3 className="text-2xl font-bold text-offwhite mb-2">
                {contactContent.bulkBanner.heading}
              </h3>
              <p className="text-offwhite/60 text-sm leading-relaxed max-w-xl">
                {contactContent.bulkBanner.description}
              </p>
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
