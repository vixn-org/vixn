import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import BlogPost from "@/lib/models/blog";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Blog & Creator Insights | VIXN" },
  description:
    "Explore in-depth articles, modeling guides, photography highlights, and creator insights on the official VIXN Blog. Tips and trends updated regularly.",
  keywords: [
    "modeling blog",
    "creator guides",
    "photography insights",
    "vixn articles",
    "model spotlights",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog & Creator Insights | VIXN",
    description:
      "Explore in-depth articles, modeling guides, photography highlights, and industry trends on VIXN.",
    url: `${SITE_URL}/blog`,
    siteName: "VIXN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "VIXN Blog & Creator Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Creator Insights | VIXN Articles",
    description:
      "Explore in-depth articles, modeling guides, photography highlights, and industry trends on VIXN.",
    images: [`${SITE_URL}/logo.jpg`],
  },
};

interface Props {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogDirectoryPage({ searchParams }: Props) {
  const { category, search, page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  await connectDB();

  // Query filter
  const query: Record<string, any> = { status: "published" };
  if (category && category !== "all") {
    query.category = category;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const [blogs, totalBlogs, featuredBlog] = await Promise.all([
    BlogPost.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title slug excerpt category coverImage publishedAt readTime readingTime tags featured author"
      )
      .lean(),
    BlogPost.countDocuments(query),
    BlogPost.findOne({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .select(
        "title slug excerpt category coverImage publishedAt readTime readingTime tags author"
      )
      .lean(),
  ]);

  const totalPages = Math.ceil(totalBlogs / limit);

  // Categories list
  const categories = [
    "all",
    "Guides",
    "Model Spotlights",
    "Industry News",
    "Photo Shoots",
    "Features",
  ];

  // CollectionPage JSON-LD schema
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VIXN Blog & Creator Insights",
    url: `${SITE_URL}/blog`,
    description:
      "Explore in-depth articles, modeling guides, and photography insights on VIXN.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogs.map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: blog.title,
        url: `${SITE_URL}/blog/${blog.slug}`,
      })),
    },
  };

  // BreadcrumbList JSON-LD schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
    ],
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-slate-100">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
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
        <span className="text-rose-400 font-bold">Blog</span>
        {category && category !== "all" && (
          <>
            <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
            <span className="text-slate-300 font-bold capitalize">
              {category}
            </span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold uppercase tracking-wider border-none shadow-md">
          <MenuBookRoundedIcon sx={{ fontSize: 16 }} />
          <span>VIXN Editorial &amp; Creator Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Articles, Insights &amp; Industry Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          Explore modeling insights, high-definition photography tips, creator
          spotlights, and platform guides.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = (category || "all") === cat;
          const href =
            cat === "all"
              ? "/blog"
              : `/blog?category=${encodeURIComponent(cat)}`;
          return (
            <Link
              key={cat}
              href={href}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border-none ${
                isActive
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                  : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {cat === "all" ? "All Articles" : cat}
            </Link>
          );
        })}
      </div>

      {/* Featured Article Card (Shown on page 1 without specific filter) */}
      {!category && !search && currentPage === 1 && featuredBlog && (
        <div className="rounded-3xl bg-[#121826]/90 backdrop-blur-2xl overflow-hidden shadow-2xl transition-all duration-300 group border-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <Link
              href={`/blog/${featuredBlog.slug}`}
              className="lg:col-span-7 aspect-16/10 lg:aspect-auto relative bg-[#0e1424] overflow-hidden block"
            >
              {featuredBlog.coverImage ? (
                <img
                  src={featuredBlog.coverImage}
                  alt={(featuredBlog as any).coverImageAlt || featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500 font-bold text-4xl">
                  VIXN Blog
                </div>
              )}
              <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 border-none">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
                <span>Featured Post</span>
              </div>
            </Link>

            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                  <span className="text-rose-400 font-bold uppercase tracking-wider">
                    {featuredBlog.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                    {(featuredBlog as any).readingTime || (featuredBlog as any).readTime || 3} min read
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-rose-400 transition-colors leading-tight">
                  <Link href={`/blog/${featuredBlog.slug}`}>
                    {featuredBlog.title}
                  </Link>
                </h2>

                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {featuredBlog.excerpt ||
                    "Read the full in-depth article on VIXN..."}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-none">
                <div className="flex items-center gap-2.5">
                  <img
                    src={(featuredBlog as any).author?.avatar || "/logo.jpg"}
                    alt={(featuredBlog as any).author?.name || "Author"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/[0.08]"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {(featuredBlog as any).author?.name || "VIXN Editorial"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(
                        featuredBlog.publishedAt || (featuredBlog as any).createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-all group-hover:translate-x-1"
                >
                  <span>Read Article</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Cards Grid */}
      {blogs.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-[#121826]/60 border-none space-y-3">
          <MenuBookRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} className="mx-auto" />
          <h3 className="text-lg font-bold text-white">
            No Articles Found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            New editorial articles are currently being written and published.
            Check back shortly for fresh content.
          </p>
          <Link
            href="/blog"
            className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold border-none transition-colors"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogs.map((blog) => (
            <article
              key={blog._id.toString()}
              className="group flex flex-col border-none bg-transparent transition-all duration-300"
            >
              {/* Cover Image */}
              <Link
                href={`/blog/${blog.slug}`}
                className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
              >
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={(blog as any).coverImageAlt || blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500 font-bold text-2xl">
                    VIXN
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-400 uppercase tracking-wider shadow-md border-none">
                  {blog.category}
                </div>
              </Link>

              {/* Body - Transparent */}
              <div className="pt-3 pb-1 px-0.5 flex-1 flex flex-col justify-between space-y-3 bg-transparent border-none">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <CalendarMonthRoundedIcon sx={{ fontSize: 13 }} />
                      {new Date(
                        blog.publishedAt || (blog as any).createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                      {(blog as any).readingTime || (blog as any).readTime || 3} min read
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>

                  {blog.excerpt && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-2 flex items-center justify-between text-xs font-semibold border-none bg-transparent">
                  <div className="flex items-center gap-2">
                    <img
                      src={(blog as any).author?.avatar || "/logo.jpg"}
                      alt={(blog as any).author?.name || "Author"}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white/[0.1]"
                    />
                    <span className="text-slate-300 font-bold truncate max-w-[120px] text-[11px]">
                      {(blog as any).author?.name || "Editorial"}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-rose-400 group-hover:text-rose-300 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 font-bold text-[11px]"
                  >
                    <span>Read</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 flex items-center justify-between border-none">
          <span className="text-xs text-slate-400 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className="px-4 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-200 hover:text-white transition-all border-none inline-flex items-center gap-1 shadow-md"
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                <span>Previous</span>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all border-none inline-flex items-center gap-1"
              >
                <span>Next Page</span>
                <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
