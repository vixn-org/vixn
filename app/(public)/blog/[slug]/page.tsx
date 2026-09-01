import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import BlogPost from "@/lib/models/blog";
import Model from "@/lib/models/model";
import { generateBlogMetadata, generateBlogJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  ChevronRight,
  Home,
  BookOpen,
  Share2,
  Tag,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await BlogPost.findOne({ slug, status: "published" }).lean();
    if (!blog) {
      return {
        title: "Article Not Found | VIXN Blog",
      };
    }
    return generateBlogMetadata(blog);
  } catch {
    return {
      title: "VIXN Blog Article",
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
            className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4 pt-2 tracking-tight scroll-mt-20 border-b border-slate-100 pb-2"
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
            className="text-xl font-bold text-slate-900 mt-8 mb-3 tracking-tight scroll-mt-20"
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
            className="border-l-4 border-rose-500 bg-rose-50/50 rounded-r-2xl p-4 sm:p-6 my-6 text-slate-800 italic font-serif text-base leading-relaxed"
          >
            {quoteText}
          </blockquote>
        );
      }

      // Bullet list
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((i) => i.replace(/^[-*]\s*/, ""));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 my-4 text-slate-700 text-sm sm:text-base leading-relaxed pl-2">
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
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <img
                src={imgMatch[2]}
                alt={imgMatch[1] || blog.title}
                className="w-full h-auto object-cover max-h-[600px]"
                loading="lazy"
              />
            </div>
            {imgMatch[1] && (
              <figcaption className="text-center text-xs text-slate-500 italic">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
      }

      // Regular Paragraph
      return (
        <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  const publishDateStr = new Date(
    blog.publishedAt || blog.createdAt
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
      <nav aria-label="Breadcrumb" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600 mb-8">
        <Link href="/" className="hover:text-rose-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/blog" className="hover:text-rose-600 transition-colors">
          Blog
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-rose-600 font-bold truncate max-w-[200px]">
          {blog.category}
        </span>
      </nav>

      {/* Main Article Header */}
      <header className="max-w-4xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider border border-rose-100">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{blog.category}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {blog.excerpt}
          </p>
        )}

        {/* Author & Meta Box */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img
              src={blog.author?.avatar || "/logo.jpg"}
              alt={blog.author?.name || "Author"}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left">
              <p className="font-bold text-slate-900">{blog.author?.name || "VIXN Editorial"}</p>
              <p className="text-[11px] text-slate-400">{blog.author?.role || "Content Editor"}</p>
            </div>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Published {publishDateStr}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{blog.readingTime || 3} min read</span>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      {blog.coverImage && (
        <div className="max-w-5xl mx-auto my-10 aspect-16/9 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900">
          <img
            src={blog.coverImage}
            alt={blog.coverImageAlt || blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Layout Grid (Article + Sidebar TOC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto mt-6">
        {/* Main Article Body */}
        <article className="lg:col-span-8 space-y-4">
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
            {renderFormattedContent(blog.content)}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-8 mt-10 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Tags:</span>
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Box */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 mt-10 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={blog.author?.avatar || "/logo.jpg"}
              alt={blog.author?.name || "Author"}
              className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {blog.author?.name || "VIXN Editorial"}
                </h4>
                <Badge variant="outline" className="text-[10px] text-slate-500">
                  {blog.author?.role || "Staff Writer"}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {blog.author?.bio ||
                  "Covering adult modeling trends, creator spotlights, high-definition photo galleries, and digital content distribution on VIXN."}
              </p>
            </div>
          </div>
        </article>

        {/* Sticky Sidebar: Table of Contents & Cross Links */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-6">
            {/* Table of Contents Widget */}
            {headings.length > 0 && (
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-500" />
                  Table of Contents
                </h4>
                <nav className="space-y-1.5">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-xs transition-colors hover:text-rose-600 ${
                        h.level === 3
                          ? "pl-3 text-slate-500"
                          : "font-semibold text-slate-700"
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
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    Featured In This Article
                  </h4>
                </div>
                <div className="space-y-3 pt-1">
                  {relatedModels.map((model: any) => (
                    <Link
                      key={model._id.toString()}
                      href={`/model/${model.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                    >
                      <img
                        src={model.profileImage || model.coverImage || "/logo.jpg"}
                        alt={model.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {model.media?.length || 0} media assets
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                asChild
                className="w-full rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
              >
                <Link href="/blog">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to All Articles
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Related Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-20 pt-12 border-t border-slate-200 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Related Articles &amp; Insights
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                More stories in {blog.category}
              </p>
            </div>
            <Link
              href="/blog"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
            >
              View All Blog Posts <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((rel: any) => (
              <Link
                key={rel._id.toString()}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                <div className="aspect-16/10 w-full bg-slate-100 overflow-hidden relative">
                  {rel.coverImage ? (
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
                      VIXN
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {rel.readingTime || 3} min read
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
