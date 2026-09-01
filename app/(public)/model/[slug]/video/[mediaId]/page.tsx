import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { generateVideoMetadata, generateVideoJsonLd, getMediaSlug } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Video as VideoIcon,
  Sparkles,
  Play,
  ExternalLink,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string; mediaId: string }>;
}

export const dynamic = "force-dynamic";

function findVideoIndex(videos: any[], param: string): number {
  if (!videos || videos.length === 0) return -1;
  const decoded = decodeURIComponent(param);

  // 1. Match exact ID or order
  let idx = videos.findIndex(
    (m: any) => m._id?.toString() === decoded || m.order?.toString() === decoded
  );
  if (idx !== -1) return idx;

  // 2. Match slug with ID suffix
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

    if (!model) return { title: "Video Not Found | VIXN" };

    const allVideos = (model.media || []).filter((m: any) => m.type === "video");
    const videoIndex = findVideoIndex(allVideos, mediaId);

    if (videoIndex === -1) {
      return { title: `${model.name} Video | VIXN` };
    }

    const mediaItem = allVideos[videoIndex];
    return generateVideoMetadata(model, mediaItem, videoIndex);
  } catch {
    return { title: "VIXN Model Video" };
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

  // Other related videos from the same model
  const relatedVideos = allVideos
    .map((v: any, originalIndex: number) => ({ ...v, originalIndex }))
    .filter((v: any) => v._id?.toString() !== currentVideo._id?.toString());

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
    <div className="min-h-screen bg-white">

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
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
              href={`/model/${model.slug}/videos`}
              className="hover:text-rose-600 transition-colors"
            >
              Videos
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-violet-600 font-bold truncate max-w-[160px]">
              Video #{currentIndex + 1}
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

        {/* Main Video Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Video Player Container */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xl aspect-video flex items-center justify-center">
              {currentVideo.isExternal ? (
                /* External Stream Video Card */
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
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                      <VideoIcon className="w-16 h-16 text-slate-600" />
                    </div>
                  )}

                  {/* Play CTA Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover/player:bg-black/25 transition-colors flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/40 group-hover/player:bg-rose-600/70 text-white flex items-center justify-center shadow-2xl transform group-hover/player:scale-110 transition-all">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                    </div>
                    <div className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                      <span>Watch Full Video</span>
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> External Stream
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

              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs border border-white/40 flex items-center gap-1.5 pointer-events-none">
                <VideoIcon className="w-3.5 h-3.5 text-violet-600" />
                <span>
                  Video {currentIndex + 1} of {allVideos.length}
                </span>
              </div>
            </div>

            {/* Quick Browse Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {prevVideo ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <Link
                      href={`/model/${model.slug}/video/${getMediaSlug(prevVideo, "video", currentIndex - 1)}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev Video
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev Video
                  </Button>
                )}

                {nextVideo ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    <Link
                      href={`/model/${model.slug}/video/${getMediaSlug(nextVideo, "video", currentIndex + 1)}`}
                    >
                      Next Video <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-xl border-slate-200 text-xs font-semibold"
                  >
                    Next Video <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Download 1080p / 4K Video</span>
                </a>
                {currentVideo.isExternal ? (
                  <a
                    href={currentVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <span>External Stream</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    4K Direct Streaming
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Details & Model Profile */}
          <div className="lg:col-span-4 space-y-6">
            {/* Video Metadata Card */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {videoTitle}
                </h1>
                {currentVideo.alt && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {currentVideo.alt}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Starring:</span>
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
                    {model.category || "Videos & Streaming"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Format:</span>
                  <span className="font-bold text-slate-900">
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
                    <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        SEO Tags &amp; Keywords
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {videoKeywords.map((kw, i) => (
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
                    {(model.media || []).filter((m: any) => m.type === "photo").length}{" "}
                    Photos • {allVideos.length} Videos
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
          </div>
        </div>

        {/* Related Videos of Same Model Grid (SEO Internal Linking) */}
        {relatedVideos.length > 0 && (
          <section className="pt-12 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  More Videos of {model.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse the complete video collection ({allVideos.length} total)
                </p>
              </div>

              <Link
                href={`/model/${model.slug}`}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                View Full Model Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedVideos.slice(0, 8).map((vid: any) => {
                const vidPoster =
                  vid.thumbnail ||
                  model.profileImage ||
                  model.coverImage ||
                  "";
                return (
                  <Link
                    key={vid._id?.toString() || vid.originalIndex}
                    href={`/model/${model.slug}/video/${getMediaSlug(vid, "video", vid.originalIndex)}`}
                    className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs hover:shadow-lg transition-all transform hover:-translate-y-1 block"
                  >
                    {vidPoster ? (
                      <img
                        src={vidPoster}
                        alt={vid.alt || `${model.name} video`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                        <VideoIcon className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-rose-600/40 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-600/70 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <VideoIcon className="w-3 h-3 text-violet-600" /> VIDEO
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                      <p className="text-xs font-bold text-white truncate">
                        {vid.title || `Video Clip #${vid.originalIndex + 1}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
