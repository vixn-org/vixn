"use client";

import AdsterraBanner from "./adsterra-banner";

/**
 * AdsterraSidebars
 * Renders left and right 160x600 skyscraper banners on desktop screens (hidden on mobile/tablet).
 * Positions them dynamically on the outer edges of the main content area (assuming max-w-5xl content).
 */
export default function AdsterraSidebars() {
  return (
    <>
      {/* Left Sidebar Skyscraper (160x600) */}
      <div
        className="hidden xl:block fixed top-24 left-[40px] z-30 w-[160px] h-[600px] pointer-events-auto"
        style={{ width: "160px", height: "600px" }}
      >
        <AdsterraBanner size="160x600" label />
      </div>

      {/* Right Sidebar Skyscraper (160x600) */}
      <div
        className="hidden xl:block fixed top-24 right-[40px] z-30 w-[160px] h-[600px] pointer-events-auto"
        style={{ width: "160px", height: "600px" }}
      >
        <AdsterraBanner size="160x600" label />
      </div>
    </>
  );
}
