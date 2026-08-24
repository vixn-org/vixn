"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

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
            className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
              isOpen
                ? "border-slate-300 shadow-md ring-1 ring-slate-200/60"
                : "border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs"
            }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                    isOpen
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                    isOpen ? "text-slate-950" : "text-slate-800"
                  }`}
                >
                  {item.question}
                </span>
              </div>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                  isOpen
                    ? "bg-slate-100 rotate-180 text-rose-600"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                <p className="mt-2 text-slate-600">{item.answer}</p>
                {item.category && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                    <Sparkles className="w-3 h-3" />
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
