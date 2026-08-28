"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Adsterra Native Banner Ad
 * Renders the native banner container + invoke script.
 */
export default function AdsterraNativeBanner({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://pl31069214.profitableratecpmnetwork.com/6354690d5333ce949bd2524b55807526/invoke.js";
    containerRef.current?.parentElement?.appendChild(script);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`my-4 flex flex-col items-center ${className}`}>
      <div
        id="container-6354690d5333ce949bd2524b55807526"
        ref={containerRef}
      />
    </div>
  );
}
