"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ArrowDown } from "lucide-react";

function Box3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main 3D Box */}
      <div className="relative animate-float-slow" style={{ perspective: "1200px" }}>
        <div
          className="relative w-[320px] h-[280px] md:w-[420px] md:h-[360px]"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(-8deg) rotateY(-25deg)" }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: "linear-gradient(145deg, #C4973B 0%, #A67B1E 50%, #8B6914 100%)",
              transform: "translateZ(60px)",
              boxShadow: "0 20px 60px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Corrugated texture lines */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 7px)",
            }} />
            {/* Box label area */}
            <div className="absolute inset-6 md:inset-8 border border-white/10 rounded flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-white/20 rounded-lg flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-white/70 text-[10px] md:text-xs tracking-[0.3em] font-medium uppercase">
                AM Global
              </div>
              <div className="w-16 h-px bg-white/20" />
              <div className="text-white/40 text-[8px] md:text-[10px] tracking-widest uppercase">
                Premium Packaging
              </div>
            </div>
          </div>

          {/* Top face */}
          <div
            className="absolute w-full h-[120px] md:h-[140px] origin-bottom"
            style={{
              background: "linear-gradient(180deg, #DDB84D 0%, #C4973B 100%)",
              transform: "rotateX(90deg) translateZ(0px)",
              top: "-120px",
              boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px)",
            }} />
            {/* Open flap effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
          </div>

          {/* Right face */}
          <div
            className="absolute top-0 h-full w-[120px] md:w-[140px] origin-left"
            style={{
              background: "linear-gradient(90deg, #A67B1E 0%, #8B6914 100%)",
              transform: "rotateY(90deg) translateZ(320px)",
              right: "-120px",
              boxShadow: "inset 2px 0 10px rgba(0,0,0,0.15)",
            }}
          >
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 7px)",
            }} />
          </div>

          {/* Shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-[50%] bg-black/10 blur-xl"
            style={{ transform: "translateX(-50%) translateZ(-20px)" }}
          />
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[5%] w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-kraft-light/20 to-kraft/10 border border-kraft/10 backdrop-blur-sm flex items-center justify-center"
      >
        <span className="text-[10px] font-bold text-kraft tracking-wider">3-PLY</span>
      </motion.div>
      <motion.div
        animate={{ y: [8, -8, 8], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[2%] w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-forest/10 to-forest-light/10 border border-forest/10 backdrop-blur-sm flex items-center justify-center"
      >
        <span className="text-[10px] font-bold text-forest tracking-wider">5-PLY</span>
      </motion.div>
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [0, 2, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[60%] right-[8%] w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-kraft/10 to-forest/10 border border-kraft/10 backdrop-blur-sm flex items-center justify-center"
      >
        <span className="text-[10px] font-bold text-forest tracking-wider">7-PLY</span>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-offwhite"
    >
      {/* Background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div className="absolute inset-0 kraft-texture" />
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-kraft-pale/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-offwhite to-transparent" />
      </motion.div>

      {/* Grid lines decorative */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute left-[20%] top-0 bottom-0 w-px bg-charcoal" />
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-charcoal" />
        <div className="absolute left-[60%] top-0 bottom-0 w-px bg-charcoal" />
        <div className="absolute left-[80%] top-0 bottom-0 w-px bg-charcoal" />
      </div>

      <motion.div style={{ opacity }} className="relative z-10 w-full">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 pt-28 pb-16">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-8 items-center min-h-[calc(100vh-200px)]">
            {/* Left: Content */}
            <div className="flex flex-col gap-8 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest/5 border border-forest/10 rounded-full mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-kraft animate-pulse" />
                  <span className="text-xs font-medium text-forest tracking-wide">
                    Trusted by 500+ manufacturers worldwide
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.05] tracking-tight text-charcoal">
                  Packaging{" "}
                  <span className="relative">
                    <span className="gradient-text">built</span>
                  </span>{" "}
                  for{" "}
                  <br className="hidden sm:block" />
                  global scale
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-base md:text-lg text-warm-gray leading-relaxed max-w-md"
              >
                Premium corrugated boxes and sheets engineered for strength, 
                sustainability, and seamless supply chain integration.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 mt-2"
              >
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-xl shadow-forest/20 hover:shadow-2xl hover:shadow-forest/30 text-sm"
                >
                  Request a Quote
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-charcoal font-semibold rounded-full border border-charcoal/10 hover:border-kraft/30 hover:bg-kraft-pale/50 transition-all duration-300 text-sm"
                >
                  View Products
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex items-center gap-8 mt-4 pt-8 border-t border-charcoal/5"
              >
                <div>
                  <div className="text-2xl font-bold text-charcoal">15+</div>
                  <div className="text-xs text-warm-gray mt-0.5">Years Experience</div>
                </div>
                <div className="w-px h-10 bg-charcoal/10" />
                <div>
                  <div className="text-2xl font-bold text-charcoal">50M+</div>
                  <div className="text-xs text-warm-gray mt-0.5">Boxes Delivered</div>
                </div>
                <div className="w-px h-10 bg-charcoal/10" />
                <div>
                  <div className="text-2xl font-bold text-charcoal">30+</div>
                  <div className="text-xs text-warm-gray mt-0.5">Countries</div>
                </div>
              </motion.div>
            </div>

            {/* Right: 3D Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[400px] md:h-[500px] lg:h-[600px]"
            >
              <Box3D />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium text-warm-gray tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-4 h-4 text-kraft" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
