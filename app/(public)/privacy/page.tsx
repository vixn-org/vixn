import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Database, ChevronRight, Globe } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | VIXN Adult Entertainment Platform",
  },
  description:
    "Official Privacy Policy for VIXN.fun. Learn how we safeguard user privacy, handle CDN caching, protect adult viewing habits, and adhere to GDPR & CCPA privacy standards.",
  keywords: [
    "vixn privacy policy",
    "adult website privacy",
    "gdpr adult privacy",
    "ccpa vixn",
    "anonymous adult streaming",
    "porn viewing privacy",
  ],
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | VIXN Adult Entertainment Platform",
    description:
      "Comprehensive GDPR & CCPA privacy disclosure for VIXN.fun. We never sell your adult browsing habits, identity, or viewing history.",
    url: `${SITE_URL}/privacy`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | VIXN",
    description:
      "Privacy policy covering anonymous browsing of adult galleries, nude photos, and XXX video streaming on VIXN.fun.",
  },
};

export default function PrivacyPolicyPage() {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    url: `${SITE_URL}/privacy`,
    description:
      "Official privacy policy for VIXN.fun governing the anonymous browsing of nude photos, hot girl XXX videos, and adult model streaming media.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
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
              <span className="text-white">Privacy Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>GDPR, CCPA &amp; Anonymous Browsing Compliant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Last Updated &amp; Effective Date: September 24, 2026
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* Explicit Adult Statement */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>Adult Content Platform Notice</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>VIXN (Vixn.fun)</strong> is an adult entertainment platform
              hosting sexually explicit media, including nude photos, hot girl
              XXX videos, adult model portfolios, and OnlyFans leaks. By accessing
              this site, you acknowledge that you are at least 18 years old (or
              the age of majority in your jurisdiction) and that you consent to
              viewing adult sexual content. We take the privacy of your adult
              viewing habits with the highest degree of confidentiality and
              security.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Information We Collect (Or Do Not Collect)</span>
            </h2>
            <p>
              VIXN is fundamentally engineered to be a{" "}
              <strong>free, no-registration adult site</strong>. We do not
              require you to create an account, provide your legal name, register
              your email address, or submit payment or credit card details.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">
                  Automated Technical Logs:
                </strong>{" "}
                When you stream 4K video clips or open high-res nude photo
                galleries, our servers and Content Delivery Networks (CDNs)
                automatically record technical access data, including your IP
                address, browser type, operating system, referrer URL, and
                timestamp. This is strictly required to route video data packets
                efficiently and prevent DDoS cyberattacks.
              </li>
              <li>
                <strong className="text-slate-200">
                  Aggregated Anonymous Analytics:
                </strong>{" "}
                We record non-identifiable usage statistics, such as which model
                searches (e.g.{" "}
                <Link
                  href="/search?q=Alanna+Pow"
                  className="text-rose-400 hover:underline"
                >
                  Alanna Pow
                </Link>
                ,{" "}
                <Link
                  href="/search?q=Aditi+Mistry"
                  className="text-rose-400 hover:underline"
                >
                  Aditi Mistry
                </Link>
                ) receive high engagement, to improve site speed and recommend
                trending categories.
              </li>
              <li>
                <strong className="text-slate-200">
                  Cookies &amp; Local Storage:
                </strong>{" "}
                We use small local storage identifiers to remember your video
                player volume preferences, theme layout, and age-verification
                acknowledgments. For more details, review our{" "}
                <Link
                  href="/cookies"
                  className="text-rose-400 hover:underline font-semibold"
                >
                  Cookie Policy
                </Link>
                .
              </li>
            </ul>
          </div>

          {/* 2. Absolute Non-Sale of Adult Viewing Data */}
          <div className="space-y-4 bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              <span>We Never Sell Your Adult Viewing Habits</span>
            </h2>
            <p>
              Under the California Consumer Privacy Act (CCPA) and international
              privacy laws, you have the right to know whether personal data is
              sold or shared.
            </p>
            <p className="font-semibold text-emerald-400">
              VIXN does not sell, rent, lease, or monetize your adult video
              viewing history, nude photo browsing selections, or individual IP
              addresses to data brokers or advertisers.
            </p>
            <p className="text-xs text-slate-400">
              Your intimate searches for hot girls, specific pornstars, big tits
              models, or leaked scenes remain completely private and isolated to
              your current browser session.
            </p>
          </div>

          {/* 3. Third-Party CDNs & Infrastructure */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Third-Party CDNs &amp; Cloud Infrastructure</span>
            </h2>
            <p>
              To provide instantaneous 4K and 1080p adult video streaming across
              the world, VIXN partners with enterprise cloud and content delivery
              providers. These networks temporarily cache encrypted video files
              and images at edge nodes closest to your physical location.
            </p>
            <p className="text-slate-400 text-sm">
              Third-party infrastructure providers operate under strict data
              protection agreements and are prohibited from inspecting, parsing,
              or profiling the personal identity of individuals watching adult
              media streams.
            </p>
          </div>

          {/* 4. User Rights Under GDPR and CCPA */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Your Privacy Rights (GDPR &amp; CCPA)</span>
            </h2>
            <p>
              Regardless of your geographic location, you enjoy comprehensive
              privacy protections:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-xl p-4 space-y-1.5">
                <h3 className="font-bold text-white text-sm">
                  Right to Access &amp; Portability
                </h3>
                <p className="text-xs text-slate-400">
                  Request confirmation of what technical metadata (if any) is
                  temporarily logged during your connection.
                </p>
              </div>
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-xl p-4 space-y-1.5">
                <h3 className="font-bold text-white text-sm">
                  Right to Erasure (Deletion)
                </h3>
                <p className="text-xs text-slate-400">
                  Request immediate deletion of any logged IP entries from our
                  server logs or CDN cache.
                </p>
              </div>
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-xl p-4 space-y-1.5">
                <h3 className="font-bold text-white text-sm">
                  Do Not Track &amp; Opt-Out
                </h3>
                <p className="text-xs text-slate-400">
                  We honor Global Privacy Control (GPC) and Do Not Track browser
                  signals automatically.
                </p>
              </div>
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-xl p-4 space-y-1.5">
                <h3 className="font-bold text-white text-sm">
                  Non-Discrimination
                </h3>
                <p className="text-xs text-slate-400">
                  You receive identical 100% free access to all 4K videos and
                  nude galleries regardless of your privacy choices.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Data Security & Retention */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Data Retention Schedules</span>
            </h2>
            <p>
              Standard server access logs (such as IP addresses and request
              times) are retained for a maximum of 30 days strictly for firewall
              defense, intrusion prevention, and rate-limiting. After this
              window, logs are permanently scrubbed and rotated.
            </p>
          </div>

          {/* 6. Privacy Contact */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-rose-400" />
              <span>Privacy Inquiries &amp; Data Officer Contact</span>
            </h2>
            <p className="text-sm text-slate-300">
              For any questions regarding our privacy practices, GDPR/CCPA data
              requests, or CDN server logs, you may reach our designated Data
              Protection Officer directly via email:
            </p>
            <p className="text-sm font-mono font-bold text-rose-400 pt-1">
              privacy@vixn.fun
            </p>
            <p className="text-xs text-slate-500">
              Please include "Privacy Inquiry" in the subject line. We process
              and respond to verified data requests within 30 calendar days.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
