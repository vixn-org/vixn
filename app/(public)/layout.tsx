import Link from "next/link";
import { Sparkles, ShieldCheck, Flame, Compass } from "lucide-react";
import HeaderSearch from "@/components/public/header-search";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Notification / Trust Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>High-Resolution 4K &amp; HD Media</span>
        </span>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center group shrink-0"
          >
            <img
              src="/logo.jpg"
              alt="VIXN.fun"
              className="h-8 sm:h-9 w-auto object-contain rounded-md group-hover:opacity-95 transition-opacity"
            />
          </Link>

          {/* Robust Live Search Bar */}
          <div className="flex-1 flex justify-center max-w-md">
            <HeaderSearch />
          </div>

          {/* Single Explore Models Tab */}
          <div className="flex items-center shrink-0">
            <Link
              href="/#all-models"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Compass className="w-4 h-4 text-rose-500" />
              <span>Explore Models</span>
            </Link>
          </div>
        </nav>
        {/* Soft fade transition to content below */}
        <div className="h-6 w-full bg-gradient-to-b from-white/80 to-transparent pointer-events-none -mb-6" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* SEO-Optimized Luxury Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200">
            <div className="space-y-3 md:col-span-2">
              <div>
                <img
                  src="/logo.jpg"
                  alt="VIXN.fun"
                  className="h-8 w-auto object-contain rounded-md"
                />
              </div>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                The premier verified model discovery platform featuring high-definition photo galleries, exclusive videos, biographical data, and structured creator portfolios.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="w-4 h-4" /> 100% Verified Profiles
                </span>
                <span>•</span>
                <span>Fast CDN Delivery</span>
                <span>•</span>
                <span>SEO Optimized</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/" className="hover:text-rose-600 transition-colors">
                    Explore Models
                  </Link>
                </li>
                <li>
                  <Link href="/#featured-models" className="hover:text-rose-600 transition-colors">
                    Featured Creators
                  </Link>
                </li>
                <li>
                  <Link href="/#faq-section" className="hover:text-rose-600 transition-colors">
                    Platform FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Discovery &amp; SEO
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/sitemap.xml" className="hover:text-rose-600 transition-colors">
                    XML Sitemap
                  </Link>
                </li>
                <li>
                  <Link href="/robots.txt" className="hover:text-rose-600 transition-colors">
                    Robots.txt Directives
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} VIXN.fun. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Privacy Protected</span>
              <span>•</span>
              <span>High Speed Global Delivery</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
