import { Metadata } from "next";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  Film,
  Sparkles,
  Heart,
  Eye,
  Smartphone,
  ChevronRight,
  Compass,
  Play,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute:
      "About VIXN | Free Hot Girl XXX Videos, Nude Photos & Adult Model Galleries",
  },
  description:
    "Discover VIXN – your 100% free destination for hot girl XXX videos, nude photos, 4K streaming clips & exclusive OnlyFans creator galleries. Explore verified model portfolios.",
  keywords: [
    "about vixn",
    "hot girl xxx videos",
    "nude photos",
    "onlyfans leaks",
    "adult model gallery",
    "free porn 4k",
    "pornstar profiles",
    "desi hot models",
    "latina big ass",
    "big tits xxx",
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About VIXN | Free Hot Girl XXX Videos & Adult Model Galleries",
    description:
      "VIXN is the internet's premier free adult model discovery hub. Watch raw 4K XXX videos, browse high-resolution nude photos, and discover top OnlyFans creators.",
    url: `${SITE_URL}/about`,
    siteName: "VIXN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "VIXN Adult Model Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About VIXN | Premium Adult Model Directory & 4K Streaming",
    description:
      "100% free adult portal featuring hot girl XXX videos, nude photo sets, and complete creator portfolios.",
    images: [`${SITE_URL}/logo.jpg`],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About VIXN",
    url: `${SITE_URL}/about`,
    description:
      "VIXN is a free adult model gallery and 4K streaming platform showcasing hot girl XXX videos, nude photo sets, and comprehensive portfolios of popular pornstars and OnlyFans creators.",
    publisher: {
      "@type": "Organization",
      name: "VIXN",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.jpg`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="min-h-screen bg-[#090d16] text-slate-100 pb-20 selection:bg-rose-500 selection:text-white">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#111827] via-[#0d1322] to-[#090d16] pt-12 pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <Link href="/" className="hover:text-rose-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white">About Us</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 shadow-lg shadow-rose-950/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>The Next Generation Adult Discovery Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              About{" "}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
                VIXN.fun
              </span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Welcome to <strong>VIXN</strong>, the internet’s ultimate free
              destination for <strong>hot girl XXX videos</strong>,{" "}
              <strong>nude photos</strong>, and exclusive high-definition
              galleries of your favorite <strong>pornstars</strong>,{" "}
              <strong>OnlyFans creators</strong>, and viral adult influencers.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/models"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-900/30 transition-all transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                <span>Explore 40+ Model Folders</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white font-bold text-sm transition-all border border-white/[0.08]"
              >
                <Play className="w-4 h-4 text-rose-400" />
                <span>Watch 4K Videos</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
          {/* Mission Statement */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400">
                <Flame className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Our Purpose: Pure Adult Entertainment Without Barriers
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Mainstream tube sites are cluttered with low-resolution mirrors,
              broken links, fake player redirects, and predatory paywalls. VIXN
              was built by adult entertainment enthusiasts to cut through the
              noise. We curate clean, verified model dossiers featuring{" "}
              <strong>uncensored nude picture sets</strong>, full{" "}
              <strong>4K sex scenes</strong>, sensual stripteases, and{" "}
              <strong>exclusive OnlyFans leaks</strong> organized into
              structured creator catalogs.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whether you are hunting for celebrated international pornstars like{" "}
              <Link
                href="/search?q=Angela+White"
                className="text-rose-400 font-bold hover:underline"
              >
                Angela White
              </Link>{" "}
              and{" "}
              <Link
                href="/search?q=Mia+Malkova"
                className="text-rose-400 font-bold hover:underline"
              >
                Mia Malkova
              </Link>
              , viral streaming bombshells like{" "}
              <Link
                href="/search?q=Alanna+Pow"
                className="text-rose-400 font-bold hover:underline"
              >
                Alanna Pow
              </Link>{" "}
              and{" "}
              <Link
                href="/search?q=Claudia+Rivier"
                className="text-rose-400 font-bold hover:underline"
              >
                Claudia Rivier
              </Link>
              , or sensational desi Indian and curvy Latina creators like{" "}
              <Link
                href="/search?q=Aditi+Mistry"
                className="text-rose-400 font-bold hover:underline"
              >
                Aditi Mistry
              </Link>
              ,{" "}
              <Link
                href="/search?q=Shilpa+Sethi"
                className="text-rose-400 font-bold hover:underline"
              >
                Shilpa Sethi
              </Link>
              , and{" "}
              <Link
                href="/model/tushikhagoswami"
                className="text-rose-400 font-bold hover:underline"
              >
                Tushikha Goswami
              </Link>
              , VIXN provides uninterrupted, instant access to the hottest girls
              on the web.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Why Fans Choose VIXN</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                Platform Standards
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3 hover:border-rose-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Ultra-Fast 4K &amp; HD CDN Streaming
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Enjoy blazing-fast playback across our global edge content
                  delivery network. All video clips are hosted across high-speed
                  media servers offering smooth 1080p and 4K resolution with zero
                  buffering, instant seeking, and full audio fidelity.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3 hover:border-rose-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Structured Creator Hubs (/model/slug)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every star has a permanent, indexed dossier. Jump into{" "}
                  <Link
                    href="/models"
                    className="text-rose-400 hover:underline font-semibold"
                  >
                    /models
                  </Link>{" "}
                  to browse creator biographies, physical stats, category tags,
                  exclusive photo sets, and their complete streaming catalog in
                  one place.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3 hover:border-rose-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  100% Free &amp; No Account Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Browse completely anonymously. No registrations, no credit card
                  submissions, no email tracking. Jump directly into full-length
                  videos, high-res nude picture sets, and leaks without creating
                  an account.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 space-y-3 hover:border-rose-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Mobile-First Touch Lightbox Galleries
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Designed from the ground up for mobile browsing. Swipe smoothly
                  through hundreds of nude photos, zoom into 4K details, and
                  enjoy full-screen responsive video players tailored for iPhone,
                  iPad, and Android devices.
                </p>
              </div>
            </div>
          </div>

          {/* Popular Categories & Niches */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-3xl p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Explore Popular Adult Categories &amp; Model Niches
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              VIXN tags and categorizes every video clip and photo shoot so you can
              quickly zero in on your specific fetish or visual preference. Browse
              top tags across the site:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {[
                { name: "OnlyFans Creator", slug: "onlyfans-creator" },
                { name: "Big Tits", slug: "big-tits" },
                { name: "Nude Photos", slug: "nude" },
                { name: "Pornstar", slug: "pornstar" },
                { name: "Adult Model", slug: "adult-model" },
                { name: "Curvy & Thick", slug: "curvy" },
                { name: "Latina XXX", slug: "latina" },
                { name: "Desi Indian Babes", slug: "desi" },
                { name: "Asian Starlets", slug: "asian" },
                { name: "Big Ass", slug: "big-ass" },
                { name: "Free Leaks", slug: "free-leaks" },
                { name: "Bikini & Glamour", slug: "bikini" },
              ].map((category) => (
                <Link
                  key={category.slug}
                  href={`/tag/${category.slug}`}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-rose-600 hover:text-white text-slate-300 text-xs font-bold transition-all border border-white/[0.06]"
                >
                  #{category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Strict 18+ Compliance Statement */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-3">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>Strict 18+ Adult Content &amp; Compliance Commitment</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              VIXN strictly publishes content featuring consenting adults aged 18
              years or older. We uphold a zero-tolerance policy against underage,
              non-consensual, or illicit imagery. All depicted performers comply
              with United States federal record-keeping regulations. For detailed
              legal terms, review our{" "}
              <Link href="/2257" className="text-rose-400 hover:underline">
                18 U.S.C. § 2257 Statement
              </Link>
              ,{" "}
              <Link href="/dmca" className="text-rose-400 hover:underline">
                DMCA Copyright Policy
              </Link>
              , and{" "}
              <Link href="/terms" className="text-rose-400 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
