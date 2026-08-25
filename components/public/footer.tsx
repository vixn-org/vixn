import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function PublicFooter() {
  return (
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
              The premier model discovery platform featuring high-definition photo galleries, exclusive videos, biographical data, and structured creator portfolios.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" /> Verified Profiles
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
                <Link href="/models" className="hover:text-rose-600 transition-colors">
                  All Models Directory
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-rose-600 transition-colors font-medium text-rose-600">
                  Blog &amp; Insights
                </Link>
              </li>
              <li>
                <Link href="/#featured-models" className="hover:text-rose-600 transition-colors">
                  Featured Creators
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600 transition-colors">
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
  );
}
