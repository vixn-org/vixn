"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  OpenInNew as OpenInNewIcon,
  ArticleOutlined as ArticleIcon,
  Search as SearchIcon,
  AutoAwesomeOutlined as SparklesIcon,
  CheckCircleOutlined as CheckCircleIcon,
  WarningAmberOutlined as WarningIcon,
  CancelOutlined as CancelIcon,
  LanguageOutlined as GlobeIcon,
  ShareOutlined as ShareIcon,
  AccessTimeOutlined as ClockIcon,
  MenuBookOutlined as BookOpenIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  FormatQuote as QuoteIcon,
  ImageOutlined as ImageIcon,
  Title as TitleIcon,
  PhoneIphone as PhoneIphoneIcon,
  Computer as ComputerIcon,
} from "@mui/icons-material";
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
  const [activeTab, setActiveTab] = useState(0);

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [modelSlugInput, setModelSlugInput] = useState("");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  const fetchBlog = useCallback(async () => {
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
  }, [blogId, router]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Skeleton variant="text" width={240} height={36} />
          <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 1.5 }} />
        </Box>
      </Box>
    );
  }

  const wordCount = blog.content ? blog.content.split(/\s+/).filter(Boolean).length : 0;
  const computedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 6 }}>
      {/* Top Header Bar - Exact Match to /admin and /admin/models */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          pb: 1.5,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Back to Articles">
            <IconButton
              component={Link}
              href="/admin/blogs"
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 1,
                color: "#475569",
                p: 0.75,
                "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                  fontSize: { xs: "1.25rem", sm: "1.45rem" },
                  maxWidth: { xs: 260, sm: 500 },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {blog.title || "Untitled Article"}
              </Typography>
              <Chip
                label={blog.status === "published" ? "Published Live" : "Draft"}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: blog.status === "published" ? "#ecfdf5" : "#f1f5f9",
                  color: blog.status === "published" ? "#059669" : "#64748b",
                  border: `1px solid ${blog.status === "published" ? "#a7f3d0" : "#e2e8f0"}`,
                  borderRadius: 1,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontFamily: "monospace", fontSize: "0.75rem" }}>
              /blog/{blog.slug}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Button
            component={Link}
            href={`/blog/${blog.slug}`}
            target="_blank"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              borderColor: "#e2e8f0",
              color: "#334155",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              bgcolor: "#ffffff",
              px: 1.5,
              py: 0.65,
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Preview Post
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            size="small"
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              bgcolor: "#0f172a",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              px: 1.75,
              py: 0.65,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {/* Main Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "#e2e8f0" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": {
              backgroundColor: "#0f172a",
              height: 2,
            },
          }}
        >
          <Tab
            icon={<ArticleIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Article Content & Details"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "#64748b",
              minHeight: 40,
              py: 1,
              px: 2,
              "&.Mui-selected": { color: "#0f172a", fontWeight: 700 },
            }}
          />
          <Tab
            icon={<SearchIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <span>Real-Time SEO Strategy</span>
                <Chip
                  label={`${seoAudit.score}%`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    bgcolor: seoAudit.score >= 80 ? "#ecfdf5" : seoAudit.score >= 50 ? "#fffbeb" : "#fef2f2",
                    color: seoAudit.score >= 80 ? "#059669" : seoAudit.score >= 50 ? "#d97706" : "#dc2626",
                    border: `1px solid ${seoAudit.score >= 80 ? "#a7f3d0" : seoAudit.score >= 50 ? "#fde68a" : "#fecaca"}`,
                    borderRadius: 0.75,
                  }}
                />
              </Box>
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "#64748b",
              minHeight: 40,
              py: 1,
              px: 2,
              "&.Mui-selected": { color: "#0f172a", fontWeight: 700 },
            }}
          />
        </Tabs>
      </Box>

      {/* ========== TAB 0: ARTICLE CONTENT ========== */}
      {activeTab === 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
          {/* Left Column: Main Content Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Card: Article Fundamentals */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                    Article Fundamentals
                  </Typography>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                    Primary title, URL slug, categorization, and excerpt teaser.
                  </Typography>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Article Title (H1) *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Complete Guide to 2026 Model Photography"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.875rem", fontWeight: 600 } },
                    }}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      URL Route Slug *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={blog.slug}
                      onChange={(e) => updateField("slug", slugify(e.target.value))}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                                /blog/
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 1, fontSize: "0.8125rem", fontFamily: "monospace" },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Category
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={blog.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        sx={{ borderRadius: 1, fontSize: "0.8125rem" }}
                      >
                        <MenuItem value="Guides">Guides &amp; Tutorials</MenuItem>
                        <MenuItem value="Model Spotlights">Model Spotlights</MenuItem>
                        <MenuItem value="Industry News">Industry News</MenuItem>
                        <MenuItem value="Photo Shoots">Photo Shoots</MenuItem>
                        <MenuItem value="Features">Features &amp; Trends</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Summary / Lead Excerpt
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      {blog.excerpt?.length || 0} / 500 chars
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={blog.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    placeholder="Introductory teaser shown on blog listing cards and search snippet fallback..."
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem", lineHeight: 1.6 } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Card: Rich Markdown Content Editor */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                      Article Body (Markdown Supported)
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BookOpenIcon sx={{ fontSize: 15, color: "#64748b" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                          {wordCount} words
                        </Typography>
                      </Box>
                      <Typography sx={{ color: "#cbd5e1" }}>•</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ClockIcon sx={{ fontSize: 15, color: "#64748b" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                          ~{computedReadingTime} min read
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                    Format text using Markdown. Headings (##, ###) will automatically generate table of contents and SEO anchors.
                  </Typography>
                }
                sx={{ pb: 1.5, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />

              {/* Formatting Toolbar */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 0.75,
                  p: 1.5,
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Tooltip title="Heading 2 (## Subheading)">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => insertMarkdown("## ", "\n")}
                    sx={{
                      minWidth: "auto",
                      px: 1,
                      py: 0.35,
                      borderRadius: 1,
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      bgcolor: "#ffffff",
                      textTransform: "none",
                    }}
                  >
                    H2
                  </Button>
                </Tooltip>

                <Tooltip title="Heading 3 (### Section)">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => insertMarkdown("### ", "\n")}
                    sx={{
                      minWidth: "auto",
                      px: 1,
                      py: 0.35,
                      borderRadius: 1,
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      bgcolor: "#ffffff",
                      textTransform: "none",
                    }}
                  >
                    H3
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "#e2e8f0" }} />

                <Tooltip title="Bold (**text**)">
                  <IconButton
                    size="small"
                    onClick={() => insertMarkdown("**", "**")}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#ffffff",
                      p: 0.4,
                      color: "#334155",
                    }}
                  >
                    <BoldIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Italic (*text*)">
                  <IconButton
                    size="small"
                    onClick={() => insertMarkdown("*", "*")}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#ffffff",
                      p: 0.4,
                      color: "#334155",
                    }}
                  >
                    <ItalicIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Bullet List (- item)">
                  <IconButton
                    size="small"
                    onClick={() => insertMarkdown("\n- ", "")}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#ffffff",
                      p: 0.4,
                      color: "#334155",
                    }}
                  >
                    <ListIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Blockquote (> quote)">
                  <IconButton
                    size="small"
                    onClick={() => insertMarkdown("\n> ", "\n")}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#ffffff",
                      p: 0.4,
                      color: "#334155",
                    }}
                  >
                    <QuoteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "#e2e8f0" }} />

                <Tooltip title="Insert Image markdown">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ImageIcon sx={{ fontSize: 15 }} />}
                    onClick={() => insertMarkdown("![Image description](", ")")}
                    sx={{
                      borderRadius: 1,
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: "#ffffff",
                      textTransform: "none",
                      py: 0.35,
                      px: 1,
                    }}
                  >
                    Image
                  </Button>
                </Tooltip>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <TextField
                  id="content-editor"
                  fullWidth
                  multiline
                  rows={18}
                  value={blog.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder="Write article content using markdown syntax..."
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 1,
                        fontSize: "0.8125rem",
                        fontFamily: "monospace",
                        lineHeight: 1.65,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Card: Tags & Internal Linking */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                    Article Tags &amp; Cross-Linking
                  </Typography>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                    Categorize topics and cross-link creator profiles to funnel internal PageRank.
                  </Typography>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Article Tags */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Article Tags
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. photography, glamour, lighting"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      slotProps={{
                        input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddTag}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "#0f172a",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        px: 2,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    {blog.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        onDelete={() => handleRemoveTag(tag)}
                        deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          bgcolor: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    ))}
                    {blog.tags.length === 0 && (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
                        No tags added yet.
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                {/* Related Model Slugs */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.25 }}>
                    Related Models (Internal Link Equity)
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 1 }}>
                    Cross-link model galleries within this article to boost internal Google PageRank.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. aditi-mistry"
                      value={modelSlugInput}
                      onChange={(e) => setModelSlugInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRelatedModel())}
                      slotProps={{
                        input: { sx: { borderRadius: 1, fontSize: "0.8125rem", fontFamily: "monospace" } },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddRelatedModel}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "#0f172a",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        px: 2,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
                      }}
                    >
                      Add Model
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    {blog.relatedModelSlugs.map((slug) => (
                      <Chip
                        key={slug}
                        label={`/model/${slug}`}
                        size="small"
                        onDelete={() => handleRemoveRelatedModel(slug)}
                        deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          bgcolor: "#fff1f2",
                          color: "#be123c",
                          border: "1px solid #fecdd3",
                          fontFamily: "monospace",
                        }}
                      />
                    ))}
                    {blog.relatedModelSlugs.length === 0 && (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
                        No models linked yet.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Sidebar: Cover Image, Author, Visibility */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Card: Visibility & Publish Status */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                    Visibility &amp; Publish Status
                  </Typography>
                }
                sx={{ pb: 1, px: 2, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Status
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={blog.status}
                      onChange={(e) => updateField("status", e.target.value as "draft" | "published")}
                      sx={{ borderRadius: 1, fontSize: "0.8125rem" }}
                    >
                      <MenuItem value="published">Published (Visible to All)</MenuItem>
                      <MenuItem value="draft">Draft (Admin Only)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                      Featured Article
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Showcase in blog hero banner
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={Boolean(blog.featured)}
                    onChange={(e) => updateField("featured", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#0f172a" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0f172a" },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Card: Cover Image */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                    Featured Cover Image
                  </Typography>
                }
                sx={{ pb: 1, px: 2, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Image URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.coverImage}
                    onChange={(e) => updateField("coverImage", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Image Alt Text (SEO)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.coverImageAlt}
                    onChange={(e) => updateField("coverImageAlt", e.target.value)}
                    placeholder="Descriptive text for Google Image search..."
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                {blog.coverImage && (
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f1f5f9",
                    }}
                  >
                    <Box
                      component="img"
                      src={blog.coverImage}
                      alt="Cover preview"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Card: Author Information */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                    Author Profile
                  </Typography>
                }
                sx={{ pb: 1, px: 2, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Author Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.author?.name || ""}
                    onChange={(e) => updateAuthorField("name", e.target.value)}
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Author Role
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.author?.role || ""}
                    onChange={(e) => updateAuthorField("role", e.target.value)}
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Author Avatar URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.author?.avatar || ""}
                    onChange={(e) => updateAuthorField("avatar", e.target.value)}
                    placeholder="/logo.jpg or https://..."
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* ========== TAB 1: ADVANCED SEO STRATEGY ========== */}
      {activeTab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Real-time SEO Health Audit Header Card */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid #e2e8f0",
              borderRadius: 1.5,
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  bgcolor: seoAudit.score >= 80 ? "#10b981" : seoAudit.score >= 50 ? "#f59e0b" : "#ef4444",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {seoAudit.score}%
              </Box>
              <Box>
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  Real-Time SEO Health Audit
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                  Evaluated across keyphrase optimization, content depth, headings, and snippet parameters.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {seoAudit.checks.map((check, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.75rem",
                  }}
                >
                  {check.status === "pass" ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                  ) : check.status === "warn" ? (
                    <WarningIcon sx={{ fontSize: 16, color: "#d97706" }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                  )}
                  <Typography component="span" sx={{ fontSize: "0.725rem", fontWeight: 700, color: "#1e293b" }}>
                    {check.name}:
                  </Typography>
                  <Typography component="span" sx={{ fontSize: "0.725rem", color: "#64748b" }}>
                    {check.message}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* SERP & Social Card Previews Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
            {/* Google Search Result Preview */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GlobeIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                      Google Search Snippet Preview
                    </Typography>
                  </Box>
                }
                action={
                  <Box sx={{ display: "flex", bgcolor: "#f1f5f9", p: 0.5, borderRadius: 1, gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setSerpDevice("desktop")}
                      sx={{
                        borderRadius: 0.75,
                        px: 1,
                        py: 0.25,
                        bgcolor: serpDevice === "desktop" ? "#ffffff" : "transparent",
                        boxShadow: serpDevice === "desktop" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        color: serpDevice === "desktop" ? "#0f172a" : "#64748b",
                      }}
                    >
                      <ComputerIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setSerpDevice("mobile")}
                      sx={{
                        borderRadius: 0.75,
                        px: 1,
                        py: 0.25,
                        bgcolor: serpDevice === "mobile" ? "#ffffff" : "transparent",
                        boxShadow: serpDevice === "mobile" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        color: serpDevice === "mobile" ? "#0f172a" : "#64748b",
                      }}
                    >
                      <PhoneIphoneIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.75rem", color: "#475569" }}>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#0f172a",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.6rem",
                      }}
                    >
                      V
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#1e293b" }}>
                      VIXN.fun
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      › blog › {blog.slug}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#1a0dab",
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {blog.metaTitle || blog.title || "Untitled Article"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.775rem",
                      color: "#4d5156",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {blog.metaDescription ||
                      blog.excerpt ||
                      "Explore high-quality insights, modeling trends, and exclusive creator highlights on VIXN.fun..."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Social Share Card Preview */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShareIcon sx={{ fontSize: 18, color: "#e11d48" }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                      Social Card Preview (OpenGraph / Twitter)
                    </Typography>
                  </Box>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "16/9",
                      bgcolor: "#f1f5f9",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {blog.ogImage || blog.coverImage ? (
                      <Box
                        component="img"
                        src={blog.ogImage || blog.coverImage}
                        alt="Social preview"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                        No preview image specified
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      VIXN.FUN
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mt: 0.25,
                      }}
                    >
                      {blog.ogTitle || blog.metaTitle || blog.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.725rem",
                        color: "#64748b",
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mt: 0.25,
                      }}
                    >
                      {blog.ogDescription || blog.metaDescription || blog.excerpt}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Meta Tag Configuration Fields Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
            {/* Card: Search Engine Meta Tags */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                    Search Engine Meta Tags
                  </Typography>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Meta Title */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Custom Meta Title
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      {blog.metaTitle?.length || 0} / 60 chars
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="Leave empty to use main article title"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                {/* Meta Description */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Custom Meta Description
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      {blog.metaDescription?.length || 0} / 160 chars
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={blog.metaDescription}
                    onChange={(e) => updateField("metaDescription", e.target.value)}
                    placeholder="Leave empty to use article summary excerpt"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem", lineHeight: 1.6 } },
                    }}
                  />
                </Box>

                {/* Focus Keyphrase */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Target Focus Keyphrase
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.focusKeyphrase}
                    onChange={(e) => updateField("focusKeyphrase", e.target.value)}
                    placeholder="e.g. modeling photography tips"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                {/* Meta Keywords */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Meta Keywords
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add keyword..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      slotProps={{
                        input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddKeyword}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "#0f172a",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        px: 2,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    {blog.metaKeywords.map((kw) => (
                      <Chip
                        key={kw}
                        label={kw}
                        size="small"
                        onDelete={() => handleRemoveKeyword(kw)}
                        deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          bgcolor: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Card: Indexing & Crawler Directives */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                    Indexing &amp; Crawler Directives
                  </Typography>
                }
                sx={{ pb: 1, px: 2.5, pt: 2 }}
              />
              <Divider sx={{ borderColor: "#f1f5f9" }} />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Robots Directive */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Robots Directive
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={blog.robotsDirective || "index, follow"}
                      onChange={(e) => updateField("robotsDirective", e.target.value)}
                      sx={{ borderRadius: 1, fontSize: "0.8125rem" }}
                    >
                      <MenuItem value="index, follow">index, follow (Standard Indexing)</MenuItem>
                      <MenuItem value="noindex, follow">noindex, follow (Hide from SERP, follow links)</MenuItem>
                      <MenuItem value="index, nofollow">index, nofollow (Index page, do not pass PageRank)</MenuItem>
                      <MenuItem value="noindex, nofollow">noindex, nofollow (Complete block)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Canonical URL */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Canonical URL Override
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.canonicalUrl}
                    onChange={(e) => updateField("canonicalUrl", e.target.value)}
                    placeholder="Defaults to https://vixn.fun/blog/[slug]"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem", fontFamily: "monospace" } },
                    }}
                  />
                </Box>

                {/* OpenGraph Image Override */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Social Share Image Override (OG/Twitter)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={blog.ogImage}
                    onChange={(e) => updateField("ogImage", e.target.value)}
                    placeholder="Defaults to Cover Image URL"
                    slotProps={{
                      input: { sx: { borderRadius: 1, fontSize: "0.8125rem" } },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                {/* Cornerstone Article */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                      Cornerstone Article
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Mark as a core, high-priority pillar page for search ranking algorithms.
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={Boolean(blog.cornerstone)}
                    onChange={(e) => updateField("cornerstone", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#0f172a" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0f172a" },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}
