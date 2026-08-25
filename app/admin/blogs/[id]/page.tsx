"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  ArrowLeft,
  ExternalLink,
  Search,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Globe,
  Share2,
  Clock,
  BookOpen,
  X,
  Plus,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
  };
  readingTime: number;
  status: "draft" | "published";
  featured: boolean;
  publishedAt?: string;

  // SEO Fields
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsDirective: string;
  focusKeyphrase: string;
  cornerstone: boolean;
  relatedModelSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [modelSlugInput, setModelSlugInput] = useState("");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${blogId}`);
        const data = await res.json();
        if (res.ok && data.blog) {
          setBlog({
            ...data.blog,
            author: data.blog.author || {
              name: "VIXN Editorial",
              role: "Senior Content Editor",
              avatar: "/logo.jpg",
              bio: "",
            },
            tags: data.blog.tags || [],
            metaKeywords: data.blog.metaKeywords || [],
            relatedModelSlugs: data.blog.relatedModelSlugs || [],
          });
        } else {
          toast.error("Failed to load article");
          router.push("/admin/blogs");
        }
      } catch {
        toast.error("Network error loading blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [blogId, router]);

  const updateField = (field: keyof BlogData, value: any) => {
    setBlog((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateAuthorField = (field: string, value: string) => {
    setBlog((prev) =>
      prev
        ? {
            ...prev,
            author: { ...prev.author, [field]: value },
          }
        : null
    );
  };

  const handleSave = async () => {
    if (!blog) return;
    if (!blog.title.trim()) {
      toast.error("Article title cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Blog article saved & updated successfully!");
        setBlog(data.blog);
      } else {
        toast.error(data.error || "Failed to save changes");
      }
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  // Helper formatting for markdown content editor
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea || !blog) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = blog.content || "";
    const selected = current.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent =
      current.substring(0, start) + replacement + current.substring(end);
    updateField("content", newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 0);
  };

  // Tags & Keywords Handlers
  const handleAddTag = () => {
    if (!tagInput.trim() || !blog) return;
    const clean = tagInput.trim().toLowerCase();
    if (!blog.tags.includes(clean)) {
      updateField("tags", [...blog.tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!blog) return;
    updateField("tags", blog.tags.filter((t) => t !== tag));
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim() || !blog) return;
    const clean = keywordInput.trim();
    if (!blog.metaKeywords.includes(clean)) {
      updateField("metaKeywords", [...blog.metaKeywords, clean]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    if (!blog) return;
    updateField("metaKeywords", blog.metaKeywords.filter((k) => k !== kw));
  };

  const handleAddRelatedModel = () => {
    if (!modelSlugInput.trim() || !blog) return;
    const clean = slugify(modelSlugInput.trim());
    if (!blog.relatedModelSlugs.includes(clean)) {
      updateField("relatedModelSlugs", [...blog.relatedModelSlugs, clean]);
    }
    setModelSlugInput("");
  };

  const handleRemoveRelatedModel = (slug: string) => {
    if (!blog) return;
    updateField(
      "relatedModelSlugs",
      blog.relatedModelSlugs.filter((s) => s !== slug)
    );
  };

  // Real-Time SEO Health Analyzer calculations
  const seoAudit = useMemo(() => {
    if (!blog) return { score: 0, checks: [] };

    const title = blog.metaTitle || blog.title || "";
    const description = blog.metaDescription || blog.excerpt || "";
    const content = blog.content || "";
    const keyphrase = (blog.focusKeyphrase || "").toLowerCase().trim();
    const words = content.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const checks: {
      name: string;
      status: "pass" | "warn" | "fail";
      message: string;
    }[] = [];

    // 1. Focus Keyphrase Check
    if (keyphrase) {
      checks.push({
        name: "Focus Keyphrase",
        status: "pass",
        message: `Set to "${blog.focusKeyphrase}"`,
      });
    } else {
      checks.push({
        name: "Focus Keyphrase",
        status: "warn",
        message: "No focus keyphrase configured",
      });
    }

    // 2. Keyphrase in Title
    if (keyphrase && title.toLowerCase().includes(keyphrase)) {
      checks.push({
        name: "Keyphrase in Title",
        status: "pass",
        message: "Keyphrase appears in the article title",
      });
    } else if (keyphrase) {
      checks.push({
        name: "Keyphrase in Title",
        status: "warn",
        message: "Add focus keyphrase to title for maximum SERP relevance",
      });
    }

    // 3. Keyphrase in Meta Description
    if (keyphrase && description.toLowerCase().includes(keyphrase)) {
      checks.push({
        name: "Keyphrase in Description",
        status: "pass",
        message: "Keyphrase present in snippet description",
      });
    } else if (keyphrase) {
      checks.push({
        name: "Keyphrase in Description",
        status: "warn",
        message: "Include keyphrase in meta description",
      });
    }

    // 4. Keyphrase in Content Intro
    const intro100 = words.slice(0, 100).join(" ").toLowerCase();
    if (keyphrase && intro100.includes(keyphrase)) {
      checks.push({
        name: "Keyphrase in Introduction",
        status: "pass",
        message: "Keyphrase appears in first 100 words",
      });
    } else if (keyphrase) {
      checks.push({
        name: "Keyphrase in Introduction",
        status: "warn",
        message: "Mention keyphrase early in the introduction",
      });
    }

    // 5. Title Length (40 - 65 chars ideal)
    if (title.length >= 40 && title.length <= 65) {
      checks.push({
        name: "Title Length",
        status: "pass",
        message: `Optimal length (${title.length}/65 chars)`,
      });
    } else if (title.length > 65) {
      checks.push({
        name: "Title Length",
        status: "warn",
        message: `Title is long (${title.length} chars), may truncate in Google SERP`,
      });
    } else {
      checks.push({
        name: "Title Length",
        status: "warn",
        message: `Title is short (${title.length}/65 chars)`,
      });
    }

    // 6. Meta Description Length (120 - 160 chars ideal)
    if (description.length >= 120 && description.length <= 160) {
      checks.push({
        name: "Description Length",
        status: "pass",
        message: `Optimal length (${description.length}/160 chars)`,
      });
    } else if (description.length > 160) {
      checks.push({
        name: "Description Length",
        status: "warn",
        message: `Description is long (${description.length} chars), will be truncated`,
      });
    } else if (description.length > 0) {
      checks.push({
        name: "Description Length",
        status: "warn",
        message: `Description is short (${description.length}/160 chars)`,
      });
    } else {
      checks.push({
        name: "Meta Description",
        status: "fail",
        message: "Provide a meta description for search snippets",
      });
    }

    // 7. Word Count Check
    if (wordCount >= 800) {
      checks.push({
        name: "Word Count",
        status: "pass",
        message: `Comprehensive in-depth article (${wordCount} words)`,
      });
    } else if (wordCount >= 300) {
      checks.push({
        name: "Word Count",
        status: "pass",
        message: `Good length (${wordCount} words)`,
      });
    } else {
      checks.push({
        name: "Word Count",
        status: "warn",
        message: `Article is short (${wordCount} words). Aim for 300+ words`,
      });
    }

    // 8. Headings Check
    if (content.includes("## ") || content.includes("### ")) {
      checks.push({
        name: "Heading Hierarchy",
        status: "pass",
        message: "Article uses H2/H3 subheadings",
      });
    } else {
      checks.push({
        name: "Heading Hierarchy",
        status: "warn",
        message: "Use ## subheadings to organize content",
      });
    }

    // Calculate score
    const passCount = checks.filter((c) => c.status === "pass").length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  }, [blog]);

  if (loading || !blog) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading Article Editor...</p>
      </div>
    );
  }

  const wordCount = blog.content ? blog.content.split(/\s+/).filter(Boolean).length : 0;
  const computedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-slate-200 text-slate-700"
          >
            <Link href="/admin/blogs">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 line-clamp-1">
              {blog.title || "Untitled Article"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="secondary"
                className={
                  blog.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                    : "bg-slate-100 text-slate-600 text-[10px]"
                }
              >
                {blog.status === "published" ? "Published Live" : "Draft"}
              </Badge>
              <span className="text-[11px] text-slate-400 font-mono">
                /blog/{blog.slug}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-slate-200 text-slate-700"
          >
            <Link href={`/blog/${blog.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Preview Post
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-xs">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-xl font-semibold text-xs py-2 px-4"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Article Content &amp; Details
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-xl font-semibold text-xs py-2 px-4"
          >
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Real-Time SEO Strategy ({seoAudit.score}%)
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB 1: ARTICLE CONTENT ========== */}
        <TabsContent value="content">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Columns: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Article Fundamentals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Article Title (H1)</Label>
                    <Input
                      value={blog.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="e.g. Complete Guide to 2026 Model Photography"
                      className="rounded-xl border-slate-200 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">URL Route Slug</Label>
                      <Input
                        value={blog.slug}
                        onChange={(e) => updateField("slug", slugify(e.target.value))}
                        className="rounded-xl border-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Category</Label>
                      <Select
                        value={blog.category}
                        onValueChange={(v) => updateField("category", v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="Guides">Guides &amp; Tutorials</SelectItem>
                          <SelectItem value="Model Spotlights">Model Spotlights</SelectItem>
                          <SelectItem value="Industry News">Industry News</SelectItem>
                          <SelectItem value="Photo Shoots">Photo Shoots</SelectItem>
                          <SelectItem value="Features">Features &amp; Trends</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">
                      Summary / Lead Excerpt ({blog.excerpt?.length || 0}/500 chars)
                    </Label>
                    <Textarea
                      rows={3}
                      value={blog.excerpt}
                      onChange={(e) => updateField("excerpt", e.target.value)}
                      placeholder="Introductory teaser shown on blog listing cards and search snippet fallback..."
                      className="rounded-xl border-slate-200 text-xs leading-relaxed max-h-28 overflow-y-auto resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rich Markdown Content Editor */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Article Body (Markdown Supported)
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Use headings, paragraphs, lists, and images to craft engaging content.
                      </CardDescription>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-3">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>~{computedReadingTime} min read</span>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("## ", "\n")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Heading 2"
                    >
                      <Heading1 className="w-3.5 h-3.5 mr-1" /> H2
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("### ", "\n")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Heading 3"
                    >
                      <Heading2 className="w-3.5 h-3.5 mr-1" /> H3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("**", "**")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("*", "*")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("\n- ", "")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("\n> ", "\n")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Blockquote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("![Image description](", ")")}
                      className="h-7 px-2 text-xs rounded-lg border-slate-200"
                      title="Insert Image"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1" /> Image
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    id="content-editor"
                    rows={18}
                    value={blog.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    placeholder="Write article content using markdown..."
                    className="rounded-xl border-slate-200 font-mono text-xs leading-relaxed"
                  />
                </CardContent>
              </Card>

              {/* Tags & Internal Linking */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Article Tags &amp; Cross-Linking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tags */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Article Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. photography, glamour, lighting"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-slate-900 text-white rounded-xl text-xs"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {blog.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 border-slate-200 gap-1 rounded-full px-3"
                        >
                          #{tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Related Model Slugs */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-bold text-slate-700">
                      Related Models (Internal Link Equity)
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Cross-link model galleries within this article to boost internal Google PageRank.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. aditi-mistry"
                        value={modelSlugInput}
                        onChange={(e) => setModelSlugInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRelatedModel())}
                        className="rounded-xl border-slate-200 text-xs font-mono"
                      />
                      <Button
                        type="button"
                        onClick={handleAddRelatedModel}
                        className="bg-slate-900 text-white rounded-xl text-xs"
                      >
                        Add Model
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {blog.relatedModelSlugs.map((slug) => (
                        <Badge
                          key={slug}
                          variant="secondary"
                          className="bg-rose-50 text-rose-700 border-rose-200 gap-1 rounded-full px-3"
                        >
                          /model/{slug}
                          <button onClick={() => handleRemoveRelatedModel(slug)} className="ml-1 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar: Cover Image, Author, Visibility */}
            <div className="space-y-6">
              {/* Publication Status */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Visibility &amp; Publish Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Status</Label>
                    <Select
                      value={blog.status}
                      onValueChange={(v) => updateField("status", v as "draft" | "published")}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="published">Published (Visible to All)</SelectItem>
                        <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <Label className="text-xs font-bold text-slate-900">Featured Article</Label>
                      <p className="text-[11px] text-slate-500">Showcase in blog hero banner</p>
                    </div>
                    <Switch
                      checked={blog.featured}
                      onCheckedChange={(v) => updateField("featured", v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900">Featured Cover Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Image URL</Label>
                    <Input
                      value={blog.coverImage}
                      onChange={(e) => updateField("coverImage", e.target.value)}
                      placeholder="https://..."
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Image Alt Text (SEO)</Label>
                    <Input
                      value={blog.coverImageAlt}
                      onChange={(e) => updateField("coverImageAlt", e.target.value)}
                      placeholder="Descriptive text for Google Image search..."
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                  {blog.coverImage && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={blog.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Author Information */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900">Author Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Author Name</Label>
                    <Input
                      value={blog.author?.name || ""}
                      onChange={(e) => updateAuthorField("name", e.target.value)}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Author Role</Label>
                    <Input
                      value={blog.author?.role || ""}
                      onChange={(e) => updateAuthorField("role", e.target.value)}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Author Avatar URL</Label>
                    <Input
                      value={blog.author?.avatar || ""}
                      onChange={(e) => updateAuthorField("avatar", e.target.value)}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========== TAB 2: ADVANCED SEO STRATEGY ========== */}
        <TabsContent value="seo" className="space-y-6">
          {/* Real-time SEO Health Audit Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xs ${
                  seoAudit.score >= 80
                    ? "bg-emerald-500 text-white"
                    : seoAudit.score >= 50
                    ? "bg-amber-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {seoAudit.score}%
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Real-Time SEO Health Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluated across keyphrase optimization, content depth, headings, and snippet parameters.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {seoAudit.checks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  {check.status === "pass" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : check.status === "warn" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                  <span className="font-bold text-slate-800">{check.name}:</span>
                  <span className="text-slate-600 text-[11px]">{check.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SERP & Social Card Previews */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Google Search Result Preview */}
            <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Google Search Snippet Preview
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Simulated search result in Google Search Console / SERP.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setSerpDevice("desktop")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      serpDevice === "desktop" ? "bg-white shadow-xs text-slate-900" : "text-slate-500"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setSerpDevice("mobile")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      serpDevice === "mobile" ? "bg-white shadow-xs text-slate-900" : "text-slate-500"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                      V
                    </div>
                    <span className="font-medium text-slate-800">VIXN.fun</span>
                    <span className="text-slate-400">› blog › {blog.slug}</span>
                  </div>
                  <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                    {blog.metaTitle || blog.title || "Untitled Article"}
                  </h4>
                  <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                    {blog.metaDescription ||
                      blog.excerpt ||
                      "Explore high-quality insights, modeling trends, and exclusive creator highlights on VIXN.fun..."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Share Card Preview */}
            <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-rose-500" />
                  Social Card Preview (OpenGraph / Twitter)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  How this post will render when shared on X (Twitter), Facebook, or WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    {blog.ogImage || blog.coverImage ? (
                      <img
                        src={blog.ogImage || blog.coverImage}
                        alt="Social preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-semibold">
                        No cover image specified
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      VIXN.FUN
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {blog.ogTitle || blog.metaTitle || blog.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {blog.ogDescription || blog.metaDescription || blog.excerpt}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meta Tag Configuration Fields */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">
                  Search Engine Meta Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700">Custom Meta Title</Label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {blog.metaTitle?.length || 0} / 60
                    </span>
                  </div>
                  <Input
                    value={blog.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="Leave empty to use main title"
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700">Custom Meta Description</Label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {blog.metaDescription?.length || 0} / 160
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    value={blog.metaDescription}
                    onChange={(e) => updateField("metaDescription", e.target.value)}
                    placeholder="Leave empty to use article excerpt"
                    className="rounded-xl border-slate-200 text-xs leading-relaxed max-h-28 overflow-y-auto resize-none"
                  />
                </div>

                {/* Focus Keyphrase */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Target Focus Keyphrase</Label>
                  <Input
                    value={blog.focusKeyphrase}
                    onChange={(e) => updateField("focusKeyphrase", e.target.value)}
                    placeholder="e.g. modeling photography tips"
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Meta Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                    <Button type="button" onClick={handleAddKeyword} className="bg-slate-900 text-white rounded-xl text-xs">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {blog.metaKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-slate-200 gap-1 rounded-full px-3"
                      >
                        {kw}
                        <button onClick={() => handleRemoveKeyword(kw)} className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Crawler Directives */}
            <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">
                  Indexing &amp; Crawler Directives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Robots Directive */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Robots Directive</Label>
                  <Select
                    value={blog.robotsDirective || "index, follow"}
                    onValueChange={(v) => updateField("robotsDirective", v)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="index, follow">index, follow (Standard Indexing)</SelectItem>
                      <SelectItem value="noindex, follow">noindex, follow (Hide from SERP, follow links)</SelectItem>
                      <SelectItem value="index, nofollow">index, nofollow (Index page, do not pass PageRank)</SelectItem>
                      <SelectItem value="noindex, nofollow">noindex, nofollow (Complete block)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Canonical URL */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Canonical URL Override</Label>
                  <Input
                    value={blog.canonicalUrl}
                    onChange={(e) => updateField("canonicalUrl", e.target.value)}
                    placeholder="Defaults to https://vixn.fun/blog/[slug]"
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>

                {/* Cornerstone Article */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <Label className="text-xs font-bold text-slate-900">Cornerstone Article</Label>
                    <p className="text-[11px] text-slate-500">
                      Mark as a core, high-priority pillar page for search ranking algorithms.
                    </p>
                  </div>
                  <Switch
                    checked={blog.cornerstone}
                    onCheckedChange={(v) => updateField("cornerstone", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
