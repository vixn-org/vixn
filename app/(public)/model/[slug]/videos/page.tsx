import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateModelVideosMetadata,
  generateModelVideosJsonLd,
  getMediaSlug,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Home,
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Play,
  ExternalLink,
  Flame,
  Film,
} from "lucide-react";
import AdsterraBanner from "@/components/ads/adsterra-banner";
import AdsterraNativeBanner from "@/components/ads/adsterra-native";
import AdsterraSidebars from "@/components/ads/adsterra-sidebars";
import { ADS_ENABLED } from "@/lib/ads-config";
import { ADSTERRA_SMARTLINK_URL } from "@/lib/smartlink";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
      status: "published",
    }).lean();

    if (!model) return { title: "Videos Not Found | VIXN" };

    return generateModelVideosMetadata(model);
  } catch {
    return { title: `${slug} Videos & 4K Clips | VIXN` };
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
    .select("name slug profileImage category media")
    .lean();

  const { videoCollectionSchema, breadcrumbSchema } =
    generateModelVideosJsonLd(model);

  const pageHeading =
    model.videosSeo?.heading || `${model.name} Video Showcase & 4K Clips`;

  return (
    <article itemScope itemType="https://schema.org/CollectionPage" className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-rose-500 selection:text-white">
      {/* Side Ads (160x600 Skyscrapers) */}
      <AdsterraSidebars />

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

      {/* Hero Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 overflow-x-auto whitespace-nowrap">
            <Link
              href="/"
              className="hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link
              href="/models"
              className="hover:text-rose-600 transition-colors"
            >
              Models
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link
              href={`/model/${model.slug}`}
              className="hover:text-rose-600 transition-colors"
            >
              {model.name}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold">Videos</span>
          </nav>

          {/* Model Banner Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
            <div className="flex items-center gap-4">
              <Link href={`/model/${model.slug}`} className="relative shrink-0 group">
                <img
                  src={model.profileImage || "/logo.jpg"}
                  alt={model.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1 rounded-full shadow-xs">
                  <VideoIcon className="w-3 h-3" />
                </div>
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link
                    href={`/model/${model.slug}`}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    {model.name}
                  </Link>
                  {model.category && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-slate-600 border-slate-200 uppercase tracking-wider font-bold"
                    >
                      {model.category}
                    </Badge>
                  )}
                  <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    {videos.length} 4K Videos
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {pageHeading}
                </h1>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
              >
                <Link href={`/model/${model.slug}`}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Full Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-4 overflow-x-auto no-scrollbar">
            <Link
              href={`/model/${model.slug}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0"
            >
              Overview
            </Link>
            {photos.length > 0 && (
              <Link
                href={`/model/${model.slug}/photos`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Photos ({photos.length})</span>
              </Link>
            )}
            <Link
              href={`/model/${model.slug}/videos`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <VideoIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Videos ({videos.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Optional SEO Intro Content */}
        {model.videosSeo?.introText && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>About This Video Collection</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
              {model.videosSeo.introText}
            </p>
          </div>
        )}

        {/* Top Banner Ad */}
        <div className="w-full flex justify-center py-2">
          <AdsterraBanner size="728x90" label />
        </div>

        {/* Video Showcase Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
            <Film className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              No videos published yet for this creator
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check back soon for upcoming high-definition video clips and stream releases.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>All Video Clips &amp; Streams</span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {videos.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video: any, index: number) => {
                const videoSlug = getMediaSlug(video, "video", index);
                const videoTitle =
                  video.title || `${model.name} Video #${index + 1}`;
                const posterSrc =
                  video.thumbnail || model.coverImage || model.profileImage || "";

                return (
                  <div
                    key={video._id || index}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Video Player Card */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      {posterSrc ? (
                        <img
                          src={posterSrc}
                          alt={video.alt || videoTitle}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                          <VideoIcon className="w-12 h-12" />
                        </div>
                      )}

                      {/* Play Overlay CTA */}
                      <Link
                        href={`/model/${model.slug}/video/${videoSlug}`}
                        className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-current ml-0.5" />
                        </div>
                        <span className="bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[11px] font-black shadow-sm flex items-center gap-1">
                          <span>Watch Video</span>
                          {video.isExternal && (
                            <ExternalLink className="w-3 h-3 text-rose-600" />
                          )}
                        </span>
                      </Link>

                      {/* Video Badges */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <VideoIcon className="w-3 h-3 text-rose-400" />
                        <span>Clip #{index + 1}</span>
                      </div>

                      {video.isExternal && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                          External Stream
                        </div>
                      )}
                    </div>

                    {/* Video Info Footer */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          {videoTitle}
                        </h3>
                        {video.alt && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {video.alt}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400">
                          HD 1080p / 4K
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 rounded-xl"
                        >
                          <Link href={`/model/${model.slug}/video/${videoSlug}`}>
                            Play Now →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Banner Ads */}
        <div className="pt-6 space-y-4">
          <AdsterraNativeBanner />
          <div className="flex justify-center">
            <AdsterraBanner size="728x90" label />
          </div>
        </div>

        {/* Related Models */}
        {relatedModels.length > 0 && (
          <div className="pt-8 border-t border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Explore More Video Creators</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Link href="/models">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedModels.map((m: any) => (
                <Link
                  key={m._id}
                  href={`/model/${m.slug}/videos`}
                  className="group block bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-all"
                >
                  <img
                    src={m.profileImage || "/logo.jpg"}
                    alt={m.name}
                    className="w-full aspect-square object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                  />
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <VideoIcon className="w-3 h-3 text-rose-600" />
                    <span>
                      {
                        (m.media || []).filter((x: any) => x.type === "video")
                          .length
                      }{" "}
                      Videos
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
