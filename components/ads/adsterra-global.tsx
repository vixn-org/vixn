"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Adsterra Global Ads — loaded on every public page via root layout.
 * Includes: Popunder + Social Bar (highest CPM formats, site-wide).
 * Excluded on /admin routes.
 */
export default function AdsterraGlobal() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Adsterra Popunder */}
      <Script
        id="adsterra-popunder"
        src="https://pl31069213.profitableratecpmnetwork.com/2b/cd/06/2bcd06a12f8327dcef06455506b26784.js"
        strategy="afterInteractive"
      />

      {/* Adsterra Social Bar */}
      <Script
        id="adsterra-social-bar"
        src="https://pl31069216.profitableratecpmnetwork.com/80/85/8c/80858cc4a520e97cd714f4a269341566.js"
        strategy="afterInteractive"
      />
    </>
  );
}
