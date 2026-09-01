import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { generatePhotoMetadata, generatePhotoJsonLd, getMediaSlug } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
} from "lucide-react";
import AdsterraBanner from "@/components/ads/adsterra-banner";
import AdsterraNativeBanner from "@/components/ads/adsterra-native";
import AdsterraSidebars from "@/components/ads/adsterra-sidebars";
import { ADS_ENABLED } from "@/lib/ads-config";
import { ADSTERRA_SMARTLINK_URL } from "@/lib/smartlink";

interface Props {
  params: Promise<{ slug: string; mediaId: string }>;
}

export const dynamic = "force-dynamic";

function findPhotoIndex(photos: any[], param: string): number {
  if (!photos || photos.length === 0) return -1;
  const decoded = decodeURIComponent(param);

  // 1. Match exact ID or order
  let idx = photos.findIndex(
    (m: any) => m._id?.toString() === decoded || m.order?.toString() === decoded
  );
  if (idx !== -1) return idx;

  // 2. Match slug with ID suffix (e.g. "...-65f1234abc")
  idx = photos.findIndex((m: any, i: number) => {
    const mId = m._id?.toString();
    const mOrder = m.order?.toString();
    if (mId && (decoded.endsWith(`-${mId}`) || decoded === mId)) return true;
    if (mOrder && (decoded.endsWith(`-${mOrder}`) || decoded === mOrder)) return true;
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

    if (!model) return { title: "Photo Not Found | VIXN" };

    const allPhotos = (model.media || []).filter((m: any) => m.type === "photo");
    const photoIndex = findPhotoIndex(allPhotos, mediaId);

    if (photoIndex === -1) {
      return { title: `${model.name} Photo | VIXN` };
    }

    const mediaItem = allPhotos[photoIndex];
    return generatePhotoMetadata(model, mediaItem, photoIndex);
  } catch {
    return { title: "VIXN Model Photo" };
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

  const { imageSchema, breadcrumbSchema } = generatePhotoJsonLd(
    model,
    currentPhoto,
    currentIndex
  );

  const photoTitle =
    currentPhoto.title ||
    `${model.name} - Exclusive HD Photo #${currentIndex + 1}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Side Ads (160x600 Skyscrapers) */}
      <AdsterraSidebars />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Navigation & Breadcrumbs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600"
          >
            <Link
              href="/"
              className="hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/models"
              className="hover:text-rose-600 transition-colors"
            >
              Models
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/model/${model.slug}`}
              className="hover:text-rose-600 transition-colors"
            >
              {model.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/model/${model.slug}/photos`}
              className="hover:text-rose-600 transition-colors"
            >
              Photos
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-rose-600 font-bold truncate max-w-[160px]">
              Photo #{currentIndex + 1}
            </span>
          </nav>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
          >
            <Link href={`/model/${model.slug}`}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to {model.name}
            </Link>
          </Button>
        </div>

        {/* Main Photo Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Photo Display */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xl flex items-center justify-center group">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt || photoTitle}
                className="w-full h-auto max-h-[85vh] object-contain mx-auto"
              />

              {/* Prev Button Overlay */}
              {prevPhoto && (
                <Link
                  href={`/model/${model.slug}/photo/${getMediaSlug(prevPhoto, "photo", currentIndex - 1)}`}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Link>
              )}

              {/* Next Button Overlay */}
              {nextPhoto && (
                <Link
                  href={`/model/${model.slug}/photo/${getMediaSlug(nextPhoto, "photo", currentIndex + 1)}`}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              )}

              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs border border-white/40 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  Photo {currentIndex + 1} of {allPhotos.length}
                </span>
              </div>
            </div>

            {/* Quick Browse Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {prevPhoto ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <Link
                      href={`/model/${model.slug}/photo/${getMediaSlug(prevPhoto, "photo", currentIndex - 1)}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev Photo
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev Photo
                  </Button>
                )}

                {nextPhoto ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <Link
                      href={`/model/${model.slug}/photo/${getMediaSlug(nextPhoto, "photo", currentIndex + 1)}`}
                    >
                      Next Photo <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    Next Photo <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={ADS_ENABLED ? ADSTERRA_SMARTLINK_URL : currentPhoto.url}
                  target={ADS_ENABLED ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  download={!ADS_ENABLED ? true : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Download 4K Ultra HD</span>
                </a>
                <a
                  href={currentPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View Original</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Details & Model Profile */}
          <div className="lg:col-span-4 space-y-6">
            {/* Photo Metadata Card */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {photoTitle}
                </h1>
                {currentPhoto.alt && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {currentPhoto.alt}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Model:</span>
                  <Link
                    href={`/model/${model.slug}`}
                    className="font-bold text-slate-900 hover:text-rose-600 transition-colors"
                  >
                    {model.name}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <Badge
                    variant="secondary"
                    className="bg-white border-slate-200 text-slate-700 font-semibold"
                  >
                    {model.category || "Fashion & Glamour"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Quality:</span>
                  <span className="font-bold text-emerald-600">
                    4K Ultra HD
                  </span>
                </div>

                {(() => {
                  const photoKeywords: string[] = Array.isArray(currentPhoto.keywords)
                    ? currentPhoto.keywords.filter(Boolean)
                    : typeof currentPhoto.keywords === "string" && currentPhoto.keywords.trim()
                    ? currentPhoto.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
                    : [];

                  if (photoKeywords.length === 0) return null;

                  return (
                    <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        SEO Tags &amp; Keywords
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {photoKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium text-slate-500 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70 transition-colors"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Model Profile Teaser Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={model.profileImage || model.coverImage || "/logo.jpg"}
                  alt={model.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {model.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {allPhotos.length} Photos •{" "}
                    {(model.media || []).filter((m: any) => m.type === "video").length}{" "}
                    Videos
                  </p>
                </div>
              </div>

              {model.bio && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {model.bio}
                </p>
              )}

              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                <Link href={`/model/${model.slug}`}>
                  Explore {model.name}&apos;s Full Gallery
                </Link>
              </Button>
            </div>

            {/* Sidebar Banner Ads (300x250 & 160x600 Skyscraper) */}
            <AdsterraBanner size="300x250" label />
            <AdsterraBanner size="160x600" label />
          </div>
        </div>

        {/* In-page Full Banner Set */}
        <AdsterraBanner size="728x90" label />
        <AdsterraBanner size="468x60" label />
        <AdsterraBanner size="320x50" label />
        <AdsterraNativeBanner />

        {/* More Photos from Same Model */}
        {relatedPhotos.length > 0 && (
          <section className="pt-12 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  More Photos of {model.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse the complete photo collection ({allPhotos.length} total)
                </p>
              </div>

              <Link
                href={`/model/${model.slug}`}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                View Full Model Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedPhotos.slice(0, 12).map((photo: any) => (
                <Link
                  key={photo._id?.toString() || photo.originalIndex}
                  href={`/model/${model.slug}/photo/${getMediaSlug(photo, "photo", photo.originalIndex)}`}
                  className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs hover:shadow-lg transition-all transform hover:-translate-y-1 block"
                >
                  <img
                    src={photo.url}
                    alt={photo.alt || `${model.name} photo`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-[11px] font-bold text-white truncate">
                      {photo.title || `Photo #${photo.originalIndex + 1}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
