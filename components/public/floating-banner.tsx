"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const TWO_MINUTES_MS = 2 * 60 * 1000;
const STORAGE_KEY = "vixn_banner_dismissed_until";

const getDismissedUntil = (): number => {
  try {
    const val =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
};

const setDismissedUntil = (timestamp: number) => {
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch {}
  try {
    sessionStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch {}
};

const clearDismissed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export default function FloatingBanner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check cooldown on mount and on route change
  useEffect(() => {
    setIsClient(true);
    if (pathname?.startsWith("/admin")) return;

    let reappearTimer: NodeJS.Timeout | null = null;

    try {
      const dismissedUntil = getDismissedUntil();
      const now = Date.now();

      if (dismissedUntil && now < dismissedUntil) {
        // Still within the 2-minute cooldown window
        setIsOpen(false);
        const remainingTime = dismissedUntil - now;
        reappearTimer = setTimeout(() => {
          clearDismissed();
          setIsOpen(true);
        }, remainingTime);
      } else {
        // Cooldown has expired or no previous dismissal
        clearDismissed();
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }

    return () => {
      if (reappearTimer) clearTimeout(reappearTimer);
    };
  }, [pathname]);

  // When isOpen becomes true, trigger ad provider to serve ad creative
  useEffect(() => {
    if (!isOpen || pathname?.startsWith("/admin")) return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.AdProvider = window.AdProvider || []).push({ serve: {} });
        }
      } catch (e) {
        console.error(e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    const reappearAt = Date.now() + TWO_MINUTES_MS;
    setDismissedUntil(reappearAt);

    // Schedule reappearance after 2 minutes if user remains on page
    setTimeout(() => {
      clearDismissed();
      setIsOpen(true);
    }, TWO_MINUTES_MS);
  };

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
      className="fixed bottom-2 left-1/2 -translate-x-1/2 sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 max-w-[calc(100vw-16px)] sm:max-w-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="relative bg-[#0e1424]/95 backdrop-blur-2xl p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/90 border-none ring-1 ring-white/[0.08] flex flex-col items-center">
        {/* Minimal Overlaid Control Bar - 0px extra vertical height on mobile */}
        <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between pointer-events-none">
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-slate-300 px-1.5 py-0.5 rounded shadow-sm border-none">
            Ad
          </span>

          <button
            type="button"
            onClick={handleClose}
            className="pointer-events-auto w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border-none shadow-md"
            aria-label="Close Advertisement"
            title="Close Ad"
          >
            <CloseRoundedIcon sx={{ fontSize: 13 }} />
          </button>
        </div>

        {/* ExoClick Banner Slot Element */}
        <div
          key={`${pathname}-${isOpen}`}
          className="relative w-full min-w-[280px] sm:min-w-[300px] min-h-[50px] sm:min-h-[100px] flex items-center justify-center overflow-hidden rounded-lg bg-black/40 border-none"
        >
          <ins className="eas6a97888e2" data-zoneid="6012542"></ins>

          {/* Localhost Preview placeholder */}
          {isLocalhost && (
            <div className="w-full h-[60px] sm:h-[100px] flex flex-col items-center justify-center text-center px-2 py-1 select-none">
              <span className="text-[11px] sm:text-xs font-bold text-slate-300 tracking-wide">
                Sponsored Ad (300×100)
              </span>
              <span className="text-[9px] text-slate-500">
                ExoClick #6012542 • Reappears 2m after close
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
