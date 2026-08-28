"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdsterraBanner from "./adsterra-banner";
import { X } from "lucide-react";
import { ADS_ENABLED } from "@/lib/ads-config";

/**
 * AdsterraStickyFooter
 * Fixed bottom floating banner that stays in the viewport 100% of the time as users scroll.
 * Delivers maximum viewability metrics and CPM revenue.
 */
export default function AdsterraStickyFooter() {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);

  if (!ADS_ENABLED || closed || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 shadow-2xl py-1.5 flex flex-col items-center justify-center transition-all">
      <div className="relative flex items-center justify-center w-full max-w-7xl px-2">
        <button
          onClick={() => setClosed(true)}
          className="absolute -top-3 right-2 sm:right-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full p-1 border border-slate-700 shadow-md transition-colors text-[10px] flex items-center gap-0.5 px-2"
          aria-label="Close Ad"
        >
          <span className="text-[9px] uppercase font-bold tracking-wider">Close</span>
          <X className="w-3 h-3" />
        </button>

        {/* Desktop 728x90 Banner */}
        <div className="hidden md:block">
          <AdsterraBanner size="728x90" className="my-0" />
        </div>

        {/* Tablet 468x60 Banner */}
        <div className="hidden sm:block md:hidden">
          <AdsterraBanner size="468x60" className="my-0" />
        </div>

        {/* Mobile 320x50 Banner */}
        <div className="block sm:hidden">
          <AdsterraBanner size="320x50" className="my-0" />
        </div>
      </div>
    </div>
  );
}
