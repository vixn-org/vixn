import { Metadata } from "next";
import Link from "next/link";
import { Cookie, ShieldCheck, Settings, Activity, ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "Cookie Policy & Privacy Preferences | VIXN",
  },
  description:
    "Official Cookie Policy for VIXN.fun. Learn how session cookies and CDN delivery tokens optimize 4K video playback without compromising your adult viewing privacy.",
  keywords: [
    "vixn cookie policy",
    "adult site cookies",
    "vixn tracking policy",
    "anonymous cookie settings",
  ],
  alternates: {
    canonical: `${SITE_URL}/cookies`,
  },
  openGraph: {
    title: "Cookie Policy | VIXN",
    description:
      "Transparent disclosure regarding cookies, edge CDN caching tokens, and user preferences on VIXN.fun.",
    url: `${SITE_URL}/cookies`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cookie Policy | VIXN",
    description: "Cookie policy and tracking disclosures for VIXN.fun.",
  },
};

export default function CookiePolicyPage() {
  const cookieSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy",
    url: `${SITE_URL}/cookies`,
    description:
      "Cookie policy governing session state, player settings, and CDN performance on VIXN.fun.",
    publisher: {
      "@type": "Organization",
      name: "VIXN",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cookieSchema) }}
      />

      <article className="min-h-screen bg-[#090d16] text-slate-100 pb-20 selection:bg-rose-500 selection:text-white">
        {/* Header Section */}
        <section className="border-b border-white/[0.08] bg-gradient-to-b from-[#111827] via-[#0d1322] to-[#090d16] pt-12 pb-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <Link href="/" className="hover:text-rose-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white">Cookie Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              <Cookie className="w-3.5 h-3.5" />
              <span>Transparent Data Practices &amp; Local Storage</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Cookie Policy
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Last Updated &amp; Effective Date: September 24, 2026
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* Introduction */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              What Are Cookies &amp; How VIXN Uses Them
            </h2>
            <p>
              Cookies and local storage keys are small text data files placed on
              your computer, tablet, or smartphone when you visit{" "}
              <strong>VIXN (Vixn.fun)</strong>. They enable our website to
              remember your actions, preferences, and security state over a period
              of time.
            </p>
            <p>
              Because VIXN is a <strong>100% free adult gallery</strong> without
              mandatory user registrations, our cookie footprint is kept to an
              absolute minimum. We do not use third-party tracking beacons to
              profile your personal identity or sell your adult browsing habits.
            </p>
          </div>

          {/* Categories of Cookies */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Categories of Cookies We Deploy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category 1 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  1. Strictly Necessary
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Required for site operation. These remember your 18+ adult age
                  acknowledgment, manage security tokens to prevent cross-site
                  request forgery (CSRF), and maintain session state.
                </p>
              </div>

              {/* Category 2 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  2. CDN &amp; Performance
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Used by our edge content delivery network (Cloudflare/AWS) to
                  route 4K video packets, balance network traffic across servers,
                  and guarantee buffer-free streaming speeds.
                </p>
              </div>

              {/* Category 3 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  3. User Preferences
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stored locally in your browser to remember video player volume
                  levels, playback resolution defaults (HD/4K), and theme
                  display options.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Analytics */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Anonymous Analytics
            </h2>
            <p>
              We measure general traffic statistics (such as overall page views,
              device types, and aggregate referral pathways) using privacy-friendly,
              cookieless analytics or anonymized IP hashing. We do not track which
              specific adult models, nude photo sets, or fetish categories an
              individual user explores across external websites.
            </p>
          </div>

          {/* Managing & Disabling Cookies */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              How to Control or Disable Cookies
            </h2>
            <p className="text-sm text-slate-300">
              You can control and manage cookies at any time through your browser
              settings. Most web browsers allow you to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-slate-400">
              <li>View cookies currently stored on your computer or device.</li>
              <li>Block all third-party cookies or all cookies entirely.</li>
              <li>Clear all cookies whenever you close your browser window.</li>
              <li>
                Use Incognito / Private Browsing mode so cookies are automatically
                purged at the end of each session.
              </li>
            </ul>
            <p className="text-xs text-slate-500 pt-1">
              Please note that disabling strictly necessary cookies may require
              you to re-acknowledge the 18+ age verification gate each time you
              open a new adult model video or photo gallery.
            </p>
          </div>

          {/* Cross-navigation links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span>Related Legal Documents:</span>
            <Link href="/privacy" className="text-rose-400 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-rose-400 hover:underline">
              Terms of Service
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
