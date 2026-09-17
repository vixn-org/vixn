import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import BlogPost from "@/lib/models/blog";
import Model from "@/lib/models/model";
import { generateBlogMetadata, generateBlogJsonLd } from "@/lib/seo";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await BlogPost.findOne({ slug, status: "published" }).lean();
    if (!blog) {
      return {
        title: { absolute: "Article Not Found | VIXN Blog" },
      };
    }
    return generateBlogMetadata(blog);
  } catch {
    return {
      title: { absolute: "VIXN Blog Article | VIXN" },
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const blog = await BlogPost.findOne({ slug, status: "published" }).lean();
  if (!blog) {
    notFound();
  }

  // Fetch related models for internal linking
  const relatedModels =
    blog.relatedModelSlugs && blog.relatedModelSlugs.length > 0
      ? await Model.find({
          slug: { $in: blog.relatedModelSlugs },
          status: "published",
        })
          .select("name slug profileImage coverImage category media bio")
          .lean()
      : [];

  // Fetch 3 related blog articles
  const relatedArticles = await BlogPost.find({
    _id: { $ne: blog._id },
    status: "published",
    category: blog.category,
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  const { articleSchema, breadcrumbSchema } = generateBlogJsonLd(blog);

  // Extract Table of Contents from content headings
  const headings: { text: string; id: string; level: number }[] = [];
  const lines = (blog.content || "").split("\n");
  lines.forEach((line) => {
    if (line.startsWith("## ")) {
      const text = line.replace("## ", "").trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      headings.push({ text, id, level: 2 });
    } else if (line.startsWith("### ")) {
      const text = line.replace("### ", "").trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      headings.push({ text, id, level: 3 });
    }
  });

  // Basic markdown parser for paragraphs, headings, blockquotes, lists, images
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H2
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace("## ", "");
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        return (
          <h2
            key={idx}
            id={id}
            className="text-2xl sm:text-3xl font-black text-white mt-10 mb-4 pt-2 tracking-tight scroll-mt-24 border-none"
          >
            {text}
          </h2>
        );
      }

      // H3
      if (trimmed.startsWith("### ")) {
        const text = trimmed.replace("### ", "");
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        return (
          <h3
            key={idx}
            id={id}
            className="text-xl font-bold text-white mt-8 mb-3 tracking-tight scroll-mt-24 border-none"
          >
            {text}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        const quoteText = trimmed.replace(/^>\s*/gm, "");
        return (
          <blockquote
            key={idx}
            className="border-none bg-white/[0.04] rounded-2xl p-5 sm:p-6 my-6 text-slate-200 italic font-serif text-base leading-relaxed shadow-md"
          >
            {quoteText}
          </blockquote>
        );
      }

      // Bullet list
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((i) => i.replace(/^[-*]\s*/, ""));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 my-4 text-slate-300 text-sm sm:text-base leading-relaxed pl-2">
            {items.map((item, i) => (
              <li key={i} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      // Image tag ![alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        return (
          <figure key={idx} className="my-8 space-y-2">
            <div className="rounded-2xl overflow-hidden bg-[#0e1424] shadow-xl border-none">
              <img
                src={imgMatch[2]}
                alt={imgMatch[1] || blog.title}
                className="w-full h-auto object-cover max-h-[600px]"
                loading="lazy"
              />
            </div>
            {imgMatch[1] && (
              <figcaption className="text-center text-xs text-slate-400 italic">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
      }

      // Regular Paragraph
      return (
        <p key={idx} className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  const publishDateStr = new Date(
    blog.publishedAt || (blog as any).createdAt
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-slate-100">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121826]/85 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-300 border-none mb-8 overflow-x-auto whitespace-nowrap"
      >
        <Link href="/" className="hover:text-rose-400 transition-colors flex items-center gap-1">
          <HomeRoundedIcon sx={{ fontSize: 15 }} />
          <span>Home</span>
        </Link>
        <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
        <Link href="/blog" className="hover:text-rose-400 transition-colors">
          Blog
        </Link>
        <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} className="shrink-0" />
        <span className="text-rose-400 font-bold truncate max-w-[200px]">
          {blog.category}
        </span>
      </nav>

      {/* Main Article Header */}
      <header className="max-w-4xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold uppercase tracking-wider border-none shadow-md">
          <MenuBookRoundedIcon sx={{ fontSize: 16 }} />
          <span>{blog.category}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            {blog.excerpt}
          </p>
        )}

        {/* Author & Meta Box */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-none text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <img
              src={(blog as any).author?.avatar || "/logo.jpg"}
              alt={(blog as any).author?.name || "Author"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/[0.1]"
            />
            <div className="text-left">
              <p className="font-bold text-white">{(blog as any).author?.name || "VIXN Editorial"}</p>
              <p className="text-[11px] text-slate-400">{(blog as any).author?.role || "Content Editor"}</p>
            </div>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <CalendarMonthRoundedIcon sx={{ fontSize: 15 }} />
            <span>Published {publishDateStr}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
            <span>{(blog as any).readingTime || (blog as any).readTime || 3} min read</span>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      {blog.coverImage && (
        <div className="max-w-5xl mx-auto my-10 aspect-16/9 rounded-3xl overflow-hidden shadow-2xl bg-[#0e1424] border-none">
          <img
            src={blog.coverImage}
            alt={(blog as any).coverImageAlt || blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Layout Grid (Article + Sidebar TOC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto mt-6 items-start">
        {/* Main Article Body */}
        <article className="lg:col-span-8 space-y-4">
          <div className="text-slate-300 leading-relaxed font-sans">
            {renderFormattedContent(blog.content)}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-8 mt-10 border-none">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Tags:</span>
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.05] text-slate-300 text-xs font-semibold border-none"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Box */}
          <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl mt-10 flex flex-col sm:flex-row items-center gap-4 border-none">
            <img
              src={(blog as any).author?.avatar || "/logo.jpg"}
              alt={(blog as any).author?.name || "Author"}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/[0.1] shrink-0"
            />
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-sm font-bold text-white">
                  {(blog as any).author?.name || "VIXN Editorial"}
                </h4>
                <span className="text-[10px] font-bold bg-white/[0.08] text-rose-300 px-2.5 py-0.5 rounded-full border-none">
                  {(blog as any).author?.role || "Staff Writer"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {(blog as any).author?.bio ||
                  "Covering adult modeling trends, creator spotlights, high-definition photo galleries, and digital content distribution on VIXN."}
              </p>
            </div>
          </div>
        </article>

        {/* Sticky Sidebar: Table of Contents & Cross Links */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Table of Contents Widget */}
            {headings.length > 0 && (
              <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3 border-none">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FormatListBulletedRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                  <span>Table of Contents</span>
                </h4>
                <nav className="space-y-2 pt-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-xs transition-colors hover:text-rose-400 ${
                        h.level === 3
                          ? "pl-3 text-slate-400"
                          : "font-semibold text-slate-200"
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Cross-Linked Related Models (Internal Linking Equity) */}
            {relatedModels && relatedModels.length > 0 && (
              <div className="bg-[#121826]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3 border-none">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                  <span>Featured In This Article</span>
                </h4>
                <div className="space-y-2.5 pt-1">
                  {relatedModels.map((model: any) => (
                    <Link
                      key={model._id.toString()}
                      href={`/model/${model.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-all group border-none"
                    >
                      <img
                        src={model.profileImage || model.coverImage || "/logo.jpg"}
                        alt={model.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/[0.1] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {model.media?.length || 0} media assets
                        </p>
                      </div>
                      <ChevronRightRoundedIcon sx={{ fontSize: 16, color: "#64748b" }} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog Button */}
            <div className="pt-1">
              <Link
                href="/blog"
                className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-xs shadow-md inline-flex items-center justify-center gap-1.5 border-none transition-colors"
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 15 }} />
                <span>Back to All Articles</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Related Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-20 pt-12 space-y-6 max-w-5xl mx-auto border-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white">
                Related Articles &amp; Insights
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                More stories in {blog.category}
              </p>
            </div>
            <Link
              href="/blog"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Blog Posts</span>
              <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((rel: any) => (
              <Link
                key={rel._id.toString()}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col rounded-2xl bg-[#121826]/90 backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-none"
              >
                <div className="aspect-16/10 w-full bg-[#0e1424] overflow-hidden relative">
                  {rel.coverImage ? (
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500 font-bold text-sm">
                      VIXN
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-transparent">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {rel.readingTime || rel.readTime || 3} min read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
