"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  DeleteOutlined as DeleteOutlineIcon,
  MoreVert as MoreVertIcon,
  EditOutlined as EditIcon,
  Refresh as RefreshIcon,
  MenuBookOutlined as BookOpenIcon,
  CheckCircleOutlined as CheckCircleIcon,
  ArticleOutlined as ArticleIcon,
  AutoAwesomeOutlined as SparklesIcon,
  AccessTimeOutlined as ClockIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  coverImage?: string;
  status: "draft" | "published";
  featured?: boolean;
  readingTime?: number;
  tags?: string[];
  focusKeyphrase?: string;
  createdAt: string;
  publishedAt?: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Quick Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Guides");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newFocusKeyphrase, setNewFocusKeyphrase] = useState("");

  // Action Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuBlog, setActiveMenuBlog] = useState<BlogItem | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setBlogs(data.blogs || []);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast.error(data.error || "Failed to fetch blogs");
      }
    } catch {
      toast.error("Network error while loading blogs");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setNewTitle(title);
    setNewSlug(slugify(title));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter an article title");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug || slugify(newTitle),
          category: newCategory,
          excerpt: newExcerpt.trim(),
          focusKeyphrase: newFocusKeyphrase.trim(),
          content: `## Introduction\n\nWrite your comprehensive SEO article here...\n\n### Key Highlights\n\n- Point 1\n- Point 2\n\n### Summary\n\nConcluding thoughts and recommendations.`,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Blog article created! Opening editor...");
        setCreateOpen(false);
        router.push(`/admin/blogs/${data.blog._id}`);
      } else {
        toast.error(data.error || "Failed to create blog");
      }
    } catch {
      toast.error("Network error while creating blog");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (blog: BlogItem) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          `Article is now ${newStatus === "published" ? "Published live" : "Draft"}`
        );
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${blogToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Blog article deleted");
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete blog post");
      }
    } catch {
      toast.error("Failed to delete blog post");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, blog: BlogItem) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuBlog(blog);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuBlog(null);
  };

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
      {/* Top Header Bar - Exact Match to /admin */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          pb: 1,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
                fontSize: { xs: "1.4rem", sm: "1.6rem" },
              }}
            >
              Blog &amp; SEO Articles
            </Typography>
            <Chip
              label="SEO Engine"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25, fontSize: "0.85rem" }}>
            Write, optimize, and publish high-authority editorial articles with live SEO audits.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title="Refresh articles">
            <IconButton
              size="small"
              onClick={fetchBlogs}
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 1,
                color: "#64748b",
                p: 0.75,
                "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: "#0f172a",
              color: "#ffffff",
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              px: 1.75,
              py: 0.75,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
            }}
          >
            Create New Article
          </Button>
        </Box>
      </Box>

      {/* Stats Summary Bar */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#334155",
              }}
            >
              <BookOpenIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                {totalCount}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
                Total Articles
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                {publishedCount}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
                Published Live
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "#fffbeb",
                border: "1px solid #fde68a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
              }}
            >
              <ArticleIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                {draftCount}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
                Drafts
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "#eff6ff",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
              }}
            >
              <SparklesIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                100%
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
                SEO Schema Ready
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Filter and Search Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by title, tags, or content..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1,
                bgcolor: "#ffffff",
                fontSize: "0.875rem",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#0f172a" },
              },
            },
          }}
        />

        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
          <FormControl size="small" sx={{ minWidth: 160, width: { xs: "50%", sm: 160 } }}>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              displayEmpty
              sx={{
                borderRadius: 1,
                bgcolor: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 500,
                "& fieldset": { borderColor: "#e2e8f0" },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="Guides">Guides</MenuItem>
              <MenuItem value="Model Spotlights">Model Spotlights</MenuItem>
              <MenuItem value="Industry News">Industry News</MenuItem>
              <MenuItem value="Photo Shoots">Photo Shoots</MenuItem>
              <MenuItem value="Features">Features</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140, width: { xs: "50%", sm: 140 } }}>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              displayEmpty
              sx={{
                borderRadius: 1,
                bgcolor: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 500,
                "& fieldset": { borderColor: "#e2e8f0" },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Drafts</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Articles Material UI Table Card */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 1.5,
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="small">
            <TableHead sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <TableRow>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em", width: 70 }}>
                  Cover
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Article Title
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Category
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Read Time
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Status
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Date
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, px: 2.5, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} sx={{ borderBottom: "1px solid #f1f5f9" }}>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={52} height={36} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="text" width="85%" height={20} />
                      <Skeleton variant="text" width="45%" height={14} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="text" width={60} height={18} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="text" width={75} height={18} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: 2.5 }}>
                      <Skeleton variant="circular" width={28} height={28} sx={{ ml: "auto" }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8, textAlign: "center" }}>
                    <Box sx={{ maxWidth: 300, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <BookOpenIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                        No blog articles found
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {search || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Try adjusting your search criteria or category filters."
                          : "Create your first SEO article to rank on search engines."}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setCreateOpen(true)}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          mt: 1,
                          bgcolor: "#0f172a",
                          color: "#ffffff",
                          borderRadius: 1,
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        New Article
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow
                    key={blog._id}
                    hover
                    onClick={() => router.push(`/admin/blogs/${blog._id}`)}
                    sx={{
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      "&:last-child": { borderBottom: "none" },
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Cover Thumbnail */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: "#f1f5f9",
                          overflow: "hidden",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {blog.coverImage ? (
                          <Box
                            component="img"
                            src={blog.coverImage}
                            alt={blog.title}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ArticleIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        )}
                      </Box>
                    </TableCell>

                    {/* Title & Slug */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ minWidth: 0, maxWidth: 360 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.825rem",
                            color: "#0f172a",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            "&:hover": { color: "#2563eb" },
                          }}
                        >
                          {blog.title}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              color: "#64748b",
                              fontSize: "0.7rem",
                            }}
                          >
                            /blog/{blog.slug}
                          </Typography>
                          {blog.focusKeyphrase && (
                            <Chip
                              label={`Key: ${blog.focusKeyphrase}`}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: "0.6rem",
                                fontWeight: 600,
                                borderRadius: 0.75,
                                bgcolor: "#f8fafc",
                                color: "#64748b",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip
                        label={blog.category}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          borderRadius: 1,
                          bgcolor: "#f1f5f9",
                          color: "#475569",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    </TableCell>

                    {/* Reading Time */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ClockIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                          {blog.readingTime || 3} min
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell
                      sx={{ py: 1.5, px: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Switch
                          size="small"
                          checked={blog.status === "published"}
                          onChange={() => handleToggleStatus(blog)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#059669",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              bgcolor: "#10b981",
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: blog.status === "published" ? "#059669" : "#94a3b8",
                          }}
                        >
                          {blog.status === "published" ? "Published" : "Draft"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell
                      align="right"
                      sx={{ py: 1.5, px: 2.5 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, blog)}
                        sx={{
                          color: "#94a3b8",
                          borderRadius: 1,
                          p: 0.5,
                          "&:hover": { color: "#0f172a", bgcolor: "#f1f5f9" },
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Material UI TablePagination - Backend Driven */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: 500,
            },
            ".MuiTablePagination-select": {
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#334155",
            },
            ".MuiTablePagination-actions button": {
              color: "#475569",
              p: 0.5,
              borderRadius: 1,
              "&.Mui-disabled": {
                color: "#cbd5e1",
              },
            },
          }}
        />
      </Card>

      {/* Row Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              border: "1px solid #e2e8f0",
              borderRadius: 1,
              minWidth: 170,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              p: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {activeMenuBlog && (
          <>
            <MenuItem
              onClick={() => {
                router.push(`/admin/blogs/${activeMenuBlog._id}`);
                handleCloseMenu();
              }}
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#1e293b",
                borderRadius: 1,
                gap: 1.25,
                py: 0.75,
              }}
            >
              <EditIcon sx={{ fontSize: 16, color: "#64748b" }} />
              Edit Article &amp; SEO
            </MenuItem>

            <MenuItem
              component={Link}
              href={`/blog/${activeMenuBlog.slug}`}
              target="_blank"
              onClick={handleCloseMenu}
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#1e293b",
                borderRadius: 1,
                gap: 1.25,
                py: 0.75,
              }}
            >
              <OpenInNewIcon sx={{ fontSize: 16, color: "#64748b" }} />
              View Public Post
            </MenuItem>

            <MenuItem
              onClick={() => {
                setBlogToDelete(activeMenuBlog);
                setDeleteDialogOpen(true);
                handleCloseMenu();
              }}
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#dc2626",
                borderRadius: 1,
                gap: 1.25,
                py: 0.75,
                "&:hover": { bgcolor: "#fef2f2" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16, color: "#dc2626" }} />
              Delete Article
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Quick Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 1.5, border: "1px solid #e2e8f0" },
          },
        }}
      >
        <form onSubmit={handleCreate}>
          <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem" }}>
              New Blog Article
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.25 }}>
              Set the title, target keyword, and category to initialize a new SEO-optimized article.
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                Article Title *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g. Top 10 High-Fashion Modeling Trends in 2026"
                value={newTitle}
                onChange={handleTitleChange}
                slotProps={{
                  input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                }}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                  URL Slug *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="top-10-high-fashion-trends"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                            /blog/
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.8125rem", fontFamily: "monospace" },
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
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    sx={{ borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.8125rem" }}
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
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                Focus Keyphrase (SEO)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. high fashion models"
                value={newFocusKeyphrase}
                onChange={(e) => setNewFocusKeyphrase(e.target.value)}
                slotProps={{
                  input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                Brief Excerpt / Summary
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description that will appear in search engine snippets and preview cards..."
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                slotProps={{
                  input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              sx={{
                borderRadius: 1,
                borderColor: "#e2e8f0",
                color: "#475569",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              sx={{
                borderRadius: 1,
                bgcolor: "#0f172a",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                boxShadow: "none",
                "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
              }}
            >
              {creating ? "Creating..." : "Create & Edit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 1.5, border: "1px solid #e2e8f0" },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.0625rem" }}>
            Delete Article?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <DialogContentText sx={{ fontSize: "0.8125rem", color: "#64748b" }}>
            Are you sure you want to delete &quot;{blogToDelete?.title}&quot;? This action cannot be undone and its public URL routing will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteDialogOpen(false);
              setBlogToDelete(null);
            }}
            disabled={deleting}
            sx={{
              borderRadius: 1,
              borderColor: "#e2e8f0",
              color: "#475569",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {deleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
