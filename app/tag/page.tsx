import { Metadata } from "next";
import Link from "next/link";
import { Home, ChevronRight, Tag } from "lucide-react";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import { getUniqueSitemapTags } from "@/lib/sitemap-tags";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

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
      { "@type": "ListItem", position: 2, name: "Tag", item: `${SITE_URL}/tag` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <HeaderSearch />
          </div>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 font-semibold">Tag</span>
        </nav>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Explore All Tags &amp; Categories
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse through {tags.length} curated tags and find exclusive photos, videos, and creator profiles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {tags.map((t) => {
            const label = capitalizeWords(unslugify(t.slug));
            return (
              <Link
                key={t.slug}
                href={`/tag/${t.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-2xs"
              >
                <Tag className="w-3 h-3 text-rose-500" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
