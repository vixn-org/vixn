import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateVideoMetadata,
  generateVideoJsonLd,
  getMediaSlug,
  slugify,
} from "@/lib/seo";
import HeaderSearch from "@/components/public/header-search";
import ExploreOtherModelsVideos from "@/components/public/explore-other-models-videos";
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";
import PublicFooter from "@/components/public/footer";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

interface Props {
  params: Promise<{ slug: string; mediaId: string }>;
}

export const revalidate = 3600;

function findVideoIndex(videos: any[], param: string): number {
  if (!videos || videos.length === 0) return -1;
  const decoded = decodeURIComponent(param);

  let idx = videos.findIndex(
    (m: any) => m._id?.toString() === decoded || m.order?.toString() === decoded
  );
  if (idx !== -1) return idx;

  idx = videos.findIndex((m: any, i: number) => {
    const mId = m._id?.toString();
    const mOrder = m.order?.toString();
    if (mId && (decoded.endsWith(`-${mId}`) || decoded === mId)) return true;
    if (mOrder && (decoded.endsWith(`-${mOrder}`) || decoded === mOrder)) return true;
    const mediaSlug = getMediaSlug(m, "video", i);
    return mediaSlug === decoded;
  });

  return idx;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, mediaId } = await params;
  try {
    await connectDB();
    const model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
      status: "published",
    }).lean();

    if (!model) return { title: { absolute: "Video Not Found | VIXN" } };

    const allVideos = (model.media || []).filter((m: any) => m.type === "video");
    const videoIndex = findVideoIndex(allVideos, mediaId);

    if (videoIndex === -1) {
      return { title: { absolute: `${model.name} Videos | VIXN` } };
    }

    const mediaItem = allVideos[videoIndex];
    return generateVideoMetadata(model, mediaItem, videoIndex);
  } catch {
    return { title: { absolute: "Model Video | VIXN" } };
  }
}

export default async function ModelVideoPage({ params }: Props) {
  const { slug, mediaId } = await params;
  await connectDB();

  const model = await Model.findOne({
    slug: { $regex: new RegExp(`^${slug}$`, "i") },
    status: "published",
  }).lean();

  if (!model) {
    notFound();
  }

  const allVideos = (model.media || []).filter((m: any) => m.type === "video");
  const currentIndex = findVideoIndex(allVideos, mediaId);

  if (currentIndex === -1) {
    notFound();
  }

  const currentVideo = allVideos[currentIndex];
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  const relatedVideos = allVideos
    .map((v: any, originalIndex: number) => ({ ...v, originalIndex }))
    .filter((v: any) => v._id?.toString() !== currentVideo._id?.toString());

  const otherModelsWithVideos = await Model.find({
    status: "published",
    slug: { $ne: model.slug },
    "media.type": "video",
  })
    .select("name slug profileImage coverImage category media")
    .sort({ featured: -1, updatedAt: -1 })
    .limit(12)
    .lean();

  const otherModelVideos = otherModelsWithVideos
    .map((m: any) => {
      const vids = (m.media || []).filter((x: any) => x.type === "video");
      if (vids.length === 0) return null;
      const firstVid = vids[0];
      const origIndex = (m.media || []).findIndex(
        (x: any) => x._id?.toString() === firstVid._id?.toString()
      );
      const mediaSlug = getMediaSlug(
        firstVid,
        "video",
        origIndex >= 0 ? origIndex : 0
      );
      return {
        modelName: m.name,
        modelSlug: m.slug,
        modelAvatar: m.profileImage || m.coverImage,
        category: m.category,
        video: firstVid,
        mediaSlug,
        url: `/model/${m.slug}/video/${mediaSlug}`,
        totalVideos: vids.length,
      };
    })
    .filter(Boolean);

  const { videoSchema, breadcrumbSchema } = generateVideoJsonLd(
    model,
    currentVideo,
    currentIndex
  );

  const videoTitle =
    currentVideo.title ||
    `${model.name} - Exclusive HD Video Clip #${currentIndex + 1}`;

  const posterSrc =
    currentVideo.thumbnail || model.profileImage || model.coverImage || "";

  return (
    <PublicMuiThemeProvider>
      <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
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
              <Link
                href={`/model/${model.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border-none"
              >
                {model.name}
              </Link>
              <Link
                href={`/model/${model.slug}/videos`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border-none"
              >
                Videos ({allVideos.length})
              </Link>
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <main className="flex-1 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
            {/* Navigation & Breadcrumbs Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-none">
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
                <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
                <Link
                  href="/models"
                  className="hover:text-rose-400 transition-colors"
                >
                  Models
                </Link>
                <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
                <Link
                  href={`/model/${model.slug}`}
                  className="hover:text-rose-400 transition-colors"
                >
                  {model.name}
                </Link>
                <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
                <Link
                  href={`/model/${model.slug}/videos`}
                  className="hover:text-rose-400 transition-colors"
                >
                  Videos
                </Link>
                <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
                <span className="text-rose-400 font-bold truncate max-w-[160px]">
                  Clip #{currentIndex + 1}
                </span>
              </nav>

              <Link
                href={`/model/${model.slug}`}
                className="px-4 py-2 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 15 }} />
                <span>Back to {model.name}</span>
              </Link>
            </div>

            {/* Main Video Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Video Player Container */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative rounded-md overflow-hidden bg-black shadow-2xl aspect-video flex items-center justify-center border-none">
                  {currentVideo.isExternal ? (
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full relative block group/player cursor-pointer"
                    >
                      {posterSrc ? (
                        <img
                          src={posterSrc}
                          alt={currentVideo.alt || videoTitle}
                          className="w-full h-full object-cover group-hover/player:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500">
                          <VideocamRoundedIcon sx={{ fontSize: 48, color: "#64748b" }} />
                        </div>
                      )}

                      {/* Play Button - Clean, no thumbnail image overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl border border-white/30 group-hover/player:scale-110 group-hover/player:bg-black/80 transition-all">
                          <PlayArrowRoundedIcon sx={{ fontSize: 30, color: "#ffffff" }} />
                        </div>
                      </div>
                    </a>
                  ) : (
                    /* Native HTML5 Video Player */
                    <video
                      src={currentVideo.url}
                      poster={posterSrc}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>

                {/* Player Duration Strip Directly Below Main Video */}
                <div className="bg-[#121826]/75 backdrop-blur-xl rounded-md p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs border-none shadow-md">
                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <AccessTimeRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                      <span>Duration: 00:00</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 text-[11px] font-medium">
                      Full HD 1080p
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold">
                      Stream Ready
                    </span>
                  </div>
                </div>

                {/* Quick Browse Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {prevVideo ? (
                      <Link
                        href={`/model/${model.slug}/video/${getMediaSlug(prevVideo, "video", currentIndex - 1)}`}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md border-none"
                      >
                        <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Prev Video</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.03] text-slate-600 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-not-allowed border-none opacity-40"
                      >
                        <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Prev Video</span>
                      </button>
                    )}

                    {nextVideo ? (
                      <Link
                        href={`/model/${model.slug}/video/${getMediaSlug(nextVideo, "video", currentIndex + 1)}`}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md border-none"
                      >
                        <span>Next Video</span>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.03] text-slate-600 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-not-allowed border-none opacity-40"
                      >
                        <span>Next Video</span>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-4 py-2.5 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40 inline-flex items-center gap-1.5 border-none"
                    >
                      <FileDownloadRoundedIcon sx={{ fontSize: 16 }} />
                      <span>Download 1080p / 4K</span>
                    </a>
                    {currentVideo.isExternal ? (
                      <a
                        href={currentVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-all inline-flex items-center gap-1 border-none"
                      >
                        <span>External Stream</span>
                        <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3.5 py-2 rounded-md border-none flex items-center gap-1">
                        <HighQualityRoundedIcon sx={{ fontSize: 16 }} />
                        <span>4K Streaming</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Details & Model Profile */}
              <div className="lg:col-span-4 space-y-6">
                {/* Video Metadata Card */}
                <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md p-6 sm:p-7 shadow-2xl space-y-4 border-none">
                  <div className="space-y-1.5">
                    <h1 className="text-xl font-black text-white leading-tight">
                      {videoTitle}
                    </h1>
                    {currentVideo.alt && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {currentVideo.alt}
                      </p>
                    )}
                  </div>

                  <div className="bg-white/[0.03] p-4 rounded-md space-y-2.5 text-xs text-slate-300 border-none">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Starring:</span>
                      <Link
                        href={`/model/${model.slug}`}
                        className="font-bold text-white hover:text-rose-400 transition-colors"
                      >
                        {model.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Category:</span>
                      <span className="bg-white/[0.08] text-slate-200 font-semibold px-3 py-0.5 rounded-full text-[11px] border-none">
                        {model.category || "Videos & Streaming"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Duration:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "#f43f5e" }} />
                        00:00
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Format:</span>
                      <span className="font-bold text-slate-200">
                        {currentVideo.isExternal ? "Redirect Stream" : "Direct HD Video"}
                      </span>
                    </div>

                    {(() => {
                      const videoKeywords: string[] = Array.isArray(currentVideo.keywords)
                        ? currentVideo.keywords.filter(Boolean)
                        : typeof currentVideo.keywords === "string" && currentVideo.keywords.trim()
                        ? currentVideo.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
                        : [];

                      if (videoKeywords.length === 0) return null;

                      return (
                        <div className="pt-2 space-y-2 border-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            SEO Tags &amp; Keywords
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {videoKeywords.map((kw, i) => {
                              const kwSlug = slugify(kw);
                              return (
                                <Link
                                  key={i}
                                  href={`/tag/${kwSlug}`}
                                  className="text-[10px] font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-1 rounded-full transition-colors border-none"
                                >
                                  #{kw}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Model Profile Teaser Card */}
                <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md p-6 shadow-2xl space-y-4 border-none">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={model.profileImage || model.coverImage || "/logo.jpg"}
                      alt={model.name}
                      className="w-14 h-14 rounded-md object-cover ring-2 ring-white/[0.08] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-white truncate">
                          {model.name}
                        </h3>
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(model.media || []).filter((m: any) => m.type === "photo").length}{" "}
                        Photos • {allVideos.length} Videos
                      </p>
                    </div>
                  </div>

                  {model.bio && (
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {model.bio}
                    </p>
                  )}

                  <div className="space-y-2.5 pt-1">
                    <Link
                      href={`/model/${model.slug}`}
                      className="w-full py-2.5 px-4 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-900/40 text-center block transition-all border-none"
                    >
                      Explore {model.name}&apos;s Full Profile
                    </Link>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <Link
                        href={`/model/${model.slug}/videos`}
                        className="py-2 px-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors border-none"
                      >
                        <VideocamRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                        <span>Videos ({allVideos.length})</span>
                      </Link>
                      <Link
                        href={`/model/${model.slug}/photos`}
                        className="py-2 px-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors border-none"
                      >
                        <PhotoCameraRoundedIcon sx={{ fontSize: 14, color: "#818cf8" }} />
                        <span>Photos ({(model.media || []).filter((m: any) => m.type === "photo").length})</span>
                      </Link>
                    </div>

                    <Link
                      href={`/tag/${slugify(model.name)}`}
                      className="w-full py-2 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors block text-center border-none"
                    >
                      <LocalOfferRoundedIcon sx={{ fontSize: 12, color: "#f43f5e" }} />
                      <span>#{model.name} Tag Collection</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Videos of Same Model Grid (SEO Internal Linking) */}
            {relatedVideos.length > 0 && (
              <section className="pt-12 space-y-6 border-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      More Videos of {model.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Browse the complete video collection ({allVideos.length} total)
                    </p>
                  </div>

                  <Link
                    href={`/model/${model.slug}/videos`}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
                  >
                    <span>View All Videos</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedVideos.slice(0, 8).map((vid: any) => {
                    const vidPoster =
                      vid.thumbnail ||
                      model.profileImage ||
                      model.coverImage ||
                      "";
                    const vidSlug = getMediaSlug(vid, "video", vid.originalIndex);
                    const vidTitle = vid.title || `Video Clip #${vid.originalIndex + 1}`;

                    return (
                      <div
                        key={vid._id?.toString() || vid.originalIndex}
                        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
                      >
                        <Link
                          href={`/model/${model.slug}/video/${vidSlug}`}
                          className="relative aspect-video rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
                        >
                          {vidPoster ? (
                            <img
                              src={vidPoster}
                              alt={vid.alt || `${model.name} video`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500">
                              <VideocamRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} />
                            </div>
                          )}
                          {/* Play button overlay - visible only on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-transform">
                              <PlayArrowRoundedIcon sx={{ fontSize: 26 }} />
                            </div>
                          </div>
                        </Link>

                        {/* Video Title and Action Below Thumbnail - Transparent */}
                        <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
                          <Link href={`/model/${model.slug}/video/${vidSlug}`} className="block">
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                              {vidTitle}
                            </h4>
                          </Link>

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 bg-transparent border-none">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <HighQualityRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                              HD Stream
                            </span>
                            <Link
                              href={`/model/${model.slug}/video/${vidSlug}`}
                              className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
                            >
                              <span>Watch</span>
                              <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Explore Other Models Videos Section */}
            <ExploreOtherModelsVideos
              videos={otherModelVideos as any}
              currentModelName={model.name}
            />
          </div>
        </main>
        <PublicFooter />
      </div>
    </PublicMuiThemeProvider>
  );
}
