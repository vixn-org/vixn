import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import SearchTag from "@/lib/models/search-tag";
import { searchVideos, type SearchVideoItem } from "@/lib/search";
import { formatSeoTitle, formatSeoDescription } from "@/lib/seo";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "VIXN";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export const revalidate = 60; // Revalidate every 60s for fresh search cache

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawQ = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10));

  let customTitle = "";
  let customDescription = "";

  if (rawQ) {
    try {
      await connectDB();
      const slugKey = rawQ.toLowerCase().replace(/[\s_]+/g, "-");
      const tagDoc = await SearchTag.findOne({
        $or: [{ slug: slugKey }, { tag: new RegExp(`^${rawQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }],
      }).lean();

      if (tagDoc) {
        if (tagDoc.customTitle) customTitle = tagDoc.customTitle;
        if (tagDoc.customDescription) customDescription = tagDoc.customDescription;
      }
    } catch (err) {
      console.error("SEO search tag lookup error:", err);
    }
  }

  const baseTitle = customTitle
    ? customTitle
    : rawQ
    ? `${rawQ} 4K Videos & Clips`
    : "Explore All 4K Videos & Streaming Clips";

  const title = formatSeoTitle(baseTitle);

  const fallbackDesc = rawQ
    ? `Watch uncensored 4K streaming clips and 1080p HD videos for ${rawQ} on ${SITE_NAME}. Stream full videos, picture sets, and daily creator updates.`
    : `Explore high-definition 4K streaming video clips and full model scenes on ${SITE_NAME}. Watch online for free with daily updates.`;

  const description = formatSeoDescription(customDescription, fallbackDesc);

  const pageQuery = page > 1 ? `&page=${page}` : "";
  const canonicalUrl = rawQ
    ? `${SITE_URL}/search?q=${encodeURIComponent(rawQ)}${pageQuery}`
    : `${SITE_URL}/search${page > 1 ? `?page=${page}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/logo.jpg`,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} Video Search`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/logo.jpg`],
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawQ = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10));

  // Perform search (limit 32 = 8 rows of 4 columns)
  const result = await searchVideos(rawQ, page, 32);
  const { videos, totalPages, totalMatches, hasMatches, relatedTags } = result;

  // Split into direct matches and fallback padding if both exist on this page
  const directMatches = videos.filter((v) => !v.isFallback);
  const fallbackVideos = videos.filter((v) => v.isFallback);

  // Generate ItemList JSON-LD Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: item.title,
        description: item.alt,
        thumbnailUrl: item.thumbnail || `${SITE_URL}/logo.jpg`,
        uploadDate: new Date().toISOString(),
        contentUrl: `${SITE_URL}/model/${item.model.slug}/video/${item.videoSlug}`,
      },
    })),
  };

  const breadcrumbElements: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: SITE_NAME || "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Search",
      item: `${SITE_URL}/search`,
    },
  ];

  if (rawQ) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: rawQ,
      item: `${SITE_URL}/search?q=${encodeURIComponent(rawQ)}`,
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  const renderVideoCard = (video: SearchVideoItem, index: number) => {
    const videoHref = `/model/${video.model.slug}/video/${video.videoSlug}`;

    return (
      <div
        key={`${video.id}-${index}`}
        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
      >
        {/* Video Thumbnail Card */}
        <div className="relative aspect-video rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.alt || video.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500">
              <VideocamRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} />
            </div>
          )}

          {/* Hover Play Button Overlay */}
          <Link
            href={videoHref}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            aria-label={`Play ${video.title}`}
          >
            <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-transform">
              <PlayArrowRoundedIcon sx={{ fontSize: 32 }} />
            </div>
          </Link>
        </div>

        {/* Video Info Below Thumbnail */}
        <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
          <div>
            <Link href={videoHref} className="block">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                {video.title}
              </h3>
            </Link>

            {/* Model Attribution */}
            <div className="mt-1.5 flex items-center gap-2">
              <Link
                href={`/model/${video.model.slug}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group/model"
              >
                {video.model.profileImage && (
                  <img
                    src={video.model.profileImage}
                    alt={video.model.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white/10"
                  />
                )}
                <span className="font-semibold truncate max-w-[140px]">
                  {video.model.name}
                </span>
              </Link>
              {video.model.category && (
                <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04]">
                  {video.model.category}
                </span>
              )}
            </div>
          </div>

          {/* Quality Badge & Play Link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 bg-transparent border-none">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <HighQualityRoundedIcon sx={{ fontSize: 15, color: "#f43f5e" }} />
              HD 1080p / 4K
            </span>
            <Link
              href={videoHref}
              className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
            >
              <span>Play Now</span>
              <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const buildPageUrl = (targetPage: number) => {
    const qParam = rawQ ? `q=${encodeURIComponent(rawQ)}` : "";
    const pageParam = targetPage > 1 ? `page=${targetPage}` : "";
    const queryParts = [qParam, pageParam].filter(Boolean).join("&");
    return `/search${queryParts ? `?${queryParts}` : ""}`;
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#090d16] text-slate-100 pb-16">
        {/* Top Breadcrumb & Search Header */}
        <section className="border-b border-white/[0.06] bg-[#0c1220]/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <Link
                href="/"
                className="hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <HomeRoundedIcon sx={{ fontSize: 15 }} />
                <span>Home</span>
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 13, color: "#64748b" }} />
              <Link
                href="/search"
                className="hover:text-rose-400 transition-colors"
              >
                Search
              </Link>
              {rawQ && (
                <>
                  <ChevronRightRoundedIcon sx={{ fontSize: 13, color: "#64748b" }} />
                  <span className="text-white truncate max-w-xs">{rawQ}</span>
                </>
              )}
            </nav>

            {/* Search Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-600/15 text-rose-400">
                    <VideocamRoundedIcon sx={{ fontSize: 24 }} />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                    {rawQ ? (
                      <>
                        Videos for <span className="text-rose-400">"{rawQ}"</span>
                      </>
                    ) : (
                      "All 4K Videos & Creator Clips"
                    )}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 pl-1">
                  {rawQ ? (
                    hasMatches ? (
                      <>
                        Found <strong className="text-slate-200">{totalMatches}</strong> matching{" "}
                        {totalMatches === 1 ? "video" : "videos"} on VIXN. Displaying 32 videos per page in 4K resolution.
                      </>
                    ) : (
                      <>
                        Explore top 4K creator videos, streaming clips, and trending scenes for <strong className="text-rose-400">"{rawQ}"</strong> on VIXN.
                      </>
                    )
                  ) : (
                    "Explore thousands of ultra-high definition creator videos, scenes, and exclusive 4K clips."
                  )}
                </p>
              </div>

              {/* Tag / Quality Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-slate-300 text-xs font-bold inline-flex items-center gap-1.5">
                  <WhatshotRoundedIcon sx={{ fontSize: 15, color: "#f43f5e" }} />
                  <span>Page {page} of {totalPages}</span>
                </span>
              </div>
            </div>

            {/* Popular Search Suggestions / Tags */}
            {relatedTags && relatedTags.length > 0 && (
              <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-xs font-semibold text-slate-400 shrink-0 inline-flex items-center gap-1">
                  <LocalOfferRoundedIcon sx={{ fontSize: 13, color: "#818cf8" }} />
                  <span>Popular:</span>
                </span>
                {relatedTags.map((tagItem) => (
                  <Link
                    key={tagItem.slug}
                    href={`/search?q=${encodeURIComponent(tagItem.tag)}`}
                    className={`text-xs px-3 py-1 rounded-full shrink-0 transition-all font-medium ${
                      rawQ.toLowerCase() === tagItem.tag.toLowerCase()
                        ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                        : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white"
                    }`}
                  >
                    {tagItem.tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Video Section */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Direct Matches Section */}
          {directMatches.length > 0 && (
            <div className="space-y-6">
              {rawQ && fallbackVideos.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>Matched Results ({directMatches.length})</span>
                </div>
              )}

              {/* 8 Rows of 4 Columns (32 videos per page) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {directMatches.map((video, idx) => renderVideoCard(video, idx))}
              </div>
            </div>
          )}

          {/* Fallback / Trending Suggestions (when padded or no matches) */}
          {fallbackVideos.length > 0 && (
            <div className="space-y-6 pt-4">
              {directMatches.length > 0 ? (
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                  <WhatshotRoundedIcon sx={{ fontSize: 20, color: "#f43f5e" }} />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      More Trending 4K Videos You May Like
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore featured video clips from other top models on VIXN.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <WhatshotRoundedIcon sx={{ fontSize: 20, color: "#f43f5e" }} />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Top Trending 4K Creator Videos
                    </h2>
                    <p className="text-xs text-slate-400">
                      Browse top trending streams and high-resolution clips from our creator library.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid for Fallback Videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {fallbackVideos.map((video, idx) =>
                  renderVideoCard(video, directMatches.length + idx)
                )}
              </div>
            </div>
          )}

          {/* Backend Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination Navigation"
              className="pt-10 pb-6 flex items-center justify-center gap-2 sm:gap-3"
            >
              {/* Previous Page Button */}
              {page > 1 ? (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1 shadow-md border-none"
                >
                  <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.02] text-slate-600 inline-flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Previous</span>
                </span>
              )}

              {/* Page Number Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-xs sm:max-w-md px-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (page <= 4) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = page - 3 + i;
                  }

                  const isActive = pageNumber === page;

                  return (
                    <Link
                      key={pageNumber}
                      href={buildPageUrl(pageNumber)}
                      className={`min-w-[36px] h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                          : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </div>

              {/* Next Page Button */}
              {page < totalPages ? (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1 shadow-md border-none"
                >
                  <span>Next</span>
                  <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.02] text-slate-600 inline-flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                </span>
              )}
            </nav>
          )}
        </main>
      </div>
    </>
  );
}
