"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { X } from "lucide-react";

export default function FloatingBanner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    // Always show banner again on URL change
    setIsOpen(true);

    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.AdProvider = window.AdProvider || []).push({ serve: {} });
        }
      } catch (e) {
        console.error(e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (pathname?.startsWith("/admin") || !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 sm:right-5 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute -top-2.5 -right-2.5 z-50 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xs font-bold shadow-md transition-all cursor-pointer border border-white/40"
          aria-label="Close Advertisement"
          title="Close Ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Ad Tag Label */}
        <div className="w-full flex justify-between items-center px-1 mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Sponsored</span>
        </div>

        {/* ExoClick Banner Element */}
        <div
          key={pathname}
          className="min-w-[250px] min-h-[100px] flex items-center justify-center overflow-hidden rounded-lg"
        >
          <ins className="eas6a97888e2" data-zoneid="6012542"></ins>
        </div>

        {/* ExoClick Ad Script */}
        <Script
          id="exoclick-floating-ad-provider"
          async
          type="application/javascript"
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
          onLoad={() => {
            try {
              // @ts-ignore
              (window.AdProvider = window.AdProvider || []).push({ serve: {} });
            } catch (e) {}
          }}
        />
      </div>
    </div>
  );
}
