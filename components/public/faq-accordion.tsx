"use client";

import { useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className={`rounded-2xl transition-all duration-300 overflow-hidden border-none ${
              isOpen
                ? "bg-white/[0.06] shadow-xl shadow-black/20"
                : "bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer border-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all border-none ${
                    isOpen
                      ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                      : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                    isOpen ? "text-white" : "text-slate-200"
                  }`}
                >
                  {item.question}
                </span>
              </div>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 border-none ${
                  isOpen
                    ? "bg-white/[0.08] rotate-180 text-rose-400"
                    : "bg-white/[0.03] text-slate-500"
                }`}
              >
                <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-none">
                <p className="mt-1 text-slate-300 leading-relaxed">{item.answer}</p>
                {item.category && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border-none">
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
                    <span>Category: {item.category}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
