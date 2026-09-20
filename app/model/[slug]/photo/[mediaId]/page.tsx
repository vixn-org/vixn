import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generatePhotoMetadata,
  generatePhotoJsonLd,
  getMediaSlug,
  slugify,
} from "@/lib/seo";
import HeaderSearch from "@/components/public/header-search";
import ExploreOtherModelsPhotos from "@/components/public/explore-other-models-photos";
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";
import PublicFooter from "@/components/public/footer";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

interface Props {
  params: Promise<{ slug: string; mediaId: string }>;
}

export const revalidate = 3600;

function findPhotoIndex(photos: any[], param: string): number {
  if (!photos || photos.length === 0) return -1;
  const decoded = decodeURIComponent(param);

  // 1. Match exact ID or order
  let idx = photos.findIndex(
    (m: any) =>
      m._id?.toString() === decoded || m.order?.toString() === decoded
  );
  if (idx !== -1) return idx;

  // 2. Match slug with ID suffix (e.g. "...-65f1234abc")
  idx = photos.findIndex((m: any, i: number) => {
    const mId = m._id?.toString();
    const mOrder = m.order?.toString();
    if (mId && (decoded.endsWith(`-${mId}`) || decoded === mId)) return true;
    if (mOrder && (decoded.endsWith(`-${mOrder}`) || decoded === mOrder))
      return true;
    const mediaSlug = getMediaSlug(m, "photo", i);
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

    if (!model) return { title: { absolute: "Photo Not Found | VIXN" } };

    const allPhotos = (model.media || []).filter(
      (m: any) => m.type === "photo"
    );
    const photoIndex = findPhotoIndex(allPhotos, mediaId);

    if (photoIndex === -1) {
      return { title: { absolute: `${model.name} Photos | VIXN` } };
    }

    const mediaItem = allPhotos[photoIndex];
    return generatePhotoMetadata(model, mediaItem, photoIndex);
  } catch {
    return { title: { absolute: "Model Photo | VIXN" } };
  }
}

export default async function ModelPhotoPage({ params }: Props) {
  const { slug, mediaId } = await params;
  await connectDB();

  const model = await Model.findOne({
    slug: { $regex: new RegExp(`^${slug}$`, "i") },
    status: "published",
  }).lean();

  if (!model) {
    notFound();
  }

  const allPhotos = (model.media || []).filter((m: any) => m.type === "photo");
  const allVideos = (model.media || []).filter((m: any) => m.type === "video");
  const currentIndex = findPhotoIndex(allPhotos, mediaId);

  if (currentIndex === -1) {
    notFound();
  }

  const currentPhoto = allPhotos[currentIndex];
  const prevPhoto = currentIndex > 0 ? allPhotos[currentIndex - 1] : null;
  const nextPhoto =
    currentIndex < allPhotos.length - 1 ? allPhotos[currentIndex + 1] : null;

  // Other related photos from the same model (excluding current)
  const relatedPhotos = allPhotos
    .map((p: any, originalIndex: number) => ({ ...p, originalIndex }))
    .filter((p: any) => p._id?.toString() !== currentPhoto._id?.toString());

  // Fetch photos from other unique models (1 photo per unique model)
  const otherModelsWithPhotos = await Model.find({
    status: "published",
    slug: { $ne: model.slug },
    "media.type": "photo",
  })
    .select("name slug profileImage coverImage category media")
    .sort({ featured: -1, updatedAt: -1 })
    .limit(12)
    .lean();

  const otherModelPhotos = otherModelsWithPhotos
    .map((m: any) => {
      const photos = (m.media || []).filter((x: any) => x.type === "photo");
      if (photos.length === 0) return null;
      const firstPhoto = photos[0];
      const origIndex = (m.media || []).findIndex(
        (x: any) => x._id?.toString() === firstPhoto._id?.toString()
      );
      const mediaSlug = getMediaSlug(
        firstPhoto,
        "photo",
        origIndex >= 0 ? origIndex : 0
      );
      return {
        modelName: m.name,
        modelSlug: m.slug,
        modelAvatar: m.profileImage || m.coverImage,
        category: m.category,
        photo: firstPhoto,
        mediaSlug,
        url: `/model/${m.slug}/photo/${mediaSlug}`,
        totalPhotos: photos.length,
      };
    })
    .filter(Boolean);

  const { imageSchema, breadcrumbSchema } = generatePhotoJsonLd(
    model,
    currentPhoto,
    currentIndex
  );

  const photoTitle =
    currentPhoto.title ||
    `${model.name} - Exclusive HD Photo #${currentIndex + 1}`;

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
                href={`/model/${model.slug}/photos`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors border-none"
              >
                Photos ({allPhotos.length})
              </Link>
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
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
                  href={`/model/${model.slug}/photos`}
                  className="hover:text-rose-400 transition-colors"
                >
                  Photos
                </Link>
                <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
                <span className="text-indigo-400 font-bold truncate max-w-[160px]">
                  Photo #{currentIndex + 1}
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

            {/* Main Photo Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Photo Display */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative rounded-md overflow-hidden bg-black/60 shadow-2xl flex items-center justify-center group border-none min-h-[420px] sm:min-h-[520px]">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.alt || photoTitle}
                    className="w-full h-auto max-h-[85vh] object-contain mx-auto transition-transform duration-300"
                  />

                  {/* Prev Button Overlay */}
                  {prevPhoto && (
                    <Link
                      href={`/model/${model.slug}/photo/${getMediaSlug(prevPhoto, "photo", currentIndex - 1)}`}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-xl border-none"
                      title="Previous Photo"
                    >
                      <ChevronLeftRoundedIcon sx={{ fontSize: 28 }} />
                    </Link>
                  )}

                  {/* Next Button Overlay */}
                  {nextPhoto && (
                    <Link
                      href={`/model/${model.slug}/photo/${getMediaSlug(nextPhoto, "photo", currentIndex + 1)}`}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-xl border-none"
                      title="Next Photo"
                    >
                      <ChevronRightRoundedIcon sx={{ fontSize: 28 }} />
                    </Link>
                  )}
                </div>

                {/* Quick Browse & Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {prevPhoto ? (
                      <Link
                        href={`/model/${model.slug}/photo/${getMediaSlug(prevPhoto, "photo", currentIndex - 1)}`}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md border-none"
                      >
                        <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Prev Photo</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.03] text-slate-600 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-not-allowed border-none opacity-40"
                      >
                        <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Prev Photo</span>
                      </button>
                    )}

                    {nextPhoto ? (
                      <Link
                        href={`/model/${model.slug}/photo/${getMediaSlug(nextPhoto, "photo", currentIndex + 1)}`}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md border-none"
                      >
                        <span>Next Photo</span>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-md bg-white/[0.03] text-slate-600 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-not-allowed border-none opacity-40"
                      >
                        <span>Next Photo</span>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <a
                      href={currentPhoto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-4 py-2.5 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40 inline-flex items-center gap-1.5 border-none"
                    >
                      <FileDownloadRoundedIcon sx={{ fontSize: 16 }} />
                      <span>Download 4K Ultra HD</span>
                    </a>
                    <a
                      href={currentPhoto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-all inline-flex items-center gap-1 border-none"
                    >
                      <span>View Full Size</span>
                      <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Details & Model Profile */}
              <div className="lg:col-span-4 space-y-6">
                {/* Photo Metadata Card */}
                <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md p-6 sm:p-7 shadow-2xl space-y-4 border-none">
                  <div className="space-y-1.5">
                    <h1 className="text-xl font-black text-white leading-tight">
                      {photoTitle}
                    </h1>
                    {currentPhoto.alt && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {currentPhoto.alt}
                      </p>
                    )}
                  </div>

                  <div className="bg-white/[0.03] p-4 rounded-md space-y-2.5 text-xs text-slate-300 border-none">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Model:</span>
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
                        {model.category || "Fashion & Glamour"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Quality:</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <HighQualityRoundedIcon sx={{ fontSize: 16 }} />
                        <span>4K Ultra HD</span>
                      </span>
                    </div>

                    {(() => {
                      const photoKeywords: string[] = Array.isArray(
                        currentPhoto.keywords
                      )
                        ? currentPhoto.keywords.filter(Boolean)
                        : typeof currentPhoto.keywords === "string" &&
                            currentPhoto.keywords.trim()
                          ? currentPhoto.keywords
                              .split(",")
                              .map((k: string) => k.trim())
                              .filter(Boolean)
                          : [];

                      if (photoKeywords.length === 0) return null;

                      return (
                        <div className="pt-2 space-y-2 border-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            SEO Tags &amp; Keywords
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {photoKeywords.map((kw, i) => {
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
                        {allPhotos.length} Photos • {allVideos.length} Videos
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
                        href={`/model/${model.slug}/photos`}
                        className="py-2 px-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors border-none"
                      >
                        <PhotoCameraRoundedIcon sx={{ fontSize: 14, color: "#818cf8" }} />
                        <span>Photos ({allPhotos.length})</span>
                      </Link>
                      <Link
                        href={`/model/${model.slug}/videos`}
                        className="py-2 px-2.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors border-none"
                      >
                        <VideocamRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                        <span>Videos ({allVideos.length})</span>
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

            {/* More Photos of Same Model Grid (SEO Internal Linking) */}
            {relatedPhotos.length > 0 && (
              <section className="pt-12 space-y-6 border-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      More Photos of {model.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Browse the complete photo collection ({allPhotos.length} total)
                    </p>
                  </div>

                  <Link
                    href={`/model/${model.slug}/photos`}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
                  >
                    <span>View All Photos</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                  {relatedPhotos.slice(0, 12).map((photo: any) => {
                    const photoSlug = getMediaSlug(photo, "photo", photo.originalIndex);
                    const title = photo.title || `Photo #${photo.originalIndex + 1}`;

                    return (
                      <div
                        key={photo._id?.toString() || photo.originalIndex}
                        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
                      >
                        <Link
                          href={`/model/${model.slug}/photo/${photoSlug}`}
                          className="relative aspect-4/5 rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 block"
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt || `${model.name} photo`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        {/* Title Below Thumbnail - Transparent */}
                        <div className="pt-2.5 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1 bg-transparent">
                          <Link href={`/model/${model.slug}/photo/${photoSlug}`} className="block">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1 leading-snug">
                              {title}
                            </h4>
                          </Link>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-transparent border-none">
                            <span className="text-emerald-400 font-semibold">4K UHD</span>
                            <Link
                              href={`/model/${model.slug}/photo/${photoSlug}`}
                              className="font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Explore Photos from Other Models Section */}
            <ExploreOtherModelsPhotos
              photos={otherModelPhotos as any}
              currentModelName={model.name}
            />
          </div>
        </main>
        <PublicFooter />
      </div>
    </PublicMuiThemeProvider>
  );
}
