"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AdsterraStickyFooter from "./adsterra-sticky-footer";
import { ADSTERRA_SMARTLINK_URL } from "@/lib/smartlink";
import { ADS_ENABLED } from "@/lib/ads-config";

/**
 * Adsterra Global Ads (Max Revenue Configuration)
 * 1. Re-arms Popunder and Social Bar on every single route change.
 * 2. Smartlink Click Trigger on user interactions.
 * 3. Sticky Bottom Floating Banner (100% viewability rate).
 */
export default function AdsterraGlobal() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ADS_ENABLED) return;
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

    // 3. First-click Smartlink trigger per session/route
    let smartlinkFired = false;
    const handleGlobalClick = (e: MouseEvent) => {
      if (smartlinkFired) return;
      
      const target = e.target as HTMLElement | null;
      // Don't intercept clicks inside admin
      if (window.location.pathname.startsWith("/admin")) return;

      // Check if user clicked an interactive media, button, or link
      const clickable = target?.closest("a, button, [role='button'], video, img");
      if (clickable) {
        // If clicking on our direct smartlink already, let it handle
        const href = (clickable as HTMLAnchorElement).href;
        if (href && href.includes("profitableratecpmnetwork.com")) return;

        // Fire background smartlink
        try {
          const lastFire = sessionStorage.getItem("vixn_sl_time");
          const now = Date.now();
          // Fire at most once every 60 seconds across navigations
          if (!lastFire || now - parseInt(lastFire, 10) > 60000) {
            sessionStorage.setItem("vixn_sl_time", now.toString());
            smartlinkFired = true;
            window.open(ADSTERRA_SMARTLINK_URL, "_blank");
          }
        } catch (err) {
          // ignore storage error
        }
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
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

  if (!ADS_ENABLED || pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Sticky Bottom Floating Bar for 100% Viewability CPM */}
      <AdsterraStickyFooter />
    </>
  );
}
