import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  SITE_URL,
  SITE_NAME,
  slugify,
  getMediaSlug,
  formatSeoTitle,
  formatSeoDescription,
} from "@/lib/seo";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import {
  ChevronRight,
  Home,
  Image as ImageIcon,
  Video as VideoIcon,
  Tag,
  Users,
  Flame,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tagLabel = unslugify(slug);
  const capitalTag = capitalizeWords(tagLabel);

  await connectDB();

  // Count models matching this exact tag/keyword across all levels
  const tagPattern = new RegExp(slug.replace(/-/g, "[ _-]"), "i");

  const count = await Model.countDocuments({
    status: "published",
    $or: [
      { tags: { $regex: tagPattern } },
      { metaKeywords: { $regex: tagPattern } },
      { "photosSeo.metaKeywords": { $regex: tagPattern } },
      { "videosSeo.metaKeywords": { $regex: tagPattern } },
      { "media.keywords": { $regex: tagPattern } },
      { "media.title": { $regex: tagPattern } },
      { "media.alt": { $regex: tagPattern } },
      { name: { $regex: tagPattern } },
    ],
  });

  const baseTitle = `${capitalTag} HD Videos, MMS Leaks & Photos`;
  const title = formatSeoTitle(baseTitle);
  const rawDesc = `Stream ${tagLabel} latest full HD sex videos, viral leaked clips, photoshoot pictures, and 4K uncensored content on ${SITE_NAME}. Free instant streaming.`;
  const fallbackDesc = `Watch ${tagLabel} HD videos, photos and exclusive streaming content on ${SITE_NAME}. High-definition clips and photo galleries updated daily.`;
  const description = formatSeoDescription(rawDesc, fallbackDesc);
  const url = `${SITE_URL}/tag/${slug}`;

  return {
    title: { absolute: title },
    description,
    keywords: `${tagLabel}, ${tagLabel} videos, ${tagLabel} sex videos, ${tagLabel} leaks, ${tagLabel} photos, ${tagLabel} hd, ${tagLabel} mms, ${tagLabel} streaming, ${SITE_NAME}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: count > 0 ? "index, follow" : "noindex, follow",
  };
}

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tagLabel = unslugify(slug);
  const capitalTag = capitalizeWords(tagLabel);

  let models: any[] = [];
  let allTags: string[] = [];

  try {
    await connectDB();

    // Flexible regex pattern for exact tag / phrase matching
    const tagPattern = new RegExp(slug.replace(/-/g, "[ _-]"), "i");

    models = await Model.find({
      status: "published",
      $or: [
        { tags: { $regex: tagPattern } },
        { metaKeywords: { $regex: tagPattern } },
        { "photosSeo.metaKeywords": { $regex: tagPattern } },
        { "videosSeo.metaKeywords": { $regex: tagPattern } },
        { "media.keywords": { $regex: tagPattern } },
        { "media.title": { $regex: tagPattern } },
        { "media.alt": { $regex: tagPattern } },
        { name: { $regex: tagPattern } },
      ],
    })
      .select("name slug profileImage coverImage category tags metaKeywords photosSeo videosSeo media bio updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    // Collect all unique tags from matching models for "Related Tags" section
    const tagSet = new Set<string>();
    models.forEach((m) => {
      m.tags?.forEach((t: string) => {
        const ts = slugify(t);
        if (ts !== slug) tagSet.add(t);
      });
    });
    allTags = Array.from(tagSet).slice(0, 20);
  } catch (error) {
    console.error("TagPage DB error:", error);
  }

  if (models.length === 0) {
    notFound();
  }

  // Structured Data — CollectionPage + BreadcrumbList
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${capitalTag} — HD Videos & Photos`,
    url: `${SITE_URL}/tag/${slug}`,
    description: `Collection of ${tagLabel} exclusive uncensored videos, 4K streaming clips, and HD photo galleries on ${SITE_NAME}.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: models.length,
      itemListElement: models.map((m: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Person",
          name: m.name,
          url: `${SITE_URL}/model/${m.slug}`,
          image: m.profileImage || m.coverImage || undefined,
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tags", item: `${SITE_URL}/sitemaps/tags` },
      { "@type": "ListItem", position: 3, name: capitalTag, item: `${SITE_URL}/tag/${slug}` },
    ],
  };

  // Compute total media items across all matched models
  const totalVideos = models.reduce(
    (sum, m) => sum + (m.media?.filter((x: any) => x.type === "video").length || 0),
    0
  );
  const totalPhotos = models.reduce(
    (sum, m) => sum + (m.media?.filter((x: any) => x.type === "photo").length || 0),
    0
  );

  const modelNames = models.map((m) => m.name).join(", ");

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header Search */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <HeaderSearch />
          </div>
        </div>
      </header>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1">
        <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-400 mb-6"
          >
            <Link href="/" className="hover:text-slate-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/models" className="hover:text-slate-600 transition-colors">
              Models
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-semibold">{capitalTag}</span>
          </nav>

          {/* Tag Title & Stats */}
          <header className="mb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Keyword Archive &amp; Media Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              {capitalTag} Leaked Videos &amp; HD Photos
            </h1>

            {/* Rich Intent Editorial Article (150+ Words for Google Keyword Ranking & BERT Understanding) */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                Watch exclusive <strong>{tagLabel}</strong> full-length video clips, hot photoshoot galleries, and viral leaked media updates on {SITE_NAME}. This dedicated archive aggregates all verified material associated with <strong>{modelNames}</strong>, featuring ultra HD 1080p and 4K streaming quality.
              </p>
              <p>
                Explore uncensored scenes, private app streams, saree shoots, bikini sets, and exclusive content updated directly from official creator feeds. Browse through <strong>{totalVideos} video{totalVideos !== 1 ? "s" : ""}</strong> and <strong>{totalPhotos} photo{totalPhotos !== 1 ? "s" : ""}</strong> across {models.length} creator portfolio{models.length !== 1 ? "s" : ""}, optimized with direct high-speed playback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <Users className="w-3.5 h-3.5 text-rose-500" />
                {models.length} Model{models.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <VideoIcon className="w-3.5 h-3.5 text-rose-500" />
                {totalVideos} Video{totalVideos !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                {totalPhotos} Photo{totalPhotos !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium ml-auto">
                <ShieldCheck className="w-4 h-4" /> 100% Verified HD Content
              </span>
            </div>
          </header>

          {/* Model Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Featured {capitalTag} Creators &amp; Profiles
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {models.map((model: any) => {
                const videoCount = model.media?.filter((m: any) => m.type === "video").length || 0;
                const photoCount = model.media?.filter((m: any) => m.type === "photo").length || 0;
                return (
                  <div
                    key={model._id.toString()}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <Link
                      href={`/model/${model.slug}`}
                      className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden block"
                    >
                      <img
                        src={model.profileImage || model.coverImage || ""}
                        alt={`${model.name} ${tagLabel} HD photos and sex videos`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="font-bold text-sm leading-tight truncate">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {videoCount > 0 && `${videoCount} videos`}
                          {videoCount > 0 && photoCount > 0 && " · "}
                          {photoCount > 0 && `${photoCount} photos`}
                        </p>
                      </div>
                    </Link>

                    {/* Direct Links to Photos & Videos Hubs for Strong Crawlability */}
                    <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                      <Link
                        href={`/model/${model.slug}/photos`}
                        className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3 text-indigo-500" />
                        <span>{photoCount} Photos</span>
                      </Link>
                      <Link
                        href={`/model/${model.slug}/videos`}
                        className="text-slate-600 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      >
                        <VideoIcon className="w-3 h-3 text-rose-500" />
                        <span>{videoCount} Videos</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inline Video Previews Section — first videos from matching models */}
          {totalVideos > 0 && (
            <section className="mt-12 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Latest {capitalTag} Videos — Watch Full Streams
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {models
                  .flatMap((model: any) =>
                    (model.media || [])
                      .filter((m: any) => m.type === "video")
                      .slice(0, 6)
                      .map((v: any, idx: number) => ({
                        ...v,
                        modelName: model.name,
                        modelSlug: model.slug,
                        vIdx: idx,
                      }))
                  )
                  .slice(0, 12)
                  .map((v: any, idx: number) => {
                    const mediaSlug = getMediaSlug(v, "video", v.vIdx);
                    return (
                      <div
                        key={`${v.modelSlug}-${idx}`}
                        className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <Link
                          href={`/model/${v.modelSlug}/video/${mediaSlug}`}
                          className="block relative aspect-video w-full bg-slate-900 overflow-hidden"
                        >
                          {v.thumbnail ? (
                            <img
                              src={v.thumbnail}
                              alt={v.title || `${v.modelName} ${tagLabel} video`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <VideoIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-rose-600/50 group-hover:bg-rose-600/80 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                              <VideoIcon className="w-5 h-5" />
                            </div>
                          </div>
                        </Link>
                        <div className="p-3">
                          <Link
                            href={`/model/${v.modelSlug}/video/${mediaSlug}`}
                            className="text-sm font-bold text-slate-900 truncate block group-hover:text-rose-600 transition-colors"
                          >
                            {v.title || `${v.modelName} Video`}
                          </Link>
                          <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                            <Link
                              href={`/model/${v.modelSlug}`}
                              className="hover:text-rose-600 font-medium"
                            >
                              {v.modelName}
                            </Link>
                            <Link
                              href={`/model/${v.modelSlug}/videos`}
                              className="text-[10px] font-bold text-rose-600 hover:underline"
                            >
                              All Videos →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* Related Tags — Dense Internal Linking */}
          {allTags.length > 0 && (
            <section className="mt-12 pt-8 border-t border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                Related Searches &amp; Trending Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => {
                  const ts = slugify(t);
                  return (
                    <Link
                      key={t}
                      href={`/tag/${ts}`}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors shadow-xs"
                    >
                      #{t}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Back to Home */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
            <Link
              href="/"
              className="text-sm font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5"
            >
              ← Browse All Models on {SITE_NAME}
            </Link>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
