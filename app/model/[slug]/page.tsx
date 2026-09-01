import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model, { type IMediaItem } from "@/lib/models/model";
import { generateModelMetadata, generateModelJsonLd } from "@/lib/seo";
import ModelGalleryViewer from "@/components/public/model-gallery-viewer";
import ModelInfoAccordion from "@/components/public/model-info-accordion";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import AdsterraBanner from "@/components/ads/adsterra-banner";
import AdsterraNativeBanner from "@/components/ads/adsterra-native";
import AdsterraSidebars from "@/components/ads/adsterra-sidebars";
import { ADS_ENABLED } from "@/lib/ads-config";
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
      return { title: "Model Not Found | VIXN" };
    }

    return generateModelMetadata(model);
  } catch (error) {
    console.error("generateMetadata DB error:", error);
    return { title: `${slug} | VIXN` };
  }
}

export const dynamic = "force-dynamic";

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  let model: any = null;
  let relatedModels: any[] = [];

  try {
    await connectDB();

    // Case-insensitive search for resilience
    model = await Model.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    }).lean();

    if (model) {
      relatedModels = await Model.find({
        _id: { $ne: model._id },
        status: "published",
      })
        .limit(4)
        .select("name slug profileImage coverImage category media")
        .lean();
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Side Ads (160x600 Skyscrapers) */}
      <AdsterraSidebars />

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
          <Link href="/#featured-models" className="hover:text-rose-600 transition-colors">
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

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-slate-500">
                  {model.category && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {model.category}
                    </span>
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

            {/* Quick Metrics Cards */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-start sm:justify-end">
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Photos
                </div>
                <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <ImageIcon className="w-4 h-4 text-rose-500" />
                  {photos.length}
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Videos
                </div>
                <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <VideoIcon className="w-4 h-4 text-violet-500" />
                  {videos.length}
                </div>
              </div>

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

          {/* Tags & Focus Keywords */}
          {((model.tags && model.tags.length > 0) ||
            (model.metaKeywords && model.metaKeywords.length > 0)) && (
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags:
              </span>
              {model.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100"
                >
                  #{tag}
                </span>
              ))}
              {model.metaKeywords
                ?.filter((kw: string) => !model.tags?.includes(kw))
                .slice(0, 4)
                .map((kw: string) => (
                  <span
                    key={kw}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {kw}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Profile Top Banner Ads */}
        <AdsterraBanner size="728x90" label />
        <AdsterraBanner size="468x60" />
        <AdsterraBanner size="320x50" />
        <AdsterraNativeBanner />

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

            {/* Smartlink Fast Download CTA */}
            {ADS_ENABLED && (
              <a
                href="https://www.profitableratecpmnetwork.com/mbhhhzyzh?key=e3577dc8038eab2cc7d5221531c0f23f"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Download Full 4K Pack</span>
              </a>
            )}
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

          {/* Expandable Model Information / SEO Article Accordion */}
          <ModelInfoAccordion
            content={model.aboutContent}
            bio={model.bio}
            modelName={model.name}
          />
        </section>

        {/* Bottom Profile Banner Ads */}
        <div className="flex flex-wrap items-center justify-center gap-4 my-6">
          <AdsterraBanner size="300x250" label />
          <AdsterraBanner size="160x600" label />
          <AdsterraBanner size="160x300" label />
        </div>
        <AdsterraBanner size="728x90" label />
        <AdsterraNativeBanner />

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
                href="/"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                View Directory <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedModels.map((rel: any) => (
                <Link
                  key={rel._id.toString()}
                  href={`/model/${rel.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-3/4 w-full bg-slate-100 overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="font-bold text-sm leading-tight truncate">
                        {rel.name}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {rel.media?.length || 0} media sets
                      </p>
                    </div>
                  </div>
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
