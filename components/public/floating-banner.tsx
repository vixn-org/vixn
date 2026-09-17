"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function FloatingBanner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (pathname?.startsWith("/admin")) return;

    // Reset visibility on navigation
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

  if (!isClient || pathname?.startsWith("/admin") || !isOpen) {
    return null;
  }

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  return (
    <aside
      aria-label="Sponsored Advertisement"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 w-[calc(100vw-24px)] max-w-[330px] sm:w-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="relative bg-[#121826]/95 backdrop-blur-2xl p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 border-none ring-1 ring-white/[0.08] flex flex-col items-center">
        {/* Top Control Bar with Sponsored Label & Integrated Close Button */}
        <div className="w-full flex items-center justify-between pb-1.5 px-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sponsored
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-sm"
            aria-label="Close Advertisement"
            title="Close Ad"
          >
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </button>
        </div>

        {/* ExoClick Banner Slot Element */}
        <div
          key={pathname}
          className="w-full min-w-[280px] sm:min-w-[300px] min-h-[100px] flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border-none"
        >
          <ins className="eas6a97888e2" data-zoneid="6012542"></ins>

          {/* Localhost Preview placeholder when real ad network doesn't serve locally */}
          {isLocalhost && (
            <div className="w-full h-[100px] flex flex-col items-center justify-center text-center p-3 select-none">
              <span className="text-xs font-bold text-slate-300 tracking-wide">
                Sponsored Ad Area (300×100)
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                ExoClick Zone #6012542
              </span>
            </div>
          )}
        </div>

        {/* ExoClick Ad Script (loaded afterInteractive) */}
        {!isLocalhost && (
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
        )}
      </div>
    </aside>
  );
}
