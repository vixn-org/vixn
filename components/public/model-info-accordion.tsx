"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface ModelInfoAccordionProps {
  content?: string;
  bio?: string;
  modelName: string;
}

export default function ModelInfoAccordion({
  content,
  bio,
  modelName,
}: ModelInfoAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const textToDisplay = content?.trim() || bio?.trim();
  if (!textToDisplay) return null;

  // Split content into clean paragraphs
  const paragraphs = textToDisplay
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="w-full pt-2 pb-2">
      {/* Icon-Only Trigger Button (Left Aligned & Compact) */}
      <div className="flex justify-start">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 shadow-xs cursor-pointer ${
            isOpen
              ? "bg-slate-900 text-white border-slate-900 rotate-180"
              : "bg-white text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
          title={isOpen ? "Collapse Information" : `Expand about ${modelName}`}
          aria-label={`Toggle information about ${modelName}`}
          aria-expanded={isOpen}
        >
          <ChevronDown className="w-4 h-4 transition-transform" />
        </button>
      </div>

      {/* SEO Content Container (Full Width & Always in DOM for Crawlers) */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[3000px] opacity-100 mt-4"
            : "max-h-0 opacity-0 overflow-hidden mt-0"
        }`}
      >
        <article className="w-full bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold tracking-tight uppercase">
              About {modelName}
            </h3>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed space-y-3 font-normal">
            {paragraphs.map((para, i) => (
              <p key={i} className="leading-7">
                {para}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
