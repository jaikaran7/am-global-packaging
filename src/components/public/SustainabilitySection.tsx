"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, Recycle, TreePine, Droplets } from "lucide-react";

const pillars = [
  {
    icon: Recycle,
    title: "Recyclable",
    desc: "Every product we manufacture is fully recyclable and biodegradable, closing the loop on packaging waste.",
  },
  {
    icon: TreePine,
    title: "FSC Certified Sources",
    desc: "Our raw materials come from responsibly managed forests, certified to Forest Stewardship Council standards.",
  },
  {
    icon: Droplets,
    title: "Water-Based Inks",
    desc: "All our printing uses eco-friendly, water-based inks free from harmful solvents and heavy metals.",
  },
  {
    icon: Leaf,
    title: "Carbon Reduction",
    desc: "40% reduction in carbon emissions since 2018 through optimized logistics and energy-efficient manufacturing.",
  },
];

export default function SustainabilitySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="sustainability"
      className="relative py-20 md:py-32 bg-offwhite overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-forest/[0.02] blur-[80px]" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-kraft/[0.03] blur-[100px]" />

      <div
        ref={ref}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12 lg:px-20 relative"
      >
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-center">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-forest via-forest-light to-forest-medium aspect-[4/5] max-h-[560px]">
              <div className="absolute inset-0 corrugated-pattern opacity-10" />

              {/* Nature-inspired layered visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Concentric circles representing sustainability */}
                  {[180, 140, 100, 60].map((size, i) => (
                    <motion.div
                      key={size}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={
                        isInView ? { scale: 1, opacity: 1 } : {}
                      }
                      transition={{
                        duration: 1,
                        delay: 0.3 + i * 0.15,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute rounded-full border"
                      style={{
                        width: size,
                        height: size,
                        top: `calc(50% - ${size / 2}px)`,
                        left: `calc(50% - ${size / 2}px)`,
                        borderColor: `rgba(212, 168, 67, ${0.1 + i * 0.08})`,
                      }}
                    />
                  ))}
                  {/* Center icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="relative w-16 h-16 rounded-full bg-kraft/20 flex items-center justify-center"
                  >
                    <Leaf className="w-7 h-7 text-kraft-light" />
                  </motion.div>
                </div>
              </div>

              {/* Bottom overlay text */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-forest via-forest/80 to-transparent pt-24">
                <div className="text-kraft-light text-xs tracking-widest uppercase mb-2">
                  Our Commitment
                </div>
                <div className="text-offwhite text-2xl font-bold leading-tight">
                  Sustainable packaging
                  <br />
                  for a better future
                </div>
              </div>
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute top-3 right-3 md:top-auto md:-bottom-6 md:-right-6 bg-white rounded-2xl shadow-md shadow-forest/10 p-3 md:p-6 border border-forest/5"
            >
              <div className="text-xl md:text-3xl font-bold text-forest">40%</div>
              <div className="text-[10px] md:text-xs text-warm-gray mt-1 leading-tight">
                Carbon reduction
                <br />
                since 2018
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col gap-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-kraft" />
                <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
                  Sustainability
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
                Responsible packaging
                <br />
                <span className="text-forest">by design</span>
              </h2>
              <p className="mt-6 text-warm-gray leading-relaxed max-w-lg">
                Sustainability is embedded in every layer of our operations. From
                sourcing certified raw materials to minimizing waste across our
                supply chain, we engineer packaging that protects both your
                products and the planet.
              </p>
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-5">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
                  className="group h-full flex flex-col p-3 md:p-5 rounded-xl bg-white border border-forest/5 hover:border-forest/15 md:hover:shadow-lg md:hover:shadow-forest/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-forest/5 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-forest/10 transition-colors">
                    <pillar.icon className="w-4 h-4 md:w-5 md:h-5 text-forest" />
                  </div>
                  <h3 className="text-[13px] md:text-sm font-bold text-charcoal mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] md:text-xs text-warm-gray leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
