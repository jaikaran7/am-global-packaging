"use client";

import { useState } from "react";

type Result = {
  weightKg: number;
  recommendedPly: "3-Ply" | "5-Ply" | "7-Ply";
  useCase: string;
};

const BOARD_TYPES = ["3-Ply", "5-Ply", "7-Ply"] as const;

function getRecommendation(gsm: number): Result {
  if (gsm <= 160) {
    return {
      weightKg: 0,
      recommendedPly: "3-Ply",
      useCase: "Lightweight products, retail, and e-commerce shipping.",
    };
  }
  if (gsm <= 240) {
    return {
      weightKg: 0,
      recommendedPly: "5-Ply",
      useCase: "Medium-weight goods and stacked shipments.",
    };
  }
  return {
    weightKg: 0,
    recommendedPly: "7-Ply",
    useCase: "Heavy-duty, export, and industrial applications.",
  };
}

export default function GsmCalculatorClient() {
  const [boardType, setBoardType] = useState<(typeof BOARD_TYPES)[number]>("3-Ply");
  const [gsm, setGsm] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const gsmValue = Number(gsm);
    const lengthValue = Number(length);
    const widthValue = Number(width);
    const heightValue = Number(height);

    if (!gsmValue || !lengthValue || !widthValue || !heightValue) {
      setResult(null);
      return;
    }

    const surfaceAreaMm2 =
      2 * (lengthValue * widthValue + lengthValue * heightValue + widthValue * heightValue);
    const surfaceAreaM2 = surfaceAreaMm2 / 1_000_000;
    const weightKg = (surfaceAreaM2 * gsmValue) / 1000;

    const recommendation = getRecommendation(gsmValue);
    setResult({
      ...recommendation,
      weightKg,
    });
  }

  return (
    <section className="relative py-20 md:py-24 bg-cream overflow-hidden">
      <div className="absolute inset-0 kraft-texture opacity-40" />
      <div className="mx-auto max-w-[1100px] px-6 md:px-12 lg:px-20 relative">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-kraft" />
            <span className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase">
              Resources
            </span>
            <div className="w-8 h-px bg-kraft" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Corrugated GSM Calculator
          </h1>
          <p className="mt-5 text-warm-gray leading-relaxed">
            Estimate paper weight and board strength for your corrugated packaging requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <form
            onSubmit={handleCalculate}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Board Type
                </label>
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value as (typeof BOARD_TYPES)[number])}
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all appearance-none"
                >
                  {BOARD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  GSM
                </label>
                <input
                  type="number"
                  min={1}
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="e.g. 180"
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 mt-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Length (mm)
                </label>
                <input
                  type="number"
                  min={1}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="L"
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Width (mm)
                </label>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="W"
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-charcoal tracking-wide">
                  Height (mm)
                </label>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="H"
                  className="px-4 py-3.5 bg-offwhite rounded-xl border border-kraft/10 text-sm text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group w-full mt-8 inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-forest text-offwhite font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 text-sm"
            >
              Calculate Estimated Board Weight
            </button>
          </form>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-kraft/5 border border-kraft/5">
            <div className="text-xs font-semibold tracking-[0.25em] text-kraft uppercase mb-4">
              Output
            </div>
            {result ? (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-xs text-warm-gray uppercase tracking-wider mb-1">
                    Approx board weight
                  </div>
                  <div className="text-2xl font-bold text-charcoal">
                    {result.weightKg.toFixed(2)} kg
                  </div>
                </div>
                <div className="h-px bg-kraft/10" />
                <div>
                  <div className="text-xs text-warm-gray uppercase tracking-wider mb-1">
                    Recommended ply type
                  </div>
                  <div className="text-lg font-semibold text-forest">
                    {result.recommendedPly}
                  </div>
                </div>
                <div className="h-px bg-kraft/10" />
                <div>
                  <div className="text-xs text-warm-gray uppercase tracking-wider mb-1">
                    Suggested use case
                  </div>
                  <div className="text-sm text-warm-gray leading-relaxed">
                    {result.useCase}
                  </div>
                </div>
                <div className="text-[11px] text-warm-gray/70">
                  Board type selected: {boardType}
                </div>
              </div>
            ) : (
              <div className="text-sm text-warm-gray">
                Enter your dimensions and GSM to estimate the board weight.
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 text-sm text-warm-gray leading-relaxed max-w-3xl">
          GSM (Grams per Square Meter) indicates the paper weight used in corrugated boards.
          A higher GSM generally means stronger liners and fluting, which improves durability,
          stacking strength, and performance in transit.
        </div>
      </div>
    </section>
  );
}
