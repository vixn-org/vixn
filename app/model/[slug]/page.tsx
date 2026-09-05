import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model, { type IMediaItem } from "@/lib/models/model";
import { generateModelMetadata, generateModelJsonLd, slugify, getMediaSlug } from "@/lib/seo";
import ModelGalleryViewer from "@/components/public/model-gallery-viewer";
import ModelInfoAccordion from "@/components/public/model-info-accordion";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import {
  ChevronRight,
  Home,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Tag,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Flame,
  Globe,
  Award,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    
    // Case-insensitive query — only published models get full SEO metadata
    const model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
      status: "published",
    });

    if (!model) {
      return { title: { absolute: "Model Not Found | VIXN" } };
    }

    return generateModelMetadata(model);
  } catch (error) {
    console.error("generateMetadata DB error:", error);
    return { title: { absolute: `${slug} | VIXN` } };
  }
}

export const dynamic = "force-dynamic";

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  let model: any = null;
  let relatedModels: any[] = [];
  let trendingTags: { slug: string; label: string }[] = [];

  try {
    await connectDB();

    // Case-insensitive search for resilience
    model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    }).lean();

    if (model) {
      // Priority: models sharing same tags or category for content-relevant internal linking silo
      const relatedQuery: Record<string, any> = {
        _id: { $ne: model._id },
        status: "published",
      };

      if (model.tags?.length > 0 || model.category) {
        relatedQuery.$or = [];
        if (model.tags?.length > 0) {
          relatedQuery.$or.push({ tags: { $in: model.tags } });
        }
        if (model.category) {
          relatedQuery.$or.push({ category: model.category });
        }
      }

      relatedModels = await Model.find(relatedQuery)
        .limit(8)
        .select("name slug profileImage coverImage category media tags")
        .lean();

      // If not enough related models, backfill with other published models
      if (relatedModels.length < 4) {
        const existingIds = [model._id, ...relatedModels.map((r: any) => r._id)];
        const backfill = await Model.find({
          _id: { $nin: existingIds },
          status: "published",
        })
          .limit(4 - relatedModels.length)
          .select("name slug profileImage coverImage category media tags")
          .lean();
        relatedModels = [...relatedModels, ...backfill];
      }

      // Fetch global trending tags across other published models for cross-site link equity
      const allPublished = await Model.find({ status: "published" })
        .select("tags")
        .limit(60)
        .lean();
      const globalTagCounts = new Map<string, { label: string; count: number }>();
      allPublished.forEach((m: any) => {
        (m.tags || []).forEach((t: string) => {
          if (!t || typeof t !== "string") return;
          const s = slugify(t);
          if (s) {
            const existing = globalTagCounts.get(s);
            if (existing) {
              existing.count += 1;
            } else {
              globalTagCounts.set(s, { label: t.trim(), count: 1 });
            }
          }
        });
      });
      trendingTags = Array.from(globalTagCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 16)
        .map(([s, val]) => ({ slug: s, label: val.label }));
    }
  } catch (error) {
    console.error("ModelPage DB error:", error);
  }

  if (!model) {
    notFound();
  }

  const { personSchema, imageGallerySchema, breadcrumbSchema } =
    generateModelJsonLd(model);

  const serializedMedia = (model.media || []).map((m: any) => ({
    _id: m._id?.toString() || "",
    type: m.type,
    url: m.url,
    thumbnail: m.thumbnail || "",
    title: m.title || "",
    alt: m.alt || "",
    keywords: m.keywords || [],
    order: m.order || 0,
    isExternal: Boolean(m.isExternal),
  }));

  const photos =
    serializedMedia.filter((m: any) => m.type === "photo") || [];
  const videos =
    serializedMedia.filter((m: any) => m.type === "video") || [];

  const createdDate = model.createdAt
    ? new Date(model.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently added";

  // Collect all model-specific keywords and tags (deduplicated by slug)
  const modelTagMap = new Map<string, string>(); // slug -> label
  if (model.name) {
    modelTagMap.set(slugify(model.name), model.name);
  }
  (model.tags || []).forEach((t: string) => {
    if (t && typeof t === "string") {
      const s = slugify(t);
      if (s && !modelTagMap.has(s)) modelTagMap.set(s, t.trim());
    }
  });
  (model.metaKeywords || []).forEach((kw: string) => {
    if (kw && typeof kw === "string") {
      const s = slugify(kw);
      if (s && !modelTagMap.has(s)) modelTagMap.set(s, kw.trim());
    }
  });
  (model.photosSeo?.metaKeywords || []).forEach((kw: string) => {
    if (kw && typeof kw === "string") {
      const s = slugify(kw);
      if (s && !modelTagMap.has(s)) modelTagMap.set(s, kw.trim());
    }
  });
  (model.videosSeo?.metaKeywords || []).forEach((kw: string) => {
    if (kw && typeof kw === "string") {
      const s = slugify(kw);
      if (s && !modelTagMap.has(s)) modelTagMap.set(s, kw.trim());
    }
  });
  (model.media || []).forEach((m: any) => {
    const kws = Array.isArray(m.keywords)
      ? m.keywords
      : typeof m.keywords === "string"
      ? m.keywords.split(",")
      : [];
    kws.forEach((kw: string) => {
      if (kw && typeof kw === "string") {
        const s = slugify(kw);
        if (s && !modelTagMap.has(s)) modelTagMap.set(s, kw.trim());
      }
    });
  });
  if (model.category) {
    const s = slugify(model.category);
    if (s && !modelTagMap.has(s)) modelTagMap.set(s, model.category.trim());
  }

  const allModelTags = Array.from(modelTagMap.entries()).map(([slug, label]) => ({
    slug,
    label,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">

      {/* Top Search Bar (Transparent Overlay) */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-transparent pointer-events-auto">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <HeaderSearch />
          </div>
        </div>
      </header>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1">
        {/* Cover Image Banner */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-900 overflow-hidden">
          {model.coverImage ? (
            <img
              src={model.coverImage}
              alt={`${model.name} official cover banner`}
              className="w-full h-full object-cover opacity-90"
              loading="eager"
            />
          ) : model.profileImage ? (
            <img
              src={model.profileImage}
              alt={`${model.name} cover`}
              className="w-full h-full object-cover blur-md scale-105 opacity-60"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Main Container */}
        <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-semibold text-slate-600"
        >
          <Link
            href="/"
            className="hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/models" className="hover:text-rose-600 transition-colors">
            Models
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{model.name}</span>
        </nav>

        {/* Model Profile Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                {model.profileImage ? (
                  <img
                    src={model.profileImage}
                    alt={`${model.name} verified profile avatar`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg ring-1 ring-slate-200 shrink-0"
                    loading="eager"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    {model.name.charAt(0)}
                  </div>
                )}
                <div
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs"
                  title="Verified Profile"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {model.name}
                  </h1>
                  {model.cornerstone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Award className="w-3 h-3 text-indigo-600" />
                      Top Creator
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
                  <Link
                    href={`/tag/${slugify(model.name)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-rose-600" />
                    <span>#{model.name} Tag Hub</span>
                  </Link>

                  {model.category && (
                    <Link
                      href={`/tag/${slugify(model.category)}`}
                      className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold border border-slate-200 transition-colors"
                    >
                      {model.category}
                    </Link>
                  )}

                  {model.country && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      {model.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {createdDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Hub Links */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-start sm:justify-end">
              <Link
                href={`/model/${model.slug}/photos`}
                className="bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all px-4 py-2.5 rounded-2xl border border-slate-200 text-center min-w-[90px] group"
              >
                <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">
                  Photos Hub
                </div>
                <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <ImageIcon className="w-4 h-4 text-rose-500" />
                  {photos.length}
                </div>
              </Link>

              <Link
                href={`/model/${model.slug}/videos`}
                className="bg-slate-50 hover:bg-rose-50/60 hover:border-rose-200 transition-all px-4 py-2.5 rounded-2xl border border-slate-200 text-center min-w-[90px] group"
              >
                <div className="text-xs font-bold text-slate-400 group-hover:text-rose-600 uppercase tracking-wider">
                  Videos Hub
                </div>
                <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <VideoIcon className="w-4 h-4 text-violet-500" />
                  {videos.length}
                </div>
              </Link>

              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Sets
                </div>
                <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {model.media?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Biography Section */}
          {model.bio && (
            <div className="pt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About {model.name}
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl">
                {model.bio}
              </p>
            </div>
          )}

        </div>

        {/* Media Gallery Section */}
        <section className="space-y-6 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Media Folder &amp; Galleries
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                High resolution photo captures and streaming video footage
              </p>
            </div>
          </div>

          {/* Sub-Pages Quick Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/80 overflow-x-auto no-scrollbar">
            <span className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white shadow-xs">
              All Media ({serializedMedia.length})
            </span>
            {photos.length > 0 && (
              <Link
                href={`/model/${model.slug}/photos`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Photos Hub ({photos.length})</span>
              </Link>
            )}
            {videos.length > 0 && (
              <Link
                href={`/model/${model.slug}/videos`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1.5"
              >
                <VideoIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Videos Hub ({videos.length})</span>
              </Link>
            )}
          </div>

          {/* Interactive Lightbox Viewer */}
          <ModelGalleryViewer
            media={serializedMedia}
            modelName={model.name}
            modelSlug={model.slug}
          />

          {/* Direct Crawlable Media Directory for Googlebot Discovery */}
          <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Complete Index of {model.name} Pages
                </h3>
                <p className="text-xs text-slate-500">
                  Direct links to each high-resolution photo set and 4K streaming clip
                </p>
              </div>
              <div className="flex items-center gap-2">
                {photos.length > 0 && (
                  <Link
                    href={`/model/${model.slug}/photos`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>View {photos.length} Photos →</span>
                  </Link>
                )}
                {videos.length > 0 && (
                  <Link
                    href={`/model/${model.slug}/videos`}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-100 transition-colors flex items-center gap-1"
                  >
                    <VideoIcon className="w-3.5 h-3.5" />
                    <span>Watch {videos.length} Videos →</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Direct Links Grid for All Photos and Videos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {photos.map((photo: any, idx: number) => {
                const photoSlug = getMediaSlug(photo, "photo", idx);
                return (
                  <Link
                    key={photo._id || idx}
                    href={`/model/${model.slug}/photo/${photoSlug}`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-2 group"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate text-slate-700 group-hover:text-indigo-600 font-medium">
                      {photo.title || `${model.name} Photo #${idx + 1}`}
                    </span>
                  </Link>
                );
              })}
              {videos.map((video: any, idx: number) => {
                const videoSlug = getMediaSlug(video, "video", idx);
                return (
                  <Link
                    key={video._id || idx}
                    href={`/model/${model.slug}/video/${videoSlug}`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all flex items-center gap-2 group"
                  >
                    <VideoIcon className="w-3.5 h-3.5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate text-slate-700 group-hover:text-rose-600 font-medium">
                      {video.title || `${model.name} Video #${idx + 1}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Expandable Model Information / SEO Article Accordion */}
          <ModelInfoAccordion
            content={model.aboutContent}
            bio={model.bio}
            modelName={model.name}
          />

        </section>

        {/* Related Models / Internal Linking Section */}
        {relatedModels && relatedModels.length > 0 && (
          <section className="pt-12 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Explore More Models
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Discover other trending creators on VIXN.fun
                </p>
              </div>
              <Link
                href="/models"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                View Directory <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedModels.map((rel: any) => {
                const relPhotos = (rel.media || []).filter((x: any) => x.type === "photo").length;
                const relVideos = (rel.media || []).filter((x: any) => x.type === "video").length;
                return (
                  <div
                    key={rel._id.toString()}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    <Link
                      href={`/model/${rel.slug}`}
                      className="relative aspect-3/4 w-full bg-slate-100 overflow-hidden block"
                    >
                      <img
                        src={
                          rel.profileImage ||
                          rel.coverImage ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80"
                        }
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="font-bold text-sm leading-tight truncate">
                          {rel.name}
                        </p>
                        <p className="text-[10px] text-slate-300">
                          {rel.media?.length || 0} media sets
                        </p>
                      </div>
                    </Link>
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                      <Link
                        href={`/model/${rel.slug}/photos`}
                        className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 text-indigo-500" />
                        <span>{relPhotos} Photos</span>
                      </Link>
                      <Link
                        href={`/model/${rel.slug}/videos`}
                        className="text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1"
                      >
                        <VideoIcon className="w-3 h-3 text-rose-500" />
                        <span>{relVideos} Videos</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Associated Tags & Keyword Topics (Positioned below Explore More Models) */}
        {allModelTags.length > 0 && (
          <section className="pt-10 border-t border-slate-200 space-y-3">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  Associated Tags &amp; Keyword Topics ({allModelTags.length})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Follow tags to explore related model collections
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {allModelTags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tag/${t.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors shadow-2xs"
                  >
                    #{t.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Global Trending Tags Section */}
        {trendingTags.length > 0 && (
          <section className="pt-10 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              Explore More Popular Categories &amp; Search Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tag/${t.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 transition-colors"
                >
                  #{t.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      </main>

      {/* SEO-Optimized Footer */}
      <PublicFooter />
    </div>
  );
}
