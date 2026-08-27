"use client";

import { usePathname } from "next/navigation";

interface ExoclickBannerProps {
  className?: string;
  label?: boolean;
}

/**
 * ExoClick Banner Ad Unit (Zone: 6012542)
 *
 * This component ONLY renders the <ins> tag container.
 * The actual AdProvider.push({serve:{}}) call is handled
 * exclusively by ExoclickGlobal in the root layout — ensuring
 * exactly ONE serve call per route change that scans ALL <ins>
 * tags on the page in a single DOM pass.
 */
export default function ExoclickBanner({
  className = "",
  label = false,
}: ExoclickBannerProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`my-6 flex flex-col items-center justify-center transition-all ${className}`}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Advertisement
        </span>
      )}
      <div className="w-full flex justify-center items-center">
        {/* Banner (Zone: 6012542) */}
        <ins className="eas6a97888e2" data-zoneid="6012542" />
      </div>
    </div>
  );
}
