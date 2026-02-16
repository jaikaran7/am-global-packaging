"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const plyOptions = [
  {
    ply: 3,
    label: "3-Ply",
    subtitle: "Single Wall",
    layers: ["Liner", "Flute", "Liner"],
    colors: ["#C4973B", "#DDB84D", "#C4973B"],
    gsm: "100 - 180 GSM",
    thickness: "1.5 - 3mm",
    bct: "Up to 8 kg/cm",
    useCase: "Lightweight goods, retail, e-commerce",
    description: "Ideal for light to medium-weight products. Single flute layer provides basic cushioning and protection.",
  },
  {
    ply: 5,
    label: "5-Ply",
    subtitle: "Double Wall",
    layers: ["Liner", "Flute", "Liner", "Flute", "Liner"],
    colors: ["#C4973B", "#DDB84D", "#A67B1E", "#DDB84D", "#C4973B"],
    gsm: "120 - 250 GSM",
    thickness: "5 - 7mm",
    bct: "Up to 18 kg/cm",
    useCase: "Heavy goods, exports, stacking",
    description: "Double wall construction for enhanced strength. Excellent for export packaging and heavy-duty shipping.",
  },
  {
    ply: 7,
    label: "7-Ply",
    subtitle: "Triple Wall",
    layers: ["Liner", "Flute", "Liner", "Flute", "Liner", "Flute", "Liner"],
    colors: ["#C4973B", "#DDB84D", "#A67B1E", "#DDB84D", "#8B6914", "#DDB84D", "#C4973B"],
    gsm: "150 - 350 GSM",
    thickness: "9 - 15mm",
    bct: "Up to 30 kg/cm",
    useCase: "Industrial, automotive, machinery",
    description: "Maximum protection for heavy industrial applications. Triple wall offers exceptional burst and compression strength.",
  },
];

function PlyVisualizer({ option, isActive }: { option: typeof plyOptions[0]; isActive: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Interactive layer stack */}
      <div className="relative flex flex-col items-center">
        {option.layers.map((layer, i) => {
          const isFlute = layer === "Flute";
          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative group/layer"
            >
              {isFlute ? (
                <div className="relative w-[200px] md:w-[260px] h-[18px] overflow-hidden">
                  <svg width="100%" height="18" viewBox="0 0 260 18" preserveAspectRatio="none">
                    <path
                      d="M0,9 Q10,0 20,9 Q30,18 40,9 Q50,0 60,9 Q70,18 80,9 Q90,0 100,9 Q110,18 120,9 Q130,0 140,9 Q150,18 160,9 Q170,0 180,9 Q190,18 200,9 Q210,0 220,9 Q230,18 240,9 Q250,0 260,9"
                      fill="none"
                      stroke={option.colors[i]}
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  className="w-[200px] md:w-[260px] h-[8px] rounded-sm"
                  style={{ background: option.colors[i] }}
                />
              )}
              {/* Layer label on hover */}
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover/layer:opacity-100 transition-opacity">
                <span className="text-[10px] font-medium text-warm-gray whitespace-nowrap">
                  {layer}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-xs text-warm-gray mt-2">{option.layers.length} Layers</div>
    </div>
  );
}

export default function PlySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activePly, setActivePly] = useState(1);

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 kraft-texture opacity-50" />

      <div ref={ref} className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-kraft" />
            <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
              Ply & Specifications
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Layered for
            <span className="text-forest"> strength</span>
          </h2>
          <p className="mt-6 text-warm-gray leading-relaxed">
            Choose the right ply structure for your application. Each layer is engineered 
            to deliver specific performance characteristics.
          </p>
        </motion.div>

        {/* Ply Selector */}
        <div className="flex justify-center gap-4 mb-16">
          {plyOptions.map((option, i) => (
            <button
              key={option.ply}
              onClick={() => setActivePly(i)}
              className={`relative px-8 py-4 rounded-xl border-2 transition-all duration-300 ${
                activePly === i
                  ? "border-kraft bg-kraft-pale shadow-lg shadow-kraft/10"
                  : "border-kraft/10 bg-white hover:border-kraft/30"
              }`}
            >
              <div className={`text-2xl font-bold ${activePly === i ? "text-forest" : "text-charcoal/40"}`}>
                {option.label}
              </div>
              <div className="text-[11px] text-warm-gray mt-0.5">{option.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Active Ply Detail */}
        <motion.div
          key={activePly}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[1fr_1fr_1fr] gap-8 items-start"
        >
          {/* Left: Visual */}
          <div className="flex flex-col items-center justify-center bg-offwhite rounded-2xl p-10 min-h-[300px]">
            <PlyVisualizer option={plyOptions[activePly]} isActive={true} />
          </div>

          {/* Center: Description */}
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-charcoal">
              {plyOptions[activePly].label} — {plyOptions[activePly].subtitle}
            </h3>
            <p className="text-warm-gray leading-relaxed">
              {plyOptions[activePly].description}
            </p>
            <div className="flex items-center gap-2 text-sm text-forest font-medium">
              <div className="w-2 h-2 rounded-full bg-forest" />
              Best for: {plyOptions[activePly].useCase}
            </div>
          </div>

          {/* Right: Specs */}
          <div className="bg-forest rounded-2xl p-8 text-offwhite">
            <div className="text-xs tracking-widest uppercase text-offwhite/50 mb-6">
              Technical Specs
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-offwhite/50 text-xs uppercase tracking-wider mb-1">GSM Range</div>
                <div className="text-xl font-bold">{plyOptions[activePly].gsm}</div>
              </div>
              <div className="h-px bg-offwhite/10" />
              <div>
                <div className="text-offwhite/50 text-xs uppercase tracking-wider mb-1">Thickness</div>
                <div className="text-xl font-bold">{plyOptions[activePly].thickness}</div>
              </div>
              <div className="h-px bg-offwhite/10" />
              <div>
                <div className="text-offwhite/50 text-xs uppercase tracking-wider mb-1">
                  Box Compression
                </div>
                <div className="text-xl font-bold">{plyOptions[activePly].bct}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
