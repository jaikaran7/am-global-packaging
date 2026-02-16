"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Phone, MapPin, Mail, ChevronRight } from "lucide-react";

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your Company"
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 99XXX XXXXX"
                    className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Product Interest
                </label>
                <select className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none">
                  <option>Select product type</option>
                  <option>Corrugated Boxes</option>
                  <option>Corrugated Sheets</option>
                  <option>Custom Packaging</option>
                  <option>Bulk / Industrial Order</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Estimated Quantity
                  </label>
                  <select className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none">
                    <option>Select quantity range</option>
                    <option>500 - 1,000 units</option>
                    <option>1,000 - 5,000 units</option>
                    <option>5,000 - 25,000 units</option>
                    <option>25,000+ units</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-charcoal tracking-wide">
                    Ply Preference
                  </label>
                  <select className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none">
                    <option>Select ply type</option>
                    <option>3-Ply (Single Wall)</option>
                    <option>5-Ply (Double Wall)</option>
                    <option>7-Ply (Triple Wall)</option>
                    <option>Not sure / Need advice</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Project Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your packaging requirements, dimensions, special features..."
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all resize-none"
                />
              </div>

              <button className="group w-full mt-8 inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 text-sm">
                <Send className="w-4 h-4" />
                Submit Quote Request
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-[11px] text-warm-gray text-center mt-4">
                We respond to all inquiries within 24 hours during business days.
              </p>
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
