"use client";

import { motion } from "framer-motion";

export function DetailBox3D({
  size,
  activeView,
}: {
  size: { length: number; width: number; height: number };
  activeView: number;
}) {
  const scale = size.length / 400;
  const w = 200 * scale + 80;
  const h = 170 * scale + 60;
  const depth = size.height * 1.5 + 30;

  const isOpen = activeView === 1;
  const isExploded = activeView === 2;

  return (
    <div
      className="relative flex items-center justify-center h-full"
      style={{ perspective: "800px" }}
    >
      <motion.div
        animate={{
          rotateX: isExploded ? -15 : -10,
          rotateY: isOpen ? -25 : -20,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="rounded-lg relative"
          style={{
            width: `${w}px`,
            height: `${h}px`,
            background:
              "linear-gradient(145deg, #C4973B 0%, #A67B1E 50%, #8B6914 100%)",
            transform: `translateZ(${depth / 2}px)`,
            boxShadow:
              "0 20px 50px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 7px)",
            }}
          />
          <div className="absolute inset-4 md:inset-6 border border-white/10 rounded flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 border border-white/15 rounded-md flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-white/60 text-[9px] tracking-[0.25em] uppercase font-medium">
              AM Global
            </div>
            <div className="w-10 h-px bg-white/15" />
            <div className="text-white/35 text-[7px] tracking-widest uppercase">
              {size.length} x {size.width} mm
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute origin-bottom"
          style={{
            width: `${w}px`,
            height: `${depth}px`,
            background: "linear-gradient(180deg, #DDB84D 0%, #C4973B 100%)",
            top: `-${depth}px`,
            left: 0,
          }}
          animate={{
            rotateX: isOpen ? 60 : 90,
            y: isExploded ? -30 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.08) 7px, rgba(0,0,0,0.08) 8px)",
            }}
          />
        </motion.div>

        <div
          className="absolute top-0 origin-left"
          style={{
            width: `${depth}px`,
            height: `${h}px`,
            background: "linear-gradient(90deg, #A67B1E 0%, #8B6914 100%)",
            left: `${w}px`,
            transform: "rotateY(90deg)",
            boxShadow: "inset 1px 0 8px rgba(0,0,0,0.12)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.06) 5px, rgba(0,0,0,0.06) 6px)",
            }}
          />
        </div>

        {isExploded && (
          <>
            {[0, 1, 2].map((layer) => (
              <motion.div
                key={layer}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 0.7, y: (layer + 1) * 18 }}
                transition={{ delay: layer * 0.1, duration: 0.6 }}
                className="absolute left-0"
                style={{
                  width: `${w}px`,
                  height: "4px",
                  bottom: `-${20 + layer * 4}px`,
                  background:
                    layer % 2 === 0
                      ? "linear-gradient(90deg, #C4973B, #A67B1E)"
                      : "linear-gradient(90deg, #DDB84D, #C4973B)",
                  borderRadius: "1px",
                  transform: `translateZ(${depth / 2}px)`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </>
        )}

        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black/10 blur-xl rounded-[50%]"
          style={{
            width: `${w * 0.7}px`,
            height: "12px",
            bottom: isExploded ? "-70px" : "-20px",
            transform: `translateX(-50%) translateZ(-${depth}px)`,
          }}
        />
      </motion.div>

      {isExploded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 border border-kraft/10 shadow-sm">
            <span className="text-[10px] font-semibold text-kraft">Liner</span>
            <div className="w-3 h-0.5 bg-kraft/30" />
            <span className="text-[10px] font-semibold text-forest">Flute</span>
            <div className="w-3 h-0.5 bg-kraft/30" />
            <span className="text-[10px] font-semibold text-kraft">Liner</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
