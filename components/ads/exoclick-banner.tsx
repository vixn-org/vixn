"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface ExoclickBannerProps {
  className?: string;
  label?: boolean;
}

export default function ExoclickBanner({
  className = "",
  label = false,
}: ExoclickBannerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    try {
      if (typeof window !== "undefined") {
        window.AdProvider = window.AdProvider || [];
        window.AdProvider.push({ serve: {} });
      }
    } catch (e) {
      console.error("ExoClick banner serve error:", e);
    }
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`my-6 flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Advertisement
        </span>
      )}
      <div className="w-full flex justify-center items-center min-h-[50px] overflow-hidden">
        {/* 1. Banner (Zone: 6012542) */}
        <ins className="eas6a97888e2" data-zoneid="6012542" />
      </div>
    </div>
  );
}
