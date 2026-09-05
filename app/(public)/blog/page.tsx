import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import BlogPost, { type IBlogPost } from "@/lib/models/blog";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Home,
  Tag,
  ArrowRight,
  Search,
  Flame,
  FileText,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const dynamic = "force-dynamic";

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
      .select("title slug excerpt category coverImage publishedAt readTime tags featured")
      .lean(),
    BlogPost.countDocuments(query),
    BlogPost.findOne({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .select("title slug excerpt category coverImage publishedAt readTime tags")
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
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
      <nav aria-label="Breadcrumb" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600">
        <Link href="/" className="hover:text-rose-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Blog</span>
        {category && category !== "all" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-rose-600 font-bold capitalize">{category}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider border border-rose-100">
          <BookOpen className="w-3.5 h-3.5" />
          <span>VIXN Editorial &amp; Creator Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Articles, Insights &amp; Industry Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Explore modeling insights, high-definition photography tips, creator spotlights, and platform guides.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = (category || "all") === cat;
          const href = cat === "all" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;
          return (
            <Link
              key={cat}
              href={href}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All Articles" : cat}
            </Link>
          );
        })}
      </div>

      {/* Featured Article Card (Shown on page 1 without specific filter) */}
      {!category && !search && currentPage === 1 && featuredBlog && (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto relative bg-slate-900 overflow-hidden">
              {featuredBlog.coverImage ? (
                <img
                  src={featuredBlog.coverImage}
                  alt={featuredBlog.coverImageAlt || featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-rose-950 text-white font-bold text-4xl">
                  VIXN Blog
                </div>
              )}
              <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured Post
              </div>
            </div>

            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span className="text-rose-600 font-bold uppercase tracking-wider">
                    {featuredBlog.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {featuredBlog.readingTime || 3} min read
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-tight">
                  <Link href={`/blog/${featuredBlog.slug}`}>
                    {featuredBlog.title}
                  </Link>
                </h2>

                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredBlog.excerpt || "Read the full in-depth article on VIXN..."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredBlog.author?.avatar || "/logo.jpg"}
                    alt={featuredBlog.author?.name || "Author"}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{featuredBlog.author?.name || "VIXN Editorial"}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(featuredBlog.publishedAt || featuredBlog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-all group-hover:translate-x-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Cards Grid */}
      {blogs.length === 0 ? (
        <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Articles Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            New editorial articles are currently being written and published. Check back shortly for fresh content.
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog._id.toString()}
              className="group flex flex-col rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Cover Image */}
              <Link href={`/blog/${blog.slug}`} className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 block">
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.coverImageAlt || blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-2xl">
                    VIXN
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-rose-600 uppercase tracking-wider shadow-xs border border-white/50">
                  {blog.category}
                </div>
              </Link>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readingTime || 3} min read
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>

                  {blog.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <img
                      src={blog.author?.avatar || "/logo.jpg"}
                      alt={blog.author?.name || "Author"}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-slate-700 font-bold truncate max-w-[120px]">
                      {blog.author?.name || "Editorial"}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-bold"
                  >
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Next Page
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
