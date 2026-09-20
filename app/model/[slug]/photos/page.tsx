import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateModelPhotosMetadata,
  generateModelPhotosJsonLd,
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
import ZoomOutMapRoundedIcon from "@mui/icons-material/ZoomOutMapRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
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

    if (!model) return { title: { absolute: "Photos Not Found | VIXN" } };

    return generateModelPhotosMetadata(model);
  } catch {
    return { title: { absolute: `${slug} Photos | VIXN` } };
  }
}

export default async function ModelPhotosPage({ params }: Props) {
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

  // Aggregate all photo-related tags and keywords (deduplicated)
  const tagMap = new Map<string, string>();
  if (model.name) tagMap.set(slugify(model.name), model.name);
  (model.tags || []).forEach((t: string) => {
    if (t && typeof t === "string") {
      const s = slugify(t);
      if (s && !tagMap.has(s)) tagMap.set(s, t.trim());
    }
  });
  (model.photosSeo?.metaKeywords || []).forEach((kw: string) => {
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
  photos.forEach((p: any) => {
    const kws = Array.isArray(p.keywords)
      ? p.keywords
      : typeof p.keywords === "string"
      ? p.keywords.split(",")
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
  const allPhotoTags = Array.from(tagMap.entries()).map(([slug, label]) => ({
    slug,
    label,
  }));

  const { imageGallerySchema, breadcrumbSchema } =
    generateModelPhotosJsonLd(model);

  const pageHeading =
    model.photosSeo?.heading || `${model.name} Photo Sets & HD Gallery`;

  return (
    <PublicMuiThemeProvider>
      <article
        itemScope
        itemType="https://schema.org/ImageGallery"
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
              {videos.length > 0 && (
                <Link
                  href={`/model/${model.slug}/videos`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-300 hover:text-white bg-black/40 backdrop-blur-md hover:bg-rose-600/60 transition-colors shadow-md border-none"
                >
                  Videos ({videos.length})
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
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
              <span className="text-white font-bold">Photos</span>
            </nav>

            {/* Model Photos Hero Header Card - Elevated Borderless Luxury Card */}
            <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md shadow-2xl p-6 sm:p-8 border-none">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <Link href={`/model/${model.slug}`} className="relative shrink-0 group">
                    <img
                      src={model.profileImage || "/logo.jpg"}
                      alt={model.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover shadow-xl ring-4 ring-white/[0.08] group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg flex items-center justify-center ring-4 ring-[#121826]">
                      <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
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
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border-none">
                        {photos.length} HD Photos
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
                    className="px-4 py-2.5 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-2 shadow-md border-none"
                  >
                    <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                    <span>Full Profile</span>
                  </Link>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/[0.04] overflow-x-auto no-scrollbar">
                <Link
                  href={`/model/${model.slug}`}
                  className="px-4 py-2 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shrink-0 border-none"
                >
                  Overview
                </Link>
                <span className="px-4 py-2 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 flex items-center gap-1.5 shrink-0 border-none">
                  <PhotoCameraRoundedIcon sx={{ fontSize: 15 }} />
                  <span>Photos ({photos.length})</span>
                </span>
                {videos.length > 0 && (
                  <Link
                    href={`/model/${model.slug}/videos`}
                    className="px-4 py-2 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 shrink-0 border-none"
                  >
                    <VideocamRoundedIcon sx={{ fontSize: 15, color: "#f43f5e" }} />
                    <span>Videos ({videos.length})</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Photo Gallery Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-20 bg-[#121826]/70 backdrop-blur-xl rounded-md space-y-4 border-none">
                <CollectionsRoundedIcon sx={{ fontSize: 44, color: "#475569" }} className="mx-auto" />
                <h3 className="text-base font-bold text-slate-200">
                  No photos published yet for this creator
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Check back soon for upcoming high-definition photo sets.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                    <span>All Photo Sets</span>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border-none">
                      {photos.length}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {photos.map((photo: any, index: number) => {
                    const photoSlug = getMediaSlug(photo, "photo", index);
                    const photoTitle =
                      photo.title || `${model.name} Photo #${index + 1}`;

                    return (
                      <div
                        key={photo._id || index}
                        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
                      >
                        {/* Photo Image Card */}
                        <Link
                          href={`/model/${model.slug}/photo/${photoSlug}`}
                          className="relative aspect-4/5 w-full bg-[#182238] rounded-md overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt || photoTitle}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Hover Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                            <div className="flex justify-end">
                              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                <ZoomOutMapRoundedIcon sx={{ fontSize: 18 }} />
                              </span>
                            </div>
                            <span className="text-xs font-semibold bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full self-start">
                              View HD Photo
                            </span>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                            #{index + 1}
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-300 shadow-md flex items-center gap-0.5">
                            <HighQualityRoundedIcon sx={{ fontSize: 14, color: "#818cf8" }} />
                            <span>4K HD</span>
                          </div>
                        </Link>

                        {/* Title and Action Below Thumbnail - Completely Transparent */}
                        <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
                          <Link href={`/model/${model.slug}/photo/${photoSlug}`} className="block">
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                              {photoTitle}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 bg-transparent border-none">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold text-[11px]">
                              <PhotoCameraRoundedIcon sx={{ fontSize: 13 }} />
                              HD Capture
                            </span>
                            <Link
                              href={`/model/${model.slug}/photo/${photoSlug}`}
                              className="text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                            >
                              <span>View</span>
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

            {/* Cross-Link Banner to Videos Hub */}
            {videos.length > 0 && (
              <div className="bg-gradient-to-r from-rose-950/60 via-[#1e1326] to-pink-950/60 backdrop-blur-xl rounded-md p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-none">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <VideocamRoundedIcon sx={{ fontSize: 16 }} />
                    Streaming Videos
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Watch All {videos.length} Videos of {model.name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Stream 4K high-definition video clips, exclusive scenes, and uncut streams.
                  </p>
                </div>
                <Link
                  href={`/model/${model.slug}/videos`}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-black px-5 py-2.5 rounded-md text-xs shadow-lg shrink-0 transition-colors border-none"
                >
                  Go to Videos Hub →
                </Link>
              </div>
            )}

            {/* Optional SEO Content Accordion */}
            {model.photosSeo?.introText && (
              <details className="group bg-[#121826]/80 backdrop-blur-xl rounded-md p-6 shadow-xl border-none transition-all [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none gap-4">
                  <span className="text-white font-bold text-sm">
                    About This Photo Collection
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center group-open:rotate-180 transition-transform duration-200">
                    <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                    {model.photosSeo.introText}
                  </p>
                </div>
              </details>
            )}

            {/* Related Models - Cinematic Creator Showcase */}
            {relatedModels.length > 0 && (
              <div className="pt-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                        <WhatshotRoundedIcon sx={{ fontSize: 20 }} />
                      </div>
                      <span>Explore More Creators</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Discover trending models, exclusive photoshoot galleries, and creator portfolios
                    </p>
                  </div>
                  <Link
                    href="/models"
                    className="px-4 py-2 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
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
                        <div className="relative aspect-3/4 w-full bg-[#182238] rounded-md overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-500 block">
                          <Link href={`/model/${m.slug}/photos`} className="block w-full h-full">
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
                              <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shrink-0">
                                <PhotoCameraRoundedIcon sx={{ fontSize: 13 }} />
                                <span>{mPhotoCount}</span>
                              </span>
                            </div>

                            {/* Bottom Creator Info */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="font-bold text-sm sm:text-base leading-tight truncate text-white group-hover:text-indigo-400 transition-colors">
                                {m.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1">
                                <span>{mPhotoCount} photos</span>
                                {mVideoCount > 0 && <span>• {mVideoCount} videos</span>}
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Direct Fast Action Button Below Card */}
                        <div className="pt-2.5 flex items-center gap-2">
                          <Link
                            href={`/model/${m.slug}/photos`}
                            className="flex-1 py-2 px-3 rounded-md bg-white/[0.05] hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm border-none"
                          >
                            <PhotoCameraRoundedIcon sx={{ fontSize: 14 }} />
                            <span>Photos</span>
                          </Link>
                          {mVideoCount > 0 && (
                            <Link
                              href={`/model/${m.slug}/videos`}
                              className="py-2 px-3 rounded-md bg-white/[0.05] hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm border-none"
                              title={`${mVideoCount} Videos`}
                            >
                              <VideocamRoundedIcon sx={{ fontSize: 14 }} />
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
            {allPhotoTags.length > 0 && (
              <div className="bg-[#121826]/80 backdrop-blur-2xl rounded-md p-6 sm:p-8 space-y-4 shadow-xl border-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LocalOfferRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                    Explore Related Photo Tags ({allPhotoTags.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Discover related collections
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allPhotoTags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tag/${t.slug}`}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-200 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors shadow-sm border-none"
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
