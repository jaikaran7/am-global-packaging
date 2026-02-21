"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Factory, Globe, Shield, Award } from "lucide-react";

const stats = [
  { icon: Factory, label: "Production Capacity", value: "200K+ sqft", desc: "Manufacturing facility" },
  { icon: Globe, label: "Global Reach", value: "30+", desc: "Countries served" },
  { icon: Shield, label: "Quality Certified", value: "ISO 9001", desc: "Certified processes" },
  { icon: Award, label: "Industry Awards", value: "12+", desc: "Excellence awards" },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-32 bg-white overflow-hidden">
      {/* Decorative corner */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-kraft-pale/30 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-forest/[0.02] to-transparent" />

      <div ref={ref} className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative">
        {/* Section header */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-kraft" />
              <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                About Us
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
              Engineering packaging
              <br />
              <span className="text-forest">since 2009</span>
            </h2>

            <div className="mt-10 flex flex-col gap-4">
              <p className="text-warm-gray leading-relaxed">
                AM Global Packaging Solutions is a vertically integrated corrugated packaging 
                manufacturer with state-of-the-art production facilities. We combine precision 
                engineering with sustainable practices to deliver packaging that protects, 
                performs, and endures.
              </p>
              <p className="text-warm-gray leading-relaxed">
                From raw kraft paper to finished custom packaging, every step of our process 
                is optimized for quality, speed, and environmental responsibility.
              </p>
            </div>

            {/* Certifications */}
            <div className="mt-10 flex items-center gap-6 flex-wrap">
              {["ISO 9001", "FSC", "ISTA", "BRC"].map((cert) => (
                <div
                  key={cert}
                  className="px-4 py-2 bg-cream/60 border border-kraft/10 rounded-lg text-xs font-semibold text-forest tracking-wider"
                >
                  {cert}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual + Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Manufacturing visual */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest to-forest-light h-[280px] md:h-[340px] mb-8">
              <div className="absolute inset-0 corrugated-pattern opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-offwhite/60 text-xs tracking-widest uppercase mb-2">Our Facility</div>
                <div className="text-offwhite text-xl font-bold">200,000+ sq ft Production Floor</div>
                <div className="text-offwhite/70 text-sm mt-1">Automated corrugation lines with precision die-cutting</div>
              </div>
              {/* Abstract factory illustration */}
              <div className="absolute top-8 right-8 opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect x="10" y="40" width="30" height="70" rx="2" fill="white" />
                  <rect x="50" y="20" width="25" height="90" rx="2" fill="white" />
                  <rect x="85" y="55" width="25" height="55" rx="2" fill="white" />
                  <path d="M10 40L25 10L40 40" stroke="white" strokeWidth="2" />
                  <circle cx="25" cy="60" r="4" fill="white" />
                  <circle cx="62" cy="45" r="4" fill="white" />
                  <circle cx="97" cy="75" r="4" fill="white" />
                </svg>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="group p-5 bg-offwhite rounded-xl border border-transparent hover:border-kraft/15 hover:shadow-lg hover:shadow-kraft/5 transition-all duration-300"
                >
                  <stat.icon className="w-5 h-5 text-kraft mb-3" />
                  <div className="text-2xl font-bold text-charcoal">{stat.value}</div>
                  <div className="text-xs text-warm-gray mt-1">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
