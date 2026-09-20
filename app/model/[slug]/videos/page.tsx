import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateModelVideosMetadata,
  generateModelVideosJsonLd,
  getMediaSlug,
  slugify,
} from "@/lib/seo";
import HeaderSearch from "@/components/public/header-search";
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";
import PublicFooter from "@/components/public/footer";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
      status: "published",
    }).lean();

    if (!model) return { title: { absolute: "Videos Not Found | VIXN" } };

    return generateModelVideosMetadata(model);
  } catch {
    return { title: { absolute: `${slug} Videos | VIXN` } };
  }
}

export default async function ModelVideosPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const model = await Model.findOne({
    slug: { $regex: new RegExp(`^${slug}$`, "i") },
    status: "published",
  }).lean();

  if (!model) {
    notFound();
  }

  const allMedia = model.media || [];
  const photos = allMedia.filter((m: any) => m.type === "photo");
  const videos = allMedia.filter((m: any) => m.type === "video");

  const relatedModels = await Model.find({
    _id: { $ne: model._id },
    status: "published",
  })
    .limit(4)
    .select("name slug profileImage coverImage category media")
    .lean();

  // Aggregate all video-related tags and keywords (deduplicated)
  const tagMap = new Map<string, string>();
  if (model.name) tagMap.set(slugify(model.name), model.name);
  (model.tags || []).forEach((t: string) => {
    if (t && typeof t === "string") {
      const s = slugify(t);
      if (s && !tagMap.has(s)) tagMap.set(s, t.trim());
    }
  });
  (model.videosSeo?.metaKeywords || []).forEach((kw: string) => {
    if (kw && typeof kw === "string") {
      const s = slugify(kw);
      if (s && !tagMap.has(s)) tagMap.set(s, kw.trim());
    }
  });
  (model.metaKeywords || []).forEach((kw: string) => {
    if (kw && typeof kw === "string") {
      const s = slugify(kw);
      if (s && !tagMap.has(s)) tagMap.set(s, kw.trim());
    }
  });
  videos.forEach((v: any) => {
    const kws = Array.isArray(v.keywords)
      ? v.keywords
      : typeof v.keywords === "string"
      ? v.keywords.split(",")
      : [];
    kws.forEach((kw: string) => {
      if (kw && typeof kw === "string") {
        const s = slugify(kw);
        if (s && !tagMap.has(s)) tagMap.set(s, kw.trim());
      }
    });
  });
  if (model.category) {
    const s = slugify(model.category);
    if (s && !tagMap.has(s)) tagMap.set(s, model.category.trim());
  }
  const allVideoTags = Array.from(tagMap.entries()).map(([slug, label]) => ({
    slug,
    label,
  }));

  const { videoCollectionSchema, breadcrumbSchema } =
    generateModelVideosJsonLd(model);

  const pageHeading =
    model.videosSeo?.heading || `${model.name} Video Showcase & 4K Clips`;

  return (
    <PublicMuiThemeProvider>
      <article
        itemScope
        itemType="https://schema.org/CollectionPage"
        className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col"
      >
        {/* Floating Top Navigation Header - Transparent with Logo */}
        <header className="absolute top-0 left-0 right-0 z-40 bg-transparent border-none">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="VIXN"
                className="h-8 sm:h-9 w-auto object-contain rounded-xl shadow-lg"
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
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors shadow-md border-none"
              >
                Models
              </Link>
              <Link
                href={`/model/${model.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors shadow-md border-none"
              >
                {model.name}
              </Link>
              {photos.length > 0 && (
                <Link
                  href={`/model/${model.slug}/photos`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors shadow-md border-none"
                >
                  Photos ({photos.length})
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoCollectionSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <main className="flex-1">
          {/* Cinematic Cover Banner with Vignette */}
          <div className="relative w-full h-64 sm:h-72 md:h-80 bg-[#07090f] overflow-hidden">
            {model.coverImage ? (
              <img
                src={model.coverImage}
                alt={`${model.name} official cover banner`}
                className="w-full h-full object-cover opacity-85 scale-100 transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            ) : model.profileImage ? (
              <img
                src={model.profileImage}
                alt={`${model.name} cover`}
                className="w-full h-full object-cover blur-md scale-110 opacity-40"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#090d16] via-rose-950/40 to-[#090d16]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/65 to-transparent" />
          </div>

          {/* Main Content Article Container - Elevated to Top */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 md:-mt-56 relative z-10 space-y-8">
            {/* Breadcrumb Navigation - Floating Glass Pill */}
            <nav
              aria-label="Breadcrumb"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121826]/85 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-300 border-none"
            >
              <Link
                href="/"
                className="hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <HomeRoundedIcon sx={{ fontSize: 15 }} />
                <span>Home</span>
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
              <Link
                href="/models"
                className="hover:text-rose-400 transition-colors"
              >
                Models
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
              <Link
                href={`/model/${model.slug}`}
                className="hover:text-rose-400 transition-colors"
              >
                {model.name}
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
              <span className="text-white font-bold">Videos</span>
            </nav>

            {/* Model Videos Hero Header Card - Elevated Borderless Luxury Card */}
            <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md shadow-2xl p-6 sm:p-8 border-none">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <Link href={`/model/${model.slug}`} className="relative shrink-0 group">
                    <img
                      src={model.profileImage || "/logo.jpg"}
                      alt={model.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover shadow-xl ring-4 ring-white/[0.08] group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1.5 rounded-full shadow-lg flex items-center justify-center ring-4 ring-[#121826]">
                      <VideocamRoundedIcon sx={{ fontSize: 16 }} />
                    </div>
                  </Link>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/model/${model.slug}`}
                        className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                      >
                        {model.name}
                      </Link>
                      {model.category && (
                        <span className="px-3 py-0.5 rounded-full bg-white/[0.08] text-slate-200 text-[10px] font-bold uppercase tracking-wider border-none">
                          {model.category}
                        </span>
                      )}
                      <span className="px-3 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-bold border-none">
                        {videos.length} 4K Videos
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                      {pageHeading}
                    </h1>
                  </div>
                </div>

                {/* Quick Action Button to Full Profile */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/model/${model.slug}`}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-2 shadow-md border-none"
                  >
                    <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                    <span>Full Profile</span>
                  </Link>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 mt-6 pt-2 border-none overflow-x-auto no-scrollbar">
                <Link
                  href={`/model/${model.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shrink-0 border-none"
                >
                  Overview
                </Link>
                {photos.length > 0 && (
                  <Link
                    href={`/model/${model.slug}/photos`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 shrink-0 border-none"
                  >
                    <PhotoCameraRoundedIcon sx={{ fontSize: 15, color: "#818cf8" }} />
                    <span>Photos ({photos.length})</span>
                  </Link>
                )}
                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-lg shadow-rose-900/40 flex items-center gap-1.5 shrink-0 border-none">
                  <VideocamRoundedIcon sx={{ fontSize: 15 }} />
                  <span>Videos ({videos.length})</span>
                </span>
              </div>
            </div>

            {/* Video Showcase Grid */}
            {videos.length === 0 ? (
              <div className="text-center py-20 bg-[#121826]/70 backdrop-blur-xl rounded-md space-y-4 border-none">
                <MovieRoundedIcon sx={{ fontSize: 44, color: "#475569" }} className="mx-auto" />
                <h3 className="text-base font-bold text-slate-200">
                  No videos published yet for this creator
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Check back soon for upcoming high-definition video clips and stream releases.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                    <span>All Video Clips &amp; Streams</span>
                    <span className="text-xs font-bold text-rose-300 bg-rose-500/15 px-3 py-1 rounded-full border-none">
                      {videos.length}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {videos.map((video: any, index: number) => {
                    const videoSlug = getMediaSlug(video, "video", index);
                    const videoTitle =
                      video.title || `${model.name} Video #${index + 1}`;
                    const posterSrc =
                      video.thumbnail || model.coverImage || model.profileImage || "";

                    return (
                      <div
                        key={video._id || index}
                        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
                      >
                        {/* Video Player Card */}
                        <div className="relative aspect-video rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300">
                          {posterSrc ? (
                            <img
                              src={posterSrc}
                              alt={video.alt || videoTitle}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500">
                              <VideocamRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} />
                            </div>
                          )}

                          {/* Play Overlay CTA - visible only on hover */}
                          <Link
                            href={`/model/${model.slug}/video/${videoSlug}`}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          >
                            <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-transform">
                              <PlayArrowRoundedIcon sx={{ fontSize: 32 }} />
                            </div>
                          </Link>
                        </div>

                        {/* Video Info Below Thumbnail - Completely Transparent */}
                        <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
                          <div>
                            <Link href={`/model/${model.slug}/video/${videoSlug}`} className="block">
                              <h3 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                                {videoTitle}
                              </h3>
                            </Link>
                            {video.alt && (
                              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                {video.alt}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 bg-transparent border-none">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <HighQualityRoundedIcon sx={{ fontSize: 15, color: "#f43f5e" }} />
                              HD 1080p / 4K
                            </span>
                            <Link
                              href={`/model/${model.slug}/video/${videoSlug}`}
                              className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
                            >
                              <span>Play Now</span>
                              <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cross-Link Banner to Photos Hub */}
            {photos.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-950/60 via-[#161e36] to-purple-950/60 backdrop-blur-xl rounded-md p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-none">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
                    HD Photo Gallery
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Browse All {photos.length} Photos of {model.name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Explore high-resolution photoshoot albums, full-size picture sets, and behind-the-scenes gallery previews.
                  </p>
                </div>
                <Link
                  href={`/model/${model.slug}/photos`}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg shrink-0 transition-colors border-none"
                >
                  Go to Photos Hub →
                </Link>
              </div>
            )}

            {/* Optional SEO Content Accordion */}
            {model.videosSeo?.introText && (
              <details className="group bg-[#121826]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-none transition-all [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none gap-4">
                  <span className="text-white font-bold text-sm">
                    About This Video Collection
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center group-open:rotate-180 transition-transform duration-200">
                    <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                    {model.videosSeo.introText}
                  </p>
                </div>
              </details>
            )}

            {/* Related Models - Cinematic Video Creator Showcase */}
            {relatedModels.length > 0 && (
              <div className="pt-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                        <WhatshotRoundedIcon sx={{ fontSize: 20 }} />
                      </div>
                      <span>Explore More Video Creators</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Discover trending models, exclusive video portfolios, and 4K stream channels
                    </p>
                  </div>
                  <Link
                    href="/models"
                    className="px-4 py-2 rounded-2xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
                  >
                    <span>View All Models</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {relatedModels.map((m: any) => {
                    const mPhotoCount = (m.media || []).filter((x: any) => x.type === "photo").length;
                    const mVideoCount = (m.media || []).filter((x: any) => x.type === "video").length;
                    const imageSrc = m.profileImage || m.coverImage || "/logo.jpg";
                    return (
                      <div
                        key={m._id.toString()}
                        className="group bg-transparent flex flex-col border-none"
                      >
                        {/* Creator Image Card */}
                        <div className="relative aspect-3/4 w-full bg-[#182238] rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-500 block">
                          <Link href={`/model/${m.slug}/videos`} className="block w-full h-full">
                            <img
                              src={imageSrc}
                              alt={m.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              loading="lazy"
                            />
                            {/* Deep luxury gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-black/30 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-10">
                              {m.category ? (
                                <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-300 px-2.5 py-1 rounded-full shadow-md truncate max-w-[110px]">
                                  {m.category}
                                </span>
                              ) : (
                                <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-300 px-2.5 py-1 rounded-full shadow-md">
                                  Creator
                                </span>
                              )}
                              <span className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shrink-0">
                                <VideocamRoundedIcon sx={{ fontSize: 13 }} />
                                <span>{mVideoCount}</span>
                              </span>
                            </div>

                            {/* Center Play Icon Hover Reveal */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />
                              </div>
                            </div>

                            {/* Bottom Creator Info */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="font-bold text-sm sm:text-base leading-tight truncate text-white group-hover:text-rose-400 transition-colors">
                                {m.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1">
                                <span>{mVideoCount} videos</span>
                                {mPhotoCount > 0 && <span>• {mPhotoCount} photos</span>}
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Direct Fast Action Button Below Card */}
                        <div className="pt-2.5 flex items-center gap-2">
                          <Link
                            href={`/model/${m.slug}/videos`}
                            className="flex-1 py-2 px-3 rounded-2xl bg-white/[0.05] hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm border-none"
                          >
                            <VideocamRoundedIcon sx={{ fontSize: 14 }} />
                            <span>Videos</span>
                          </Link>
                          {mPhotoCount > 0 && (
                            <Link
                              href={`/model/${m.slug}/photos`}
                              className="py-2 px-3 rounded-2xl bg-white/[0.05] hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm border-none"
                              title={`${mPhotoCount} Photos`}
                            >
                              <PhotoCameraRoundedIcon sx={{ fontSize: 14 }} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags & Keyword Hubs */}
            {allVideoTags.length > 0 && (
              <div className="bg-[#121826]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LocalOfferRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                    Explore Related Video Tags ({allVideoTags.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Discover related collections
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allVideoTags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tag/${t.slug}`}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-200 hover:bg-rose-500/20 hover:text-rose-300 transition-colors shadow-sm border-none"
                    >
                      #{t.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <PublicFooter />
      </article>
    </PublicMuiThemeProvider>
  );
}
