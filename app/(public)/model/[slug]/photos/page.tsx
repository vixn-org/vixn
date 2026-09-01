import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateModelPhotosMetadata,
  generateModelPhotosJsonLd,
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
  Maximize2,
  Share2,
  Eye,
  ExternalLink,
  Flame,
  ChevronDown,
} from "lucide-react";

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

    if (!model) return { title: "Photos Not Found | VIXN" };

    return generateModelPhotosMetadata(model);
  } catch {
    return { title: `${slug} Photos & HD Gallery | VIXN` };
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
    .select("name slug profileImage category media")
    .lean();

  const { imageGallerySchema, breadcrumbSchema } =
    generateModelPhotosJsonLd(model);

  const pageHeading =
    model.photosSeo?.heading || `${model.name} Photo Sets & HD Gallery`;

  return (
    <article itemScope itemType="https://schema.org/ImageGallery" className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-rose-500 selection:text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
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
            <span className="text-slate-900 font-bold">Photos</span>
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
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                  <ImageIcon className="w-3 h-3" />
                </div>
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link
                    href={`/model/${model.slug}`}
                    className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {model.name}
                  </Link>
                  {model.category && (
                    <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200 uppercase tracking-wider font-bold">
                      {model.category}
                    </Badge>
                  )}
                  <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    {photos.length} HD Photos
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
            <Link
              href={`/model/${model.slug}/photos`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Photos ({photos.length})</span>
            </Link>
            {videos.length > 0 && (
              <Link
                href={`/model/${model.slug}/videos`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0"
              >
                <VideoIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Videos ({videos.length})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Photo Gallery Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              No photos published yet for this creator
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check back soon for upcoming high-definition photo sets.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>All Photo Sets</span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
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
                  <div key={photo._id || index} className="space-y-4">
                    <Link
                      href={`/model/${model.slug}/photo/${photoSlug}`}
                      className="group relative block rounded-2xl overflow-hidden bg-slate-950 aspect-3/4 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={photo.url}
                        alt={photo.alt || photoTitle}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                        <div className="flex justify-end">
                          <span className="bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full text-xs">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {photoTitle}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-rose-300 font-semibold">
                            <Eye className="w-3 h-3" />
                            <span>View HD Photo</span>
                          </div>
                        </div>
                      </div>

                      {/* Photo Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        #{index + 1}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional SEO Content Accordion */}
        {model.photosSeo?.introText && (
          <details className="group bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs transition-all [&::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none select-none gap-4">
              <span className="text-slate-900 font-bold text-sm">About This Photo Collection</span>
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                <div className="w-7 h-7 rounded-full bg-slate-100/80 border border-slate-200/80 flex items-center justify-center group-open:rotate-180 transition-transform duration-200">
                  <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                </div>
              </div>
            </summary>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
                {model.photosSeo.introText}
              </p>
            </div>
          </details>
        )}

        {/* Related Models */}
        {relatedModels.length > 0 && (
          <div className="pt-8 border-t border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Explore More Creators</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Link href="/models">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedModels.map((m: any) => (
                <Link
                  key={m._id}
                  href={`/model/${m.slug}/photos`}
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
                    <ImageIcon className="w-3 h-3 text-indigo-600" />
                    <span>
                      {
                        (m.media || []).filter((x: any) => x.type === "photo")
                          .length
                      }{" "}
                      Photos
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
