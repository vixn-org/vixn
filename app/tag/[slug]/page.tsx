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
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

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

  const baseTitle = `${capitalTag} - Videos & Photos`;
  const title = formatSeoTitle(baseTitle);
  const rawDesc = `Browse ${tagLabel} HD videos, photos and exclusive content on ${SITE_NAME}. High-definition clips and photo galleries updated daily.`;
  const fallbackDesc = `Watch ${tagLabel} HD videos, photos and streaming content on ${SITE_NAME}. Updated daily with fresh galleries.`;
  const description = formatSeoDescription(rawDesc, fallbackDesc);
  const url = `${SITE_URL}/tag/${slug}`;

  return {
    title: { absolute: title },
    description,
    keywords: `${tagLabel}, ${tagLabel} videos, ${tagLabel} photos, ${tagLabel} hd, ${tagLabel} gallery, ${SITE_NAME}`,
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

export const revalidate = 3600;

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
      .select(
        "name slug profileImage coverImage category tags metaKeywords photosSeo videosSeo media bio updatedAt"
      )
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
    name: `${capitalTag} - Videos & Photos`,
    url: `${SITE_URL}/tag/${slug}`,
    description: `Collection of ${tagLabel} videos, streaming clips, and photo galleries on ${SITE_NAME}.`,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Tag",
        item: `${SITE_URL}/tag`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: capitalTag,
        item: `${SITE_URL}/tag/${slug}`,
      },
    ],
  };

  // Compute total media items across all matched models
  const totalVideos = models.reduce(
    (sum, m) =>
      sum + (m.media?.filter((x: any) => x.type === "video").length || 0),
    0
  );
  const totalPhotos = models.reduce(
    (sum, m) =>
      sum + (m.media?.filter((x: any) => x.type === "photo").length || 0),
    0
  );

  const modelNames = models.map((m) => m.name).join(", ");

  return (
    <PublicMuiThemeProvider>
      <section className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
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
                href="/tag"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border-none"
              >
                All Tags
              </Link>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 border-none">
                #{tagLabel}
              </span>
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <main className="flex-1 pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
            {/* Breadcrumb Navigation Bar */}
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
                href="/tag"
                className="hover:text-rose-400 transition-colors"
              >
                Tag
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
              <span className="text-rose-400 font-bold truncate max-w-[200px]">
                {capitalTag}
              </span>
            </nav>

            {/* Tag Title & Stats Card */}
            <header className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border-none">
                  <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                  <span>Keyword Archive &amp; Media Hub</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {capitalTag} — Videos &amp; Photos
                </h1>
              </div>

              {/* Rich Intent Editorial Article (150+ Words for Google Keyword Ranking & BERT Understanding) */}
              <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-md p-6 sm:p-7 shadow-2xl text-sm text-slate-300 leading-relaxed space-y-3 border-none">
                <p>
                  Browse <strong className="text-white font-bold">{tagLabel}</strong> video clips, photo galleries,
                  and exclusive media on {SITE_NAME}. This collection features
                  verified content from <strong className="text-white font-bold">{modelNames}</strong> in HD and 4K
                  quality.
                </p>
                <p>
                  Explore photo sets, video streams, and exclusive content updated
                  regularly. Browse through{" "}
                  <strong className="text-white font-bold">
                    {totalVideos} video{totalVideos !== 1 ? "s" : ""}
                  </strong>{" "}
                  and{" "}
                  <strong className="text-white font-bold">
                    {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""}
                  </strong>{" "}
                  across {models.length} creator portfolio
                  {models.length !== 1 ? "s" : ""}.
                </p>
              </div>

              {/* Metric Quick Stats Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-semibold bg-white/[0.05] hover:bg-white/[0.08] px-4 py-2 rounded-md shadow-md border-none transition-colors">
                  <PeopleAltRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                  <span>
                    <strong className="text-white font-bold">{models.length}</strong> Model{models.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold bg-white/[0.05] hover:bg-white/[0.08] px-4 py-2 rounded-md shadow-md border-none transition-colors">
                  <VideocamRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                  <span>
                    <strong className="text-white font-bold">{totalVideos}</strong> Video{totalVideos !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold bg-white/[0.05] hover:bg-white/[0.08] px-4 py-2 rounded-md shadow-md border-none transition-colors">
                  <PhotoCameraRoundedIcon sx={{ fontSize: 16, color: "#818cf8" }} />
                  <span>
                    <strong className="text-white font-bold">{totalPhotos}</strong> Photo{totalPhotos !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold ml-auto bg-emerald-500/10 px-3.5 py-1.5 rounded-md border-none">
                  <ShieldRoundedIcon sx={{ fontSize: 16 }} />
                  <span>100% Verified HD Content</span>
                </div>
              </div>
            </header>

            {/* Model Grid */}
            <section className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Featured {capitalTag} Creators &amp; Profiles
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Discover verified adult creators matching {tagLabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {models.map((model: any) => {
                  const videoCount =
                    model.media?.filter((m: any) => m.type === "video").length ||
                    0;
                  const photoCount =
                    model.media?.filter((m: any) => m.type === "photo").length ||
                    0;

                  return (
                    <div
                      key={model._id.toString()}
                      className="group flex flex-col border-none bg-transparent transition-all duration-300"
                    >
                      {/* Portrait Thumbnail */}
                      <Link
                        href={`/model/${model.slug}`}
                        className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 block"
                      >
                        <img
                          src={model.profileImage || model.coverImage || "/logo.jpg"}
                          alt={`${model.name} ${tagLabel} HD photos and sex videos`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        {/* Verified Badge Overlay */}
                        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 border-none">
                          <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#10b981" }} />
                          <span>VERIFIED</span>
                        </div>

                        {model.category && (
                          <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-300 shadow-md border-none">
                            {model.category}
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="font-bold text-base leading-tight truncate drop-shadow-sm group-hover:text-rose-400 transition-colors">
                            {model.name}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {videoCount > 0 && `${videoCount} videos`}
                            {videoCount > 0 && photoCount > 0 && " • "}
                            {photoCount > 0 && `${photoCount} photos`}
                          </p>
                        </div>
                      </Link>

                      {/* Direct Links to Photos & Videos Hubs for Strong Crawlability - Completely Transparent */}
                      <div className="pt-2.5 pb-1 px-0.5 flex items-center justify-between gap-2 text-[11px] font-bold bg-transparent border-none">
                        <Link
                          href={`/model/${model.slug}/photos`}
                          className="flex-1 py-1.5 px-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 border-none text-center"
                        >
                          <PhotoCameraRoundedIcon sx={{ fontSize: 13, color: "#818cf8" }} />
                          <span>{photoCount} Photos</span>
                        </Link>
                        <Link
                          href={`/model/${model.slug}/videos`}
                          className="flex-1 py-1.5 px-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 border-none text-center"
                        >
                          <VideocamRoundedIcon sx={{ fontSize: 13, color: "#f43f5e" }} />
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
              <section className="pt-12 space-y-6 border-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Latest {capitalTag} Videos
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Stream HD &amp; 4K video clips matching this keyword
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      const videoPoster =
                        v.thumbnail ||
                        models.find((m) => m.slug === v.modelSlug)?.profileImage ||
                        "/logo.jpg";
                      const vidTitle = v.title || `${v.modelName} Video Clip`;

                      return (
                        <div
                          key={`${v.modelSlug}-${idx}`}
                          className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
                        >
                          {/* Video Player Card */}
                          <Link
                            href={`/model/${v.modelSlug}/video/${mediaSlug}`}
                            className="relative aspect-video w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
                          >
                            <img
                              src={videoPoster}
                              alt={v.title || `${v.modelName} ${tagLabel} video`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />

                            {/* Play Button Overlay - visible only on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="w-13 h-13 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-transform">
                                <PlayArrowRoundedIcon sx={{ fontSize: 30 }} />
                              </div>
                            </div>
                          </Link>

                          {/* Video Info Below Thumbnail - Completely Transparent */}
                          <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
                            <Link
                              href={`/model/${v.modelSlug}/video/${mediaSlug}`}
                              className="block"
                            >
                              <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                                {vidTitle}
                              </h4>
                            </Link>

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 bg-transparent border-none">
                              <Link
                                href={`/model/${v.modelSlug}`}
                                className="hover:text-white font-semibold transition-colors truncate max-w-[140px]"
                              >
                                {v.modelName}
                              </Link>
                              <Link
                                href={`/model/${v.modelSlug}/videos`}
                                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-0.5"
                              >
                                <span>All Videos</span>
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

            {/* Related Tags — Dense Internal Linking */}
            {allTags.length > 0 && (
              <section className="pt-12 space-y-4 border-none">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-rose-500/15 text-rose-400">
                    <LocalOfferRoundedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Related Searches &amp; Trending Tags
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allTags.map((t) => {
                    const ts = slugify(t);
                    return (
                      <Link
                        key={t}
                        href={`/tag/${ts}`}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-all border-none shadow-md"
                      >
                        #{t}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Back to Home Navigation Pill */}
            <div className="pt-8 pb-4 flex justify-center border-none">
              <Link
                href="/models"
                className="px-5 py-2.5 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-2 shadow-md border-none"
              >
                <span>Browse All Models on {SITE_NAME}</span>
                <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
              </Link>
            </div>
          </div>
        </main>

        <PublicFooter />
      </section>
    </PublicMuiThemeProvider>
  );
}
