"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Quick Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Guides");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newFocusKeyphrase, setNewFocusKeyphrase] = useState("");

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast.error(data.error || "Failed to fetch blogs");
      }
    } catch {
      toast.error("Network error while loading blogs");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle title change & auto-generate slug
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
        toast.success("Blog article created! Redirecting to editor...");
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
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Blog article deleted");
        setDeleteId(null);
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

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Blog &amp; SEO Articles
            </h1>
            <Badge
              variant="outline"
              className="bg-rose-50 text-rose-600 border-rose-200 font-bold"
            >
              SEO Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Write, optimize, and publish high-authority articles with rich structured data and live SEO audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Create New Article</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  New Blog Article
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Set the title, target keyword, and category to initialize a new SEO-optimized article.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Article Title</Label>
                  <Input
                    placeholder="e.g. Top 10 High-Fashion Modeling Trends in 2026"
                    value={newTitle}
                    onChange={handleTitleChange}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">URL Slug</Label>
                    <Input
                      placeholder="top-10-high-fashion-trends"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="rounded-xl border-slate-200 font-mono text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
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
                  <Label className="text-xs font-bold text-slate-700">Focus Keyphrase (SEO)</Label>
                  <Input
                    placeholder="e.g. high fashion models"
                    value={newFocusKeyphrase}
                    onChange={(e) => setNewFocusKeyphrase(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Brief Excerpt / Summary</Label>
                  <Textarea
                    rows={3}
                    placeholder="Brief description that will appear in search engine snippets and preview cards..."
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs max-h-28 overflow-y-auto resize-none"
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl border-slate-200 text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                  >
                    {creating ? "Creating..." : "Create & Edit"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs font-medium text-slate-500">Total Articles</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{publishedCount}</div>
            <div className="text-xs font-medium text-slate-500">Published Live</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{draftCount}</div>
            <div className="text-xs font-medium text-slate-500">Drafts</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">100%</div>
            <div className="text-xs font-medium text-slate-500">SEO Schema Ready</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title, tags, or content..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-slate-200 bg-slate-50 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Guides">Guides</SelectItem>
              <SelectItem value="Model Spotlights">Model Spotlights</SelectItem>
              <SelectItem value="Industry News">Industry News</SelectItem>
              <SelectItem value="Photo Shoots">Photo Shoots</SelectItem>
              <SelectItem value="Features">Features</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[130px] rounded-xl border-slate-200 bg-slate-50 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="w-[80px] text-xs font-bold text-slate-700">Cover</TableHead>
              <TableHead className="text-xs font-bold text-slate-700">Article Title</TableHead>
              <TableHead className="text-xs font-bold text-slate-700">Category</TableHead>
              <TableHead className="text-xs font-bold text-slate-700">Reading Time</TableHead>
              <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-700">Date</TableHead>
              <TableHead className="w-[80px] text-right text-xs font-bold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-14 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No blog articles found</p>
                    <p className="text-xs text-slate-400">
                      Create your first SEO article to rank on search engines.
                    </p>
                    <Button
                      onClick={() => setCreateOpen(true)}
                      size="sm"
                      className="mt-2 bg-slate-900 text-white rounded-xl"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> New Article
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Cover Thumbnail */}
                  <TableCell>
                    <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>

                  {/* Title & Slug */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/admin/blogs/${blog._id}`}
                        className="font-bold text-sm text-slate-900 hover:text-rose-600 transition-colors line-clamp-1"
                      >
                        {blog.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>/blog/{blog.slug}</span>
                        {blog.focusKeyphrase && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-slate-500 border-slate-200">
                            Key: {blog.focusKeyphrase}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg">
                      {blog.category}
                    </Badge>
                  </TableCell>

                  {/* Reading Time */}
                  <TableCell>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {blog.readingTime || 3} min read
                    </span>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={blog.status === "published"}
                        onCheckedChange={() => handleToggleStatus(blog)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <Badge
                        variant="secondary"
                        className={
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }
                      >
                        {blog.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-slate-500 font-medium">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200 rounded-xl shadow-lg">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blogs/${blog._id}`} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <Edit className="h-3.5 w-3.5 text-slate-500" />
                            Edit Article &amp; SEO
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-500" />
                            View Public Post
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteId(blog._id)}
                          className="flex items-center gap-2 text-xs font-semibold text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          Delete Article
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {totalPages} ({totalCount} articles)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border-slate-200 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border-slate-200 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete this blog post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              This action cannot be undone. The article and its associated search engine routing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
