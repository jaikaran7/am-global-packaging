"use client";

import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/schemas/order";
import { CheckIcon } from "@heroicons/react/24/solid";

const STEPS: OrderStatus[] = ["draft", "pending_confirmation", "confirmed", "in_production", "shipped", "delivered"];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-600">Order Cancelled</span>
      </div>
    );
  }

  if (currentStatus === "obsolete") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        <span className="text-sm font-medium text-slate-600">Order superseded by new version</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const config = ORDER_STATUS_CONFIG[step];
        const isPast = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPast
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "ring-2 ring-offset-1"
                    : "bg-gray-100 text-gray-400"
                }`}
                style={
                  isCurrent
                    ? {
                        backgroundColor: config.bgColor,
                        color: config.color,
                        borderColor: config.color,
                        boxShadow: `0 0 0 2px ${config.color}33`,
                      }
                    : undefined
                }
              >
                {isPast ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  isCurrent ? "text-[#2b2f33]" : isFuture ? "text-gray-400" : "text-emerald-600"
                }`}
              >
                {config.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mt-[-14px] ${
                  isPast ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
