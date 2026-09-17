import { Metadata } from "next";
import Link from "next/link";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";
import { getUniqueSitemapTags } from "@/lib/sitemap-tags";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";

export const dynamic = "force-dynamic";

function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const metadata: Metadata = {
  title: `Browse All Tags & Categories | ${SITE_NAME}`,
  description: `Explore trending tags, adult categories, and model collections on ${SITE_NAME}. Free 4K HD photo sets and streaming videos updated daily.`,
  alternates: {
    canonical: `${SITE_URL}/tag`,
  },
  openGraph: {
    title: `Browse All Tags & Categories | ${SITE_NAME}`,
    description: `Explore trending tags, adult categories, and model collections on ${SITE_NAME}.`,
    url: `${SITE_URL}/tag`,
    siteName: SITE_NAME,
  },
};

export default async function TagsPage() {
  const tags = await getUniqueSitemapTags();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tag",
        item: `${SITE_URL}/tag`,
      },
    ],
  };

  return (
    <PublicMuiThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        {/* Floating Top Navigation Header - Transparent with Logo */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-[#090d16]/80 backdrop-blur-xl border-none">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="VIXN"
                className="h-8 w-auto object-contain rounded-xl shadow-lg"
              />
            </Link>

            {/* Header Search Bar */}
            <div className="flex-1 max-w-lg">
              <HeaderSearch />
            </div>

            {/* Quick Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/models"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border-none"
              >
                Models
              </Link>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 border-none">
                Tags Index
              </span>
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
          {/* Breadcrumb Navigation Bar */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121826]/85 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-300 border-none overflow-x-auto whitespace-nowrap"
          >
            <Link
              href="/"
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <HomeRoundedIcon sx={{ fontSize: 15 }} />
              <span>Home</span>
            </Link>
            <ChevronRightRoundedIcon
              sx={{ fontSize: 14, color: "#64748b" }}
              className="shrink-0"
            />
            <span className="text-rose-400 font-bold">Tag Index</span>
          </nav>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border-none">
              <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
              <span>Curated Keywords &amp; Niches</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Explore All Tags &amp; Categories
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Browse through {tags.length} curated tags to discover
              high-definition photos, 4K video clips, and verified adult creator
              portfolios on {SITE_NAME}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {tags.map((t) => {
              const label = capitalizeWords(unslugify(t.slug));
              return (
                <Link
                  key={t.slug}
                  href={`/tag/${t.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-all shadow-md border-none"
                >
                  <LocalOfferRoundedIcon
                    sx={{ fontSize: 13, color: "#f43f5e" }}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </main>

        <PublicFooter />
      </div>
    </PublicMuiThemeProvider>
  );
}
