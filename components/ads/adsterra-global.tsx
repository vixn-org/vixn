"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adsterra Global Ads
 * Dynamically re-injects Popunder and Social Bar on initial load AND on every SPA route transition.
 * This ensures popups and social bars re-arm and fire aggressively across all pages without being blocked by Next.js client-side routing.
 */
export default function AdsterraGlobal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return;

    // 1. Re-arm and load Adsterra Popunder on every route change
    const popunderScript = document.createElement("script");
    popunderScript.type = "text/javascript";
    popunderScript.async = true;
    popunderScript.src = `https://pl31069213.profitableratecpmnetwork.com/2b/cd/06/2bcd06a12f8327dcef06455506b26784.js?_r=${Date.now()}`;
    document.body.appendChild(popunderScript);

    // 2. Re-arm and load Adsterra Social Bar on every route change
    const socialBarScript = document.createElement("script");
    socialBarScript.type = "text/javascript";
    socialBarScript.async = true;
    socialBarScript.src = `https://pl31069216.profitableratecpmnetwork.com/80/85/8c/80858cc4a520e97cd714f4a269341566.js?_r=${Date.now()}`;
    document.body.appendChild(socialBarScript);

    return () => {
      // Clean up scripts on route unmount
      try {
        if (popunderScript.parentNode) {
          popunderScript.parentNode.removeChild(popunderScript);
        }
        if (socialBarScript.parentNode) {
          socialBarScript.parentNode.removeChild(socialBarScript);
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [pathname]);

  return null;
}
