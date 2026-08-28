"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  Search,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  ListPlus,
} from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  _id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title: string;
  alt: string;
  keywords?: string[];
  order: number;
  isExternal?: boolean;
}

interface ModelData {
  _id: string;
  name: string;
  slug: string;
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
  bio: string;
  aboutContent?: string;
  profileImage: string;
  coverImage: string;
  media: MediaItem[];
  tags: string[];
  category: string;
  status: "draft" | "published";
  featured: boolean;
  reviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ModelManagementPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params.id as string;

  const [model, setModel] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [bulkKeywordsOpen, setBulkKeywordsOpen] = useState(false);
  const [bulkKeywordsText, setBulkKeywordsText] = useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState({
    type: "photo" as "photo" | "video",
    url: "",
    thumbnail: "",
    title: "",
    alt: "",
    keywords: "",
    isExternal: false,
  });

  const fetchModel = useCallback(async () => {
    try {
      const res = await fetch(`/api/models/${modelId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setModel(data.model);
    } catch {
      toast.error("Failed to load model details");
      router.push("/admin/models");
    } finally {
      setLoading(false);
    }
  }, [modelId, router]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleSave = async () => {
    if (!model) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      toast.success("All changes saved successfully!");
    } catch {
      toast.error("Failed to save model changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !model) return;
    if (!model.tags.includes(tagInput.trim())) {
      setModel({ ...model, tags: [...model.tags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!model) return;
    setModel({ ...model, tags: model.tags.filter((t) => t !== tag) });
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim() || !model) return;
    if (!model.metaKeywords.includes(keywordInput.trim())) {
      setModel({
        ...model,
        metaKeywords: [...model.metaKeywords, keywordInput.trim()],
      });
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    if (!model) return;
    setModel({
      ...model,
      metaKeywords: model.metaKeywords.filter((k) => k !== kw),
    });
  };

  const handleAddBulkKeywords = () => {
    if (!model || !bulkKeywordsText.trim()) return;
    const lines = bulkKeywordsText
      .split(/\r?\n|,/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const existingSet = new Set(model.metaKeywords);
    const newKeywords = [...model.metaKeywords];
    let addedCount = 0;

    for (const kw of lines) {
      if (!existingSet.has(kw)) {
        existingSet.add(kw);
        newKeywords.push(kw);
        addedCount++;
      }
    }

    setModel({
      ...model,
      metaKeywords: newKeywords,
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} keyword${addedCount > 1 ? "s" : ""}`);
    } else {
      toast.info("No new unique keywords to add");
    }

    setBulkKeywordsText("");
    setBulkKeywordsOpen(false);
  };

  const handleAddMedia = async () => {
    if (!newMedia.url) {
      toast.error("Media URL is required");
      return;
    }
    try {
      const res = await fetch(`/api/models/${modelId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedia),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setModel(data.model);
      setNewMedia({
        type: "photo",
        url: "",
        thumbnail: "",
        title: "",
        alt: "",
        keywords: "",
        isExternal: false,
      });
      setMediaDialogOpen(false);
      toast.success("Media item added to gallery");
    } catch {
      toast.error("Failed to add media item");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }

      const data = await res.json();

      // Add to model media
      const mediaRes = await fetch(`/api/models/${modelId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          url: data.url,
          title: data.filename,
          alt: `${model?.name || "Model"} ${data.type}`,
        }),
      });

      if (!mediaRes.ok) throw new Error();

      const mediaData = await mediaRes.json();
      setModel(mediaData.model);
      setUploadDialogOpen(false);
      toast.success(`Uploaded to Supabase "${data.bucket}" bucket and attached!`);
    } catch {
      toast.error("Upload process failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const res = await fetch(
        `/api/models/${modelId}/media?mediaId=${mediaId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setModel(data.model);
      toast.success("Media item removed");
    } catch {
      toast.error("Failed to remove media");
    }
  };

  const updateField = (field: keyof ModelData, value: unknown) => {
    if (!model) return;
    setModel({ ...model, [field]: value });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!model) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/models")}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{model.name}</h1>
              <Badge
                className={
                  model.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }
              >
                {model.status}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Live Route: /model/{model.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <Link href={`/model/${model.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
              Preview Public Page
            </Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-xs"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-xs">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-xl font-semibold text-xs py-2 px-4"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            General Information
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-xl font-semibold text-xs py-2 px-4"
          >
            <Search className="mr-1.5 h-3.5 w-3.5" />
            SEO Strategy &amp; Tags
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-xl font-semibold text-xs py-2 px-4"
          >
            <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
            Media Sets ({model.media?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ========== GENERAL TAB ========== */}
        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold">Profile Details</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Basic information shown to users visiting /model/{model.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Display Name</Label>
                      <Input
                        value={model.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Route Slug</Label>
                      <Input
                        value={model.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Biography / Portfolio Overview</Label>
                    <Textarea
                      value={model.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 min-h-32"
                      rows={5}
                      placeholder="Write a rich biographical description..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Category</Label>
                    <Input
                      value={model.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      placeholder="e.g. Glamour, Fashion, Lifestyle, Fitness"
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Profile Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), handleAddTag())
                        }
                        placeholder="Type tag and press Enter"
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                      />
                      <Button
                        variant="outline"
                        onClick={handleAddTag}
                        className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {model.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 border-slate-200 gap-1 rounded-full px-3"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold">Key Visuals</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Main avatar picture and cover banner header
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Profile Image (Avatar URL)</Label>
                    <Input
                      value={model.profileImage}
                      onChange={(e) =>
                        updateField("profileImage", e.target.value)
                      }
                      placeholder="https://..."
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                    {model.profileImage && (
                      <img
                        src={model.profileImage}
                        alt="Profile preview"
                        className="mt-2 h-24 w-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Cover Banner (Header Image URL)</Label>
                    <Input
                      value={model.coverImage}
                      onChange={(e) =>
                        updateField("coverImage", e.target.value)
                      }
                      placeholder="https://..."
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                    {model.coverImage && (
                      <img
                        src={model.coverImage}
                        alt="Cover preview"
                        className="mt-2 h-36 w-full rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed SEO Article / About Content */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold flex items-center justify-between">
                    <span>Detailed SEO Article / About Content</span>
                    <Badge variant="outline" className="text-[10px] text-slate-500 font-normal">
                      Indexed in DOM &amp; Info Accordion
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Comprehensive biography, modeling career details, background story, and keyword-rich text to boost search engine rankings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Detailed About Story / Article</Label>
                    <Textarea
                      rows={10}
                      value={model.aboutContent || ""}
                      onChange={(e) => updateField("aboutContent", e.target.value)}
                      placeholder="Write a comprehensive article / biography about the model, career highlights, facts, and bio information for search engine indexation..."
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 leading-relaxed font-sans text-sm"
                    />
                    <p className="text-[11px] text-slate-400">
                      This text is always rendered in the page DOM for search engine crawlers, and accessible to visitors via the info icon accordion below the gallery.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-sm font-bold">Visibility &amp; Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Publication Status</Label>
                    <Select
                      value={model.status}
                      onValueChange={(v) =>
                        updateField("status", v as "draft" | "published")
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="published">Published (Visible to All)</SelectItem>
                        <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 block">Featured Creator</Label>
                      <span className="text-[11px] text-slate-400">Show on homepage spotlight</span>
                    </div>
                    <Switch
                      checked={model.featured}
                      onCheckedChange={(v) => updateField("featured", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 block">Reviewed Tag</Label>
                      <span className="text-[11px] text-slate-400">Mark portfolio as reviewed</span>
                    </div>
                    <Switch
                      checked={!!model.reviewed}
                      onCheckedChange={(v) => updateField("reviewed", v)}
                    />
                  </div>

                  <Separator className="bg-slate-100 my-2" />

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>Created: {new Date(model.createdAt).toLocaleString()}</p>
                    <p>Last Modified: {new Date(model.updatedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 bg-red-50/40 rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-red-700 text-xs font-bold uppercase tracking-wider">
                    Delete Route
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-100/70 rounded-xl text-xs font-bold"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete Model Profile
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold">
                          Delete &quot;{model.name}&quot;?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-xs">
                          This will permanently delete this model and all related media assets.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await fetch(`/api/models/${modelId}`, {
                              method: "DELETE",
                            });
                            toast.success("Model deleted");
                            router.push("/admin/models");
                          }}
                          className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========== SEO TAB ========== */}
        <TabsContent value="seo">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-600" />
                    Advanced Search Engine Optimization
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Fine-tune Google indexing, titles, descriptions, and crawler rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Focus Keyphrase</Label>
                    <Input
                      value={model.focusKeyphrase}
                      onChange={(e) =>
                        updateField("focusKeyphrase", e.target.value)
                      }
                      placeholder="e.g. Aditi Mistry photos videos"
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <Separator className="bg-slate-100 my-2" />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700">Meta Title</Label>
                      <span
                        className={`text-[11px] ${model.metaTitle.length > 60 ? "text-red-500 font-bold" : "text-slate-400"}`}
                      >
                        {model.metaTitle.length}/60
                      </span>
                    </div>
                    <Input
                      value={model.metaTitle}
                      onChange={(e) =>
                        updateField("metaTitle", e.target.value)
                      }
                      placeholder="Title tag for search engines"
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700">Meta Description</Label>
                      <span
                        className={`text-[11px] ${model.metaDescription.length > 155 ? "text-red-500 font-bold" : "text-slate-400"}`}
                      >
                        {model.metaDescription.length}/155
                      </span>
                    </div>
                    <Textarea
                      value={model.metaDescription}
                      onChange={(e) =>
                        updateField("metaDescription", e.target.value)
                      }
                      placeholder="Search snippet description (optimal 120-155 characters)"
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 min-h-20"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700">Meta Keywords</Label>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {model.metaKeywords.length} keywords
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddKeyword())
                        }
                        placeholder="Add keyword and press Enter"
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddKeyword}
                        className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setBulkKeywordsText("");
                          setBulkKeywordsOpen(true);
                        }}
                        className="rounded-xl border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 flex items-center gap-1.5 font-semibold"
                      >
                        <ListPlus className="w-4 h-4 text-indigo-600" />
                        Bulk
                      </Button>
                    </div>
                    {model.metaKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                        {model.metaKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 rounded-full px-3 shrink-0"
                          >
                            {kw}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(kw)}
                              className="ml-1 hover:text-red-600 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Canonical URL Override</Label>
                    <Input
                      value={model.canonicalUrl}
                      onChange={(e) =>
                        updateField("canonicalUrl", e.target.value)
                      }
                      placeholder={`https://vixn.fun/model/${model.slug}`}
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Robots Directive</Label>
                    <Select
                      value={model.robotsDirective || "index, follow"}
                      onValueChange={(v) =>
                        updateField("robotsDirective", v)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="index, follow">Index, Follow (Recommended)</SelectItem>
                        <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                        <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                        <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 block">Cornerstone Content</Label>
                      <span className="text-[11px] text-slate-400">Mark as primary authority pillar</span>
                    </div>
                    <Switch
                      checked={model.cornerstone}
                      onCheckedChange={(v) => updateField("cornerstone", v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Meta */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold">
                    Open Graph &amp; Social Card Tags
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Custom share cards for Twitter, Telegram, WhatsApp &amp; Facebook
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">OG Title</Label>
                    <Input
                      value={model.ogTitle}
                      onChange={(e) =>
                        updateField("ogTitle", e.target.value)
                      }
                      placeholder={model.metaTitle || "Open Graph title"}
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">OG Description</Label>
                    <Textarea
                      value={model.ogDescription}
                      onChange={(e) =>
                        updateField("ogDescription", e.target.value)
                      }
                      placeholder={model.metaDescription || "Open Graph description"}
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">OG Share Image URL</Label>
                    <Input
                      value={model.ogImage}
                      onChange={(e) =>
                        updateField("ogImage", e.target.value)
                      }
                      placeholder="1200x630 share image URL"
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SERP & Checklist */}
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs sticky top-6">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-xs font-bold uppercase tracking-wider">
                    Google Snippet Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                    <p className="text-sm font-bold text-blue-600 truncate hover:underline">
                      {model.metaTitle || `${model.name} - Photos & Videos | VIXN`}
                    </p>
                    <p className="text-xs text-emerald-700 font-mono truncate">
                      vixn.fun › model › {model.slug}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {model.metaDescription ||
                        `Explore ${model.name}'s exclusive photo gallery and video collection on VIXN.`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-xs font-bold uppercase tracking-wider">
                    SEO Health Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {[
                    {
                      label: "Meta title specified",
                      ok: model.metaTitle.length > 0,
                    },
                    {
                      label: "Title ≤ 60 characters",
                      ok:
                        model.metaTitle.length > 0 &&
                        model.metaTitle.length <= 60,
                    },
                    {
                      label: "Meta description specified",
                      ok: model.metaDescription.length > 0,
                    },
                    {
                      label: "Description optimal length",
                      ok:
                        model.metaDescription.length >= 100 &&
                        model.metaDescription.length <= 160,
                    },
                    {
                      label: "Focus keyphrase configured",
                      ok: model.focusKeyphrase.length > 0,
                    },
                    {
                      label: "OG Image set",
                      ok: (model.ogImage || model.profileImage).length > 0,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${item.ok ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <span
                        className={
                          item.ok ? "text-slate-700 font-medium" : "text-slate-400"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========== MEDIA TAB ========== */}
        <TabsContent value="media">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-xs">
            <CardHeader className="flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-slate-900 text-base font-bold">Media Assets Manager</CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Upload photos and videos to Cloudflare R2 or link external URLs
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Upload to R2 Dialog */}
                <Dialog
                  open={uploadDialogOpen}
                  onOpenChange={setUploadDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                      Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Upload to Supabase Storage</DialogTitle>
                      <DialogDescription className="text-slate-500 text-xs">
                        Direct upload of photos to &quot;images&quot; bucket and videos to &quot;videos&quot; bucket
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100/60 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-semibold text-slate-700">
                          {uploading
                            ? "Uploading to Supabase..."
                            : "Click to select a photo or video"}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          JPG, PNG, WebP, GIF, MP4, WebM, MOV (up to 100MB)
                        </span>
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add URL Dialog */}
                <Dialog
                  open={mediaDialogOpen}
                  onOpenChange={setMediaDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Direct URL
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Add Media by URL</DialogTitle>
                      <DialogDescription className="text-slate-500 text-xs">
                        Attach a photo or video hosted on CDN or Cloudflare
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Media Type</Label>
                        <Select
                          value={newMedia.type}
                          onValueChange={(v) =>
                            setNewMedia({
                              ...newMedia,
                              type: v as "photo" | "video",
                            })
                          }
                        >
                          <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="photo">Photo</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">
                          {newMedia.type === "video" ? "Video Stream / File URL *" : "Photo URL *"}
                        </Label>
                        <Input
                          value={newMedia.url}
                          onChange={(e) =>
                            setNewMedia({ ...newMedia, url: e.target.value })
                          }
                          placeholder={newMedia.type === "video" ? "https://.../video.mp4" : "https://.../photo.jpg"}
                          className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                        />
                      </div>

                      {newMedia.type === "video" && (
                        <>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>Video Thumbnail / Poster Image URL</span>
                              <span className="text-[10px] text-slate-400 font-normal">Shown as card preview</span>
                            </Label>
                            <Input
                              value={newMedia.thumbnail}
                              onChange={(e) =>
                                setNewMedia({ ...newMedia, thumbnail: e.target.value })
                              }
                              placeholder="https://.../video-thumbnail.jpg"
                              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="space-y-0.5 pr-2">
                              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                                External Redirect Video Link
                              </Label>
                              <p className="text-[11px] text-slate-500">
                                When clicked, users are redirected to the external streaming page in a new tab instead of playing here
                              </p>
                            </div>
                            <Switch
                              checked={newMedia.isExternal}
                              onCheckedChange={(checked) =>
                                setNewMedia({ ...newMedia, isExternal: checked })
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Title Caption</Label>
                        <Input
                          value={newMedia.title}
                          onChange={(e) =>
                            setNewMedia({
                              ...newMedia,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Exclusive Studio Session 01"
                          className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Alt Text (SEO Image Ranking)</Label>
                        <Input
                          value={newMedia.alt}
                          onChange={(e) =>
                            setNewMedia({ ...newMedia, alt: e.target.value })
                          }
                          placeholder="Descriptive text for Google Image Search"
                          className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>SEO Keywords</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Comma-separated (appends to model SEO)
                          </span>
                        </Label>
                        <Input
                          value={newMedia.keywords}
                          onChange={(e) =>
                            setNewMedia({ ...newMedia, keywords: e.target.value })
                          }
                          placeholder="e.g. aditi mistry bikini, 4k shoot, exclusive clip"
                          className="rounded-xl border-slate-200 bg-slate-50 text-slate-900"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setMediaDialogOpen(false)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMedia}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                      >
                        Add to Gallery
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {model.media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-800 text-sm">No media assets in gallery</p>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                    Upload photos/videos or add direct URLs to populate the public viewer.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {model.media.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                    >
                      {item.type === "photo" ? (
                        <img
                          src={item.url}
                          alt={item.alt || item.title}
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-44 bg-slate-900 flex items-center justify-center overflow-hidden">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title || "Video thumbnail"}
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : null}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                              <VideoIcon className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <Badge className="bg-slate-800 text-white text-[10px] rounded-full">
                              VIDEO
                            </Badge>
                            {item.isExternal && (
                              <Badge className="bg-indigo-600 text-white text-[10px] rounded-full flex items-center gap-0.5">
                                <ExternalLink className="w-2.5 h-2.5" />
                                REDIRECT
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-3 bg-white">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.title || "Untitled Media"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {item.alt || "No SEO alt text set"}
                        </p>
                        {item.keywords && item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.keywords.slice(0, 3).map((kw, ki) => (
                              <span
                                key={ki}
                                className="text-[9px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded"
                              >
                                #{kw}
                              </span>
                            ))}
                            {item.keywords.length > 3 && (
                              <span className="text-[9px] text-slate-400 font-medium">
                                +{item.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteMedia(item._id)}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white cursor-pointer"
                        title="Delete media"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Bulk Meta Keywords Dialog */}
      <Dialog open={bulkKeywordsOpen} onOpenChange={setBulkKeywordsOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-lg rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
              <ListPlus className="w-5 h-5 text-indigo-600" />
              Add Meta Keywords in Bulk
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Paste keywords line-by-line (or comma-separated). Duplicates and empty lines will be automatically filtered out.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 flex-1 overflow-hidden flex flex-col min-h-0">
            <Textarea
              value={bulkKeywordsText}
              onChange={(e) => setBulkKeywordsText(e.target.value)}
              placeholder={`aditi mistry photos\naditi mistry 4k videos\naditi mistry instagram\naditi mistry full portfolio`}
              className="h-60 max-h-60 min-h-[15rem] rounded-xl border-slate-200 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white resize-none overflow-y-auto leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
              <span>One keyword per line</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-semibold">
                {
                  bulkKeywordsText
                    .split(/\r?\n|,/)
                    .map((k) => k.trim())
                    .filter(Boolean).length
                }{" "}
                keywords detected
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkKeywordsOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddBulkKeywords}
              disabled={!bulkKeywordsText.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Add Keywords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
