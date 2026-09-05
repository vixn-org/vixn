"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";

interface ModelItem {
  _id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  reviewed?: boolean;
  media: { _id: string }[];
  tags: string[];
  country?: string;
  createdAt: string;
  profileImage: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminModelsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [models, setModels] = useState<ModelItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newModel, setNewModel] = useState<{
    name: string;
    slug: string;
    country: string;
    metaTitle: string;
    metaDescription: string;
    status: "draft" | "published";
  }>({
    name: "",
    slug: "",
    country: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
  });

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/models?${params}`);
      const data = await res.json();
      setModels(data.models || []);
      setPagination(data.pagination || null);
    } catch {
      toast.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleCreate = async () => {
    if (!newModel.name || !newModel.slug) {
      toast.error("Model name and route slug are required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newModel,
          metaTitle: newModel.metaTitle || `${newModel.name} - Photos & Videos`,
          metaDescription:
            newModel.metaDescription ||
            `Explore ${newModel.name}'s exclusive photo gallery and video collection on VIXN.`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create model");
        return;
      }

      toast.success(`Route /model/${data.model.slug} created!`);
      setCreateOpen(false);
      setNewModel({
        name: "",
        slug: "",
        country: "",
        metaTitle: "",
        metaDescription: "",
        status: "draft",
      });
      router.push(`/admin/models/${data.model._id}`);
    } catch {
      toast.error("Failed to create model");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/models/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${name} deleted`);
      fetchModels();
    } catch {
      toast.error("Failed to delete model");
    }
  };

  const handleToggleReviewed = async (id: string, currentReviewed: boolean) => {
    const nextReviewed = !currentReviewed;
    // Optimistic UI update
    setModels((prev) =>
      prev.map((m) => (m._id === id ? { ...m, reviewed: nextReviewed } : m))
    );

    try {
      const res = await fetch(`/api/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: nextReviewed }),
      });

      if (!res.ok) throw new Error();
      toast.success(
        nextReviewed ? "Model marked as Reviewed" : "Review status set to Pending"
      );
    } catch {
      // Rollback on error
      setModels((prev) =>
        prev.map((m) => (m._id === id ? { ...m, reviewed: currentReviewed } : m))
      );
      toast.error("Failed to update reviewed status");
    }
  };

  const handleNameChange = (name: string) => {
    setNewModel({
      ...newModel,
      name,
      slug: slugify(name),
      metaTitle: `${name} - Photos & Videos`,
      metaDescription: `Explore ${name}'s exclusive photo gallery and video collection on VIXN.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Models Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create custom routes (<span className="font-mono text-slate-700">/model/[route]</span>), manage photo/video sets, and tune SEO parameters.
          </p>
        </div>

        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-xs">
                <Plus className="mr-2 h-4 w-4" />
                Create Model Route
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 bg-white text-slate-900 sm:max-w-lg rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Create New Model Route
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">
                  Creates a new model directory and establishes canonical URL /model/[slug].
                </DialogDescription>
              </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Model Full Name *</Label>
                <Input
                  placeholder="e.g. Aditi Mistry"
                  value={newModel.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Custom URL Slug *</Label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  <span className="text-slate-400">/model/</span>
                  <input
                    type="text"
                    value={newModel.slug}
                    onChange={(e) =>
                      setNewModel({ ...newModel, slug: slugify(e.target.value) })
                    }
                    className="flex-1 bg-transparent text-slate-900 focus:outline-hidden font-mono text-xs"
                    placeholder="aditi-mistry"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Country / Origin</Label>
                <Input
                  placeholder="e.g. India, United States"
                  value={newModel.country}
                  onChange={(e) =>
                    setNewModel({ ...newModel, country: e.target.value })
                  }
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">Meta Title (SEO)</Label>
                  <span
                    className={`text-[11px] font-semibold ${
                      newModel.metaTitle.length === 0
                        ? "text-slate-400"
                        : newModel.metaTitle.length <= 60
                        ? "text-emerald-600"
                        : "text-red-500 font-bold"
                    }`}
                  >
                    {newModel.metaTitle.length}/60 {newModel.metaTitle.length > 60 ? "(Too long!)" : newModel.metaTitle.length >= 25 ? "(Optimal)" : ""}
                  </span>
                </div>
                <Input
                  placeholder="SEO title for Google SERP (max 60 chars)"
                  value={newModel.metaTitle}
                  maxLength={60}
                  onChange={(e) =>
                    setNewModel({ ...newModel, metaTitle: e.target.value })
                  }
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                />
                <p className="text-[11px] text-slate-400">
                  Max 60 chars. Do NOT add &quot;| VIXN&quot; (added automatically).
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">Meta Description</Label>
                  <span
                    className={`text-[11px] font-semibold ${
                      newModel.metaDescription.length === 0
                        ? "text-slate-400"
                        : newModel.metaDescription.length < 50
                        ? "text-amber-500"
                        : newModel.metaDescription.length <= 155
                        ? "text-emerald-600"
                        : "text-red-500 font-bold"
                    }`}
                  >
                    {newModel.metaDescription.length}/155 {newModel.metaDescription.length > 155 ? "(Too long!)" : newModel.metaDescription.length >= 120 ? "(Optimal)" : ""}
                  </span>
                </div>
                <Textarea
                  placeholder="Compelling description for search snippets (max 155 chars)"
                  value={newModel.metaDescription}
                  maxLength={155}
                  onChange={(e) =>
                    setNewModel({
                      ...newModel,
                      metaDescription: e.target.value,
                    })
                  }
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 min-h-20"
                  rows={3}
                />
                <p className="text-[11px] text-slate-400">
                  Strict limit: 155 characters for Bing and Google Snippets.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Publication Status</Label>
                <Select
                  value={newModel.status}
                  onValueChange={(v) =>
                    setNewModel({
                      ...newModel,
                      status: v as "draft" | "published",
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900 border-slate-200">
                    <SelectItem value="published">Published (Live for Public)</SelectItem>
                    <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SERP Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  Google Search Snippet Preview
                </p>
                <p className="text-sm font-semibold text-blue-600 truncate hover:underline">
                  {newModel.metaTitle ? `${newModel.metaTitle.replace(/\s*(?:[|\-–—:]|\bon\b)\s*VIXN/gi, "").trim()} | VIXN` : `${newModel.name || "Model Name"} - Photos & Videos | VIXN`}
                </p>
                <p className="text-xs text-emerald-700 font-mono truncate">
                  https://vixn.fun/model/{newModel.slug || "model-slug"}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {newModel.metaDescription ||
                    "Explore model's exclusive photo gallery and video collection on VIXN."}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
              >
                {creating ? "Creating..." : "Save & Open Editor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search model name, tags or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-xl border-slate-200 bg-white text-slate-900 shadow-xs"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white text-slate-900 shadow-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Model Name</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Live Route</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Reviewed</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Media Sets</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase">Created Date</TableHead>
              <TableHead className="text-slate-600 font-bold text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : models.length === 0 ? (
              <TableRow className="border-slate-100">
                <TableCell
                  colSpan={7}
                  className="text-center py-16 text-slate-500"
                >
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <Flame className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-800 text-sm">No model routes match your filter</p>
                    <p className="text-xs text-slate-500">Create a new model route to populate your public directory.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow
                  key={model._id}
                  className="border-slate-100 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => router.push(`/admin/models/${model._id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {model.profileImage ? (
                        <img
                          src={model.profileImage}
                          alt={model.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shrink-0">
                          {model.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {model.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      /model/{model.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        model.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }
                    >
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!model.reviewed}
                        onCheckedChange={() =>
                          handleToggleReviewed(model._id, !!model.reviewed)
                        }
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          model.reviewed
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {model.reviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <ImageIcon className="h-3.5 w-3.5 text-rose-500" />
                      {model.media?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs font-medium">
                    {new Date(model.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border-slate-200 text-slate-900 shadow-lg rounded-xl"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/models/${model._id}`)
                            }
                            className="hover:bg-slate-100 cursor-pointer font-medium text-xs"
                          >
                            Edit Information &amp; Media
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="hover:bg-slate-100 cursor-pointer font-medium text-xs"
                          >
                            <Link
                              href={`/model/${model.slug}`}
                              target="_blank"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5 text-slate-400" />
                              View Public Route
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer font-medium text-xs"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete Model
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-lg font-bold">
                                    Delete &quot;{model.name}&quot;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500 text-xs">
                                    This will permanently remove the route /model/{model.slug}, along with all uploaded photos, videos, and associated metadata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(model._id, model.name)
                                    }
                                    className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-medium text-slate-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="text-xs font-semibold text-slate-600 px-2">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
