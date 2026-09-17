"use client";

import { useState } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

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
    <div className="w-full pt-4 pb-2">
      {/* Icon-Only Trigger Button (Left Aligned & Compact) */}
      <div className="flex justify-start">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shadow-md cursor-pointer border-none ${
            isOpen
              ? "bg-rose-600 text-white rotate-180 shadow-rose-900/40"
              : "bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.15]"
          }`}
          title={isOpen ? "Collapse Information" : `Expand about ${modelName}`}
          aria-label={`Toggle information about ${modelName}`}
          aria-expanded={isOpen}
        >
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />
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
        <article className="w-full bg-[#121826]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border-none">
          <div className="flex items-center gap-2 pb-3 text-slate-200">
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "#f43f5e" }} />
            <h3 className="text-sm font-bold tracking-tight uppercase text-white">
              About {modelName}
            </h3>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed space-y-3.5 font-normal">
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
