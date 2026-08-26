import Link from "next/link";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  generateWebsiteJsonLd,
  generateFaqJsonLd,
  generateHomepageItemListJsonLd,
} from "@/lib/seo";
import FAQAccordion, { type FAQItem } from "@/components/public/faq-accordion";
import ExoclickBanner from "@/components/ads/exoclick-banner";
import {
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  Flame,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

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
    0,
  );
  const totalVideos = models.reduce(
    (acc, m) =>
      acc + (m.media?.filter((item) => item.type === "video").length || 0),
    0,
  );

  // Extract unique categories
  const categories = Array.from(
    new Set(models.map((m) => m.category).filter(Boolean)),
  ) as string[];

  const websiteJsonLd = generateWebsiteJsonLd();
  const faqSchema = generateFaqJsonLd(faqsList);
  const itemListSchema = generateHomepageItemListJsonLd(
    models.map((m) => ({ name: m.name, slug: m.slug })),
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Structured Data JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-slate-50/40 to-white pt-16 pb-20 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Watch Hot Girl XXX Videos & Nude Photos{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Free
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Free HD videos of popular pornstars, Indian hot girls, and trending
            models — updated daily. Buttons: Explore Models | Watch Trending
            Videos
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#all-models"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
            >
              <Flame className="w-5 h-5" />
              Explore Models
            </Link>
            <Link
              href="#featured-models"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold text-base shadow-xs transition-all hover:border-slate-300"
            >
              <VideoIcon className="w-5 h-5 text-violet-600" />
              Watch Trending Videos
            </Link>
          </div>

          {/* Stats Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-900">
                  {models.length}
                </div>
                <div className="text-xs font-medium text-slate-500">Models</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-900">
                  {totalPhotos}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  4K Photos
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <VideoIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-900">
                  {totalVideos}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  HD Videos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ExoclickBanner label />
      </div>

      {/* Featured Creators Section */}
      {featuredModels.length > 0 && (
        <section
          id="featured-models"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Spotlight
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Featured Creators
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-500">
              Curated by VIXN Editorial
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredModels.map((model) => {
              const photoCount =
                model.media?.filter((m) => m.type === "photo").length || 0;
              const videoCount =
                model.media?.filter((m) => m.type === "video").length || 0;

              return (
                <Link
                  key={model._id.toString()}
                  href={`/model/${model.slug}`}
                  className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Top Image Banner */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        model.coverImage ||
                        model.profileImage ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
                      }
                      alt={`${model.name} featured on VIXN.fun`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Featured Tag */}
                    <div className="absolute top-4 left-4 bg-rose-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </div>

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div className="flex items-center gap-3">
                        {model.profileImage && (
                          <img
                            src={model.profileImage}
                            alt={model.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-lg leading-tight">
                              {model.name}
                            </h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          </div>
                          {model.category && (
                            <p className="text-xs text-slate-200 mt-0.5">
                              {model.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {model.bio ? (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {model.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Click to view full profile, photos and video gallery.
                      </p>
                    )}

                    {/* Tags */}
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {model.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Metadata */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                          {photoCount}
                        </span>
                        {videoCount > 0 && (
                          <span className="flex items-center gap-1">
                            <VideoIcon className="w-3.5 h-3.5 text-violet-500" />
                            {videoCount}
                          </span>
                        )}
                      </div>
                      <span className="text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-bold">
                        View Folder <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Complete Models Directory */}
      <section
        id="all-models"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              All Creator Models
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse through our complete database of models
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">
                Categories:
              </span>
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {models.length === 0 ? (
          <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Flame className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              Fresh Creator Galleries Coming Soon
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              New model profiles and 4K media sets are currently being indexed.
              Check back shortly for updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => {
              const photoCount =
                model.media?.filter((m) => m.type === "photo").length || 0;
              const videoCount =
                model.media?.filter((m) => m.type === "video").length || 0;

              return (
                <Link
                  key={model._id.toString()}
                  href={`/model/${model.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 hover:border-rose-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Media Preview / Cover */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                    {model.profileImage || model.coverImage ? (
                      <img
                        src={model.profileImage || model.coverImage}
                        alt={model.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-4xl">
                        {model.name.charAt(0)}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Category Badge */}
                    {model.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-rose-600 shadow-xs border border-white/50">
                        {model.category}
                      </span>
                    )}

                    {/* Media Counts */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                        <ImageIcon className="w-3 h-3 text-rose-400" />
                        {photoCount}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                        <VideoIcon className="w-3 h-3 text-violet-400" />
                        {videoCount}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                          {model.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>

                      {model.bio && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {model.bio}
                        </p>
                      )}
                    </div>

                    {/* Tags preview */}
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {model.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                        {model.tags.length > 3 && (
                          <span className="text-[10px] font-medium text-slate-400 self-center">
                            +{model.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Folder Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        Open Folder
                      </span>
                      <span className="text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all font-black">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Middle Banner Ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ExoclickBanner label />
      </div>

      {/* Fast-Crawl Internal Linking & Tags Hub */}
      <section
        id="directory-index"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                Directory Index
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Explore All Creators &amp; Categories
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Direct fast crawl links for search engines &amp; visitors
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {models.map((model) => (
              <Link
                key={model._id.toString()}
                href={`/model/${model.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-rose-600 hover:border-rose-300 shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
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

      {/* SEO Authority & Editorial Guide Section (Light Mode) */}
      <section
        id="about-vixn"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-slate-50/80 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-10">
            {/* Section Header */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
                <Award className="w-4 h-4" />
                Editorial Guide &amp; Platform Standards
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                The Premier Destination for Model Galleries &amp;
                High-Definition Media
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
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
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  100% Verified Profiles
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every model portfolio on VIXN undergoes identity and content
                  verification to ensure genuine, high-quality, and official
                  media sets.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Ultra-Fast 4K CDN Streaming
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Powered by edge-accelerated CDN infrastructure, enjoying
                  seamless high-definition media browsing with instant loading
                  and zero lag.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Structured SEO Discovery
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organized by categories, bio insights, tags, and internal link
                  routing to make exploring top trending talent intuitive and
                  accessible.
                </p>
              </div>
            </div>

            {/* Editorial Articles / Search Engine Text */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
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
                <h4 className="text-sm font-bold text-slate-900">
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
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Everything about VIXN.fun
            </h2>
            <p className="text-sm text-slate-600 mt-2">
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
