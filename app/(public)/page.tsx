import Link from "next/link";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateFaqJsonLd,
  generateHomepageItemListJsonLd,
} from "@/lib/seo";
import FAQAccordion, { type FAQItem } from "@/components/public/faq-accordion";

import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

export const revalidate = 3600;

interface PublicModel {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
  bio?: string;
  category?: string;
  tags?: string[];
  profileImage?: string;
  coverImage?: string;
  featured?: boolean;
  cornerstone?: boolean;
  status?: string;
  media?: Array<{
    _id?: unknown;
    type: "photo" | "video";
    url: string;
    title?: string;
    alt?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const faqsList: FAQItem[] = [
  {
    question: "What is Vixn.fun?",
    answer:
      "Vixn.fun is a free online platform where you can watch and explore videos and photos of popular pornstars and adult models in one place.",
    category: "General Overview",
  },
  {
    question: "Is Vixn.fun free to use?",
    answer:
      "Yes, Vixn.fun is completely free to browse and watch. You can enjoy a large collection of videos and photos without creating an account.",
    category: "Access & Pricing",
  },
  {
    question: "How can I find videos of a specific pornstar on Vixn.fun?",
    answer:
      "Simply use the search bar or go to the Models section and type the pornstar’s name. Each star has a dedicated page with all their available videos and photos.",
    category: "Discovery & Search",
  },
  {
    question: "Does Vixn.fun have HD and 4K videos?",
    answer:
      "Yes, most videos on Vixn.fun are available in HD quality, and many popular scenes are also available in higher resolutions.",
    category: "Media Quality",
  },
  {
    question: "Can I download videos from Vixn.fun?",
    answer:
      "Currently, videos are available for online streaming. Download options may be added in the future for premium users.",
    category: "Features & Downloads",
  },
  {
    question: "How often is new content added to Vixn.fun?",
    answer:
      "New videos and model pages are added regularly. Popular and trending pornstars are updated frequently so you always find fresh content.",
    category: "Content Updates",
  },
  {
    question: "Is Vixn.fun safe to use?",
    answer:
      "Yes. Vixn.fun uses secure connections (HTTPS) and does not require personal information to watch videos. We also take content rights seriously.",
    category: "Safety & Privacy",
  },
  {
    question: "Do I need to create an account to watch videos?",
    answer:
      "No. You can watch most content without signing up. Creating an account is optional and only needed if you want to save favorites or access extra features.",
    category: "Accounts & Membership",
  },
  {
    question: "How do I request a specific pornstar or video?",
    answer:
      "You can use the “Request a Model” or contact form available on the website. Popular requests are prioritized.",
    category: "Requests & Community",
  },
  {
    question: "Is Vixn.fun available on mobile?",
    answer:
      "Yes. Vixn.fun is fully mobile-friendly and works smoothly on smartphones and tablets.",
    category: "Mobile & Devices",
  },
];

export default async function HomePage() {
  let models: PublicModel[] = [];

  try {
    await connectDB();
    models = (await Model.find({ status: "published" })
      .sort("-createdAt")
      .lean()) as unknown as PublicModel[];
  } catch (error) {
    console.error("HomePage DB connection warning:", error);
  }

  const featuredModels = models.filter((m) => m.featured);
  const totalPhotos = models.reduce(
    (acc, m) =>
      acc + (m.media?.filter((item) => item.type === "photo").length || 0),
    0
  );
  const totalVideos = models.reduce(
    (acc, m) =>
      acc + (m.media?.filter((item) => item.type === "video").length || 0),
    0
  );

  // Extract unique categories
  const categories = Array.from(
    new Set(models.map((m) => m.category).filter(Boolean))
  ) as string[];

  const faqSchema = generateFaqJsonLd(faqsList);
  const itemListSchema = generateHomepageItemListJsonLd(
    models.map((m) => ({ name: m.name, slug: m.slug }))
  );

  return (
    <div className="space-y-16 pb-20 text-slate-100">
      {/* Structured Data JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-20 border-none">
        {/* Ambient Dark Gradient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border-none shadow-md">
            <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
            <span>100% Free 4K &amp; HD Media Streaming</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-5xl mx-auto">
            Watch Free HD Videos &amp; Nude Photos of{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
              Top Models
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed pt-1">
            Free HD videos of popular pornstars, trending models, and exclusive
            photo galleries — updated daily with fresh content.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#all-models"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-xl shadow-rose-900/40 transition-all hover:scale-105 border-none"
            >
              <WhatshotRoundedIcon sx={{ fontSize: 20 }} />
              <span>Explore Models</span>
            </Link>
            <Link
              href="#featured-models"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-base shadow-md transition-all hover:scale-105 border-none"
            >
              <VideocamRoundedIcon sx={{ fontSize: 20, color: "#f43f5e" }} />
              <span>Watch Trending Videos</span>
            </Link>
          </div>

          {/* Stats Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="bg-[#121826]/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3.5 border-none">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                <PeopleAltRoundedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white leading-tight">
                  {models.length}
                </div>
                <div className="text-xs font-semibold text-slate-400">Models</div>
              </div>
            </div>

            <div className="bg-[#121826]/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3.5 border-none">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <PhotoCameraRoundedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white leading-tight">
                  {totalPhotos}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  4K Photos
                </div>
              </div>
            </div>

            <div className="bg-[#121826]/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3.5 border-none">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                <VideocamRoundedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white leading-tight">
                  {totalVideos}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  HD Videos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      {featuredModels.length > 0 && (
        <section
          id="featured-models"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                <WhatshotRoundedIcon sx={{ fontSize: 16 }} />
                <span>Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Featured Creators
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Curated by VIXN Editorial
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredModels.map((model) => {
              const photoCount =
                model.media?.filter((m) => m.type === "photo").length || 0;
              const videoCount =
                model.media?.filter((m) => m.type === "video").length || 0;

              return (
                <div
                  key={model._id.toString()}
                  className="group flex flex-col border-none bg-transparent transition-all duration-300"
                >
                  {/* Top Image Banner */}
                  <Link
                    href={`/model/${model.slug}`}
                    className="relative aspect-4/3 w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
                  >
                    <img
                      src={
                        model.coverImage ||
                        model.profileImage ||
                        "/logo.jpg"
                      }
                      alt={`${model.name} featured on VIXN.fun`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Featured Tag */}
                    <div className="absolute top-3.5 left-3.5 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-none">
                      <WhatshotRoundedIcon sx={{ fontSize: 13 }} />
                      <span>Featured</span>
                    </div>

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between text-white">
                      <div className="flex items-center gap-3">
                        {model.profileImage && (
                          <img
                            src={model.profileImage}
                            alt={model.name}
                            className="w-12 h-12 rounded-md object-cover ring-2 ring-white/[0.1] shadow-lg shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-rose-400 transition-colors">
                              {model.name}
                            </h3>
                            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                          </div>
                          {model.category && (
                            <p className="text-xs text-slate-300 mt-0.5">
                              {model.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Body Content - Transparent */}
                  <div className="pt-3 pb-1 px-0.5 flex-1 flex flex-col justify-between space-y-3 bg-transparent border-none">
                    {model.bio ? (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {model.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Click to view full profile, photos and video gallery.
                      </p>
                    )}

                    {/* Tags */}
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {model.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold bg-white/[0.05] text-slate-300 px-2.5 py-0.5 rounded-full border-none"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Quick Links */}
                    <div className="pt-1 flex items-center justify-between text-xs font-semibold text-slate-400 border-none bg-transparent">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                          <PhotoCameraRoundedIcon sx={{ fontSize: 14, color: "#818cf8" }} />
                          {photoCount}
                        </span>
                        {videoCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                            <VideocamRoundedIcon sx={{ fontSize: 14, color: "#f43f5e" }} />
                            {videoCount}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/model/${model.slug}`}
                        className="text-rose-400 group-hover:text-rose-300 inline-flex items-center gap-1 font-bold text-xs transition-colors"
                      >
                        <span>Open Folder</span>
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

      {/* Complete Models Directory */}
      <section
        id="all-models"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              All Creator Models
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse through our complete database of verified models
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">
                Categories:
              </span>
              {categories.slice(0, 6).map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-slate-300 border-none"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {models.length === 0 ? (
          <div className="py-24 text-center rounded-md bg-[#121826]/60 border-none">
            <WhatshotRoundedIcon sx={{ fontSize: 48, color: "#64748b" }} className="mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">
              Fresh Creator Galleries Coming Soon
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              New model profiles and 4K media sets are currently being indexed.
              Check back shortly for updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {models.map((model) => {
              const photoCount =
                model.media?.filter((m) => m.type === "photo").length || 0;
              const videoCount =
                model.media?.filter((m) => m.type === "video").length || 0;

              return (
                <div
                  key={model._id.toString()}
                  className="group flex flex-col border-none bg-transparent transition-all duration-300"
                >
                  {/* Media Preview Thumbnail */}
                  <Link
                    href={`/model/${model.slug}`}
                    className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 block"
                  >
                    {model.profileImage || model.coverImage ? (
                      <img
                        src={model.profileImage || model.coverImage}
                        alt={model.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#0e1424] text-slate-500 font-bold text-4xl">
                        {model.name.charAt(0)}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Verified Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 border-none">
                      <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#10b981" }} />
                      <span>VERIFIED</span>
                    </div>

                    {/* Category Badge */}
                    {model.category && (
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-300 shadow-md border-none">
                        {model.category}
                      </span>
                    )}

                    {/* Media Counts on Thumbnail */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <p className="font-bold text-sm leading-tight truncate group-hover:text-rose-400 transition-colors">
                        {model.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                        <span>{videoCount}V</span>
                        <span>•</span>
                        <span>{photoCount}P</span>
                      </div>
                    </div>
                  </Link>

                  {/* Body Content - Completely Transparent */}
                  <div className="pt-2.5 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-2 bg-transparent border-none">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Fast-Crawl Internal Linking & Tags Hub */}
      <section
        id="directory-index"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
                <span>Directory Index</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Explore All Creators &amp; Categories
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Direct fast crawl links for search engines &amp; visitors
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {models.map((model) => (
              <Link
                key={model._id.toString()}
                href={`/model/${model.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-slate-300 hover:text-white shadow-md transition-all flex items-center gap-1.5 border-none"
              >
                <span>{model.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({model.media?.length || 0})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Authority & Editorial Guide Section */}
      <section
        id="about-vixn"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border-none">
          <div className="relative z-10 space-y-10">
            {/* Section Header */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} />
                <span>Editorial Guide &amp; Platform Standards</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                The Premier Destination for Model Galleries &amp;
                High-Definition Media
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Vixn.fun is your free destination for hot girl XXX videos, nude
                photos, and exclusive adult content. Browse high-quality HD and
                4K videos of popular pornstars, Indian hot girls, desi models,
                and trending influencers. Explore dedicated model pages with
                photo galleries, video collections, and detailed profiles. New
                content is added regularly so you can always find the latest and
                most searched hot girls in one place.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-white/[0.04] rounded-2xl p-6 shadow-md space-y-3 border-none">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <ShieldRoundedIcon sx={{ fontSize: 22 }} />
                </div>
                <h3 className="text-base font-bold text-white">
                  100% Verified Profiles
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every model portfolio on VIXN undergoes identity and content
                  verification to ensure genuine, high-quality, and official
                  media sets.
                </p>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 shadow-md space-y-3 border-none">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                  <BoltRoundedIcon sx={{ fontSize: 22 }} />
                </div>
                <h3 className="text-base font-bold text-white">
                  Ultra-Fast 4K CDN Streaming
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Powered by edge-accelerated CDN infrastructure, enjoying
                  seamless high-definition media browsing with instant loading
                  and zero lag.
                </p>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 shadow-md space-y-3 border-none">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <TravelExploreRoundedIcon sx={{ fontSize: 22 }} />
                </div>
                <h3 className="text-base font-bold text-white">
                  Structured SEO Discovery
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Organized by categories, bio insights, tags, and internal link
                  routing to make exploring top trending talent intuitive and
                  accessible.
                </p>
              </div>
            </div>

            {/* Editorial Articles / Search Engine Text */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-xs text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">
                  Curated Portfolios &amp; Exclusive Content Sets
                </h4>
                <p>
                  Explore thousands of authentic photo sets and video streams
                  with full-screen interactive lightbox viewing. Each model
                  profile features detailed biography information, social
                  presence, and organized folders for seamless browsing across
                  mobile and desktop devices.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">
                  Daily Updates &amp; Trending Model Discoveries
                </h4>
                <p>
                  Our directory is continuously updated with fresh creator
                  highlights, high-resolution studio shoots, and verified media
                  streams. Use our instant search and category navigation to
                  discover your favorite adult creators in one secure hub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Robust SEO FAQs Section */}
      <section
        id="faq-section"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border-none space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
              <HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Everything about VIXN.fun
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Explore answers to common questions regarding model verification,
              media quality, search optimization, and platform infrastructure.
            </p>
          </div>

          {/* Interactive FAQ Accordion */}
          <FAQAccordion items={faqsList} />
        </div>
      </section>
    </div>
  );
}
