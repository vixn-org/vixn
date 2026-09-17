"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Avatar,
  Skeleton,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  OpenInNew as OpenInNewIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Add as AddIcon,
  CloudUploadOutlined as CloudUploadIcon,
  PhotoLibraryOutlined as PhotoLibraryIcon,
  VideoLibraryOutlined as VideoLibraryIcon,
  LanguageOutlined as GlobeIcon,
  Search as SearchIcon,
  ArticleOutlined as ArticleIcon,
  Close as CloseIcon,
  AutoAwesomeOutlined as SparklesIcon,
  CheckCircleOutlined as CheckCircleIcon,
  PlaylistAddOutlined as PlaylistAddIcon,
  PhotoCameraOutlined as CameraIcon,
  MovieOutlined as MovieIcon,
  TuneOutlined as TuneIcon,
  ShareOutlined as ShareIcon,
} from "@mui/icons-material";
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

interface SubPageSeoData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  heading?: string;
  introText?: string;
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
  photosSeo?: SubPageSeoData;
  videosSeo?: SubPageSeoData;
  bio: string;
  aboutContent?: string;
  profileImage: string;
  coverImage: string;
  media: MediaItem[];
  tags: string[];
  category: string;
  country?: string;
  status: "draft" | "published";
  featured: boolean;
  reviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ModelManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const modelId = params.id as string;

  const [model, setModel] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const hasInitializedTab = useRef(false);

  useEffect(() => {
    if (session?.user && !hasInitializedTab.current) {
      hasInitializedTab.current = true;
      const hashTab =
        typeof window !== "undefined"
          ? window.location.hash.replace("#", "")
          : "";
      const validTabs = [
        "general",
        "seo",
        "photos-seo",
        "videos-seo",
        "media",
      ];
      if (hashTab && validTabs.includes(hashTab)) {
        setActiveTab(hashTab);
        return;
      }
      const role = (session.user as any).role;
      if (role === "admin") {
        setActiveTab("general");
      } else {
        setActiveTab("media");
      }
    }
  }, [session]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${val}`);
    }
  };

  // Tag & Keyword inputs
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [photoKeywordInput, setPhotoKeywordInput] = useState("");
  const [videoKeywordInput, setVideoKeywordInput] = useState("");
  const [bulkKeywordsOpen, setBulkKeywordsOpen] = useState(false);
  const [bulkKeywordsText, setBulkKeywordsText] = useState("");
  const [bulkKeywordsTarget, setBulkKeywordsTarget] = useState<
    "main" | "photos" | "videos"
  >("main");

  // Direct URL Media Modal
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [directMediaAdding, setDirectMediaAdding] = useState(false);
  const [newMedia, setNewMedia] = useState({
    type: "photo" as "photo" | "video",
    url: "",
    thumbnail: "",
    title: "",
    alt: "",
    keywords: "",
    isExternal: true,
  });

  // Media File Upload Dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"photo" | "video">("photo");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    alt: "",
    keywords: "",
    videoUrl: "",
    thumbnailUrl: "",
    thumbnailFile: null as File | null,
    thumbnailPreview: "",
  });

  // Delete Media Dialog State
  const [deleteMediaDialogOpen, setDeleteMediaDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  // Avatar & Cover Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

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

  const updateField = (field: keyof ModelData, value: unknown) => {
    if (!model) return;
    setModel({ ...model, [field]: value });
  };

  const updatePhotosSeo = (field: keyof SubPageSeoData, value: unknown) => {
    if (!model) return;
    setModel({
      ...model,
      photosSeo: {
        ...(model.photosSeo || {}),
        [field]: value,
      },
    });
  };

  const updateVideosSeo = (field: keyof SubPageSeoData, value: unknown) => {
    if (!model) return;
    setModel({
      ...model,
      videosSeo: {
        ...(model.videosSeo || {}),
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!model) return;

    if (model.metaTitle && model.metaTitle.length > 60) {
      toast.error(
        `Meta title is too long (${model.metaTitle.length}/60 chars). Maximum allowed is 60.`
      );
      return;
    }
    if (model.metaDescription && model.metaDescription.length > 155) {
      toast.error(
        `Meta description is too long (${model.metaDescription.length}/155 chars). Maximum allowed is 155.`
      );
      return;
    }
    if (model.photosSeo?.metaTitle && model.photosSeo.metaTitle.length > 60) {
      toast.error(
        `Photos meta title is too long (${model.photosSeo.metaTitle.length}/60 chars). Maximum allowed is 60.`
      );
      return;
    }
    if (
      model.photosSeo?.metaDescription &&
      model.photosSeo.metaDescription.length > 155
    ) {
      toast.error(
        `Photos meta description is too long (${model.photosSeo.metaDescription.length}/155 chars). Maximum allowed is 155.`
      );
      return;
    }
    if (model.videosSeo?.metaTitle && model.videosSeo.metaTitle.length > 60) {
      toast.error(
        `Videos meta title is too long (${model.videosSeo.metaTitle.length}/60 chars). Maximum allowed is 60.`
      );
      return;
    }
    if (
      model.videosSeo?.metaDescription &&
      model.videosSeo.metaDescription.length > 155
    ) {
      toast.error(
        `Videos meta description is too long (${model.videosSeo.metaDescription.length}/155 chars). Maximum allowed is 155.`
      );
      return;
    }

    setSaving(true);
    try {
      const cleanedModel = {
        ...model,
        metaTitle: model.metaTitle
          ? model.metaTitle
              .replace(
                /(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i,
                ""
              )
              .trim()
          : model.metaTitle,
        ogTitle: model.ogTitle
          ? model.ogTitle
              .replace(
                /(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i,
                ""
              )
              .trim()
          : model.ogTitle,
        photosSeo: model.photosSeo
          ? {
              ...model.photosSeo,
              metaTitle: model.photosSeo.metaTitle
                ? model.photosSeo.metaTitle
                    .replace(
                      /(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i,
                      ""
                    )
                    .trim()
                : model.photosSeo.metaTitle,
            }
          : model.photosSeo,
        videosSeo: model.videosSeo
          ? {
              ...model.videosSeo,
              metaTitle: model.videosSeo.metaTitle
                ? model.videosSeo.metaTitle
                    .replace(
                      /(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i,
                      ""
                    )
                    .trim()
                : model.videosSeo.metaTitle,
            }
          : model.videosSeo,
      };

      const res = await fetch(`/api/models/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedModel),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }

      const data = await res.json();
      setModel(data.model);
      toast.success("All model changes saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Tags Management
  const handleAddTag = () => {
    if (!tagInput.trim() || !model) return;
    const tag = tagInput.trim().toLowerCase();
    if (!model.tags.includes(tag)) {
      updateField("tags", [...model.tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!model) return;
    updateField(
      "tags",
      model.tags.filter((t) => t !== tag)
    );
  };

  // Keyword Management
  const handleAddKeyword = () => {
    if (!keywordInput.trim() || !model) return;
    const kw = keywordInput.trim().toLowerCase();
    if (!model.metaKeywords.includes(kw)) {
      updateField("metaKeywords", [...model.metaKeywords, kw]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    if (!model) return;
    updateField(
      "metaKeywords",
      model.metaKeywords.filter((k) => k !== kw)
    );
  };

  const handleAddPhotoKeyword = () => {
    if (!photoKeywordInput.trim() || !model) return;
    const kw = photoKeywordInput.trim().toLowerCase();
    const current = model.photosSeo?.metaKeywords || [];
    if (!current.includes(kw)) {
      updatePhotosSeo("metaKeywords", [...current, kw]);
    }
    setPhotoKeywordInput("");
  };

  const handleRemovePhotoKeyword = (kw: string) => {
    if (!model) return;
    const current = model.photosSeo?.metaKeywords || [];
    updatePhotosSeo(
      "metaKeywords",
      current.filter((k) => k !== kw)
    );
  };

  const handleAddVideoKeyword = () => {
    if (!videoKeywordInput.trim() || !model) return;
    const kw = videoKeywordInput.trim().toLowerCase();
    const current = model.videosSeo?.metaKeywords || [];
    if (!current.includes(kw)) {
      updateVideosSeo("metaKeywords", [...current, kw]);
    }
    setVideoKeywordInput("");
  };

  const handleRemoveVideoKeyword = (kw: string) => {
    if (!model) return;
    const current = model.videosSeo?.metaKeywords || [];
    updateVideosSeo(
      "metaKeywords",
      current.filter((k) => k !== kw)
    );
  };

  const handleAddBulkKeywords = () => {
    if (!bulkKeywordsText.trim() || !model) return;
    const parsed = bulkKeywordsText
      .split(/\r?\n|,/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (bulkKeywordsTarget === "photos") {
      const current = model.photosSeo?.metaKeywords || [];
      const newKeywords = Array.from(new Set([...current, ...parsed]));
      updatePhotosSeo("metaKeywords", newKeywords);
      toast.success(
        `Added ${newKeywords.length - current.length} photo keywords`
      );
    } else if (bulkKeywordsTarget === "videos") {
      const current = model.videosSeo?.metaKeywords || [];
      const newKeywords = Array.from(new Set([...current, ...parsed]));
      updateVideosSeo("metaKeywords", newKeywords);
      toast.success(
        `Added ${newKeywords.length - current.length} video keywords`
      );
    } else {
      const current = model.metaKeywords || [];
      const newKeywords = Array.from(new Set([...current, ...parsed]));
      updateField("metaKeywords", newKeywords);
      toast.success(`Added ${newKeywords.length - current.length} keywords`);
    }

    setBulkKeywordsText("");
    setBulkKeywordsOpen(false);
  };

  // Media Direct URL Add
  const handleAddMedia = async () => {
    if (!newMedia.url.trim()) {
      toast.error(
        newMedia.type === "video"
          ? "Video stream / redirect URL is required"
          : "Photo URL is required"
      );
      return;
    }
    setDirectMediaAdding(true);
    try {
      const res = await fetch(`/api/models/${modelId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMedia,
          isExternal: newMedia.type === "video" ? true : newMedia.isExternal,
        }),
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
        isExternal: true,
      });
      setMediaDialogOpen(false);
      toast.success("Media item added to gallery");
    } catch {
      toast.error("Failed to add media item");
    } finally {
      setDirectMediaAdding(false);
    }
  };

  // Media File Upload
  const handleSelectUploadFile = (file: File | null) => {
    if (!file) {
      setUploadFile(null);
      setUploadPreview("");
      return;
    }
    if (file.type.startsWith("video/")) {
      toast.error(
        "Direct video uploads are disabled. Videos must be linked via external redirect URL."
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);

    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setUploadForm((prev) => ({
      ...prev,
      title: prev.title || cleanName,
      alt: prev.alt || `${model?.name || "Model"} exclusive photoshoot`,
    }));
  };

  const handleSelectThumbnailFile = (file: File | null) => {
    if (!file) {
      setUploadForm((prev) => ({
        ...prev,
        thumbnailFile: null,
        thumbnailPreview: "",
      }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Poster thumbnail must be an image file.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUploadForm((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailPreview: objectUrl,
    }));
  };

  const handlePerformUpload = async () => {
    if (uploadType === "photo") {
      if (!uploadFile) {
        toast.error("Please select an image file to upload");
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", uploadFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Image upload failed");
          return;
        }

        const data = await res.json();

        const mediaRes = await fetch(`/api/models/${modelId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "photo",
            url: data.url,
            title: uploadForm.title.trim() || data.filename,
            alt: uploadForm.alt.trim() || `${model?.name || "Model"} photo`,
            keywords: uploadForm.keywords.trim(),
            isExternal: false,
          }),
        });

        if (!mediaRes.ok) throw new Error();

        const mediaData = await mediaRes.json();
        setModel(mediaData.model);
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadPreview("");
        setUploadForm({
          title: "",
          alt: "",
          keywords: "",
          videoUrl: "",
          thumbnailUrl: "",
          thumbnailFile: null,
          thumbnailPreview: "",
        });
        toast.success("Photo uploaded and added to media set!");
      } catch {
        toast.error("Failed to upload photo");
      } finally {
        setUploading(false);
      }
    } else {
      if (!uploadForm.videoUrl.trim()) {
        toast.error("Please enter a video streaming or redirect URL");
        return;
      }

      setUploading(true);
      try {
        let finalThumbnailUrl = uploadForm.thumbnailUrl.trim();

        if (uploadForm.thumbnailFile) {
          const thumbFormData = new FormData();
          thumbFormData.append("file", uploadForm.thumbnailFile);

          const thumbRes = await fetch("/api/upload", {
            method: "POST",
            body: thumbFormData,
          });

          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            finalThumbnailUrl = thumbData.url;
          }
        }

        const mediaRes = await fetch(`/api/models/${modelId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video",
            url: uploadForm.videoUrl.trim(),
            thumbnail: finalThumbnailUrl,
            title: uploadForm.title.trim() || "Exclusive Video",
            alt:
              uploadForm.alt.trim() ||
              `${model?.name || "Model"} exclusive video`,
            keywords: uploadForm.keywords.trim(),
            isExternal: true,
          }),
        });

        if (!mediaRes.ok) throw new Error();

        const mediaData = await mediaRes.json();
        setModel(mediaData.model);
        setUploadDialogOpen(false);
        setUploadForm({
          title: "",
          alt: "",
          keywords: "",
          videoUrl: "",
          thumbnailUrl: "",
          thumbnailFile: null,
          thumbnailPreview: "",
        });
        toast.success("Video redirect added to media set!");
      } catch {
        toast.error("Failed to add video");
      } finally {
        setUploading(false);
      }
    }
  };

  // Avatar & Cover Uploads
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP)");
      return;
    }
    setUploadingAvatar(true);
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
      updateField("profileImage", data.url);
      toast.success("Avatar image uploaded successfully!");
    } catch {
      toast.error("Failed to upload avatar image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP)");
      return;
    }
    setUploadingCover(true);
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
      updateField("coverImage", data.url);
      toast.success("Cover banner image uploaded successfully!");
    } catch {
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  // Delete Media Item
  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return;
    try {
      const res = await fetch(
        `/api/models/${modelId}/media?mediaId=${mediaToDelete._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setModel(data.model);
      setDeleteMediaDialogOpen(false);
      setMediaToDelete(null);
      toast.success("Media item removed from gallery");
    } catch {
      toast.error("Failed to remove media item");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rounded" width={240} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rounded" width="100%" height={400} sx={{ borderRadius: 1.5 }} />
      </Box>
    );
  }

  if (!model) return null;

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Back to Models Directory">
            <IconButton
              size="small"
              onClick={() => router.push("/admin/models")}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                  fontSize: { xs: "1.3rem", sm: "1.5rem" },
                }}
              >
                {model.name}
              </Typography>
              <Chip
                label={model.status === "published" ? "Published" : "Draft"}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  borderRadius: 1,
                  ...(model.status === "published"
                    ? {
                        bgcolor: "#ecfdf5",
                        color: "#059669",
                        border: "1px solid #a7f3d0",
                      }
                    : {
                        bgcolor: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }),
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                color: "#64748b",
                fontSize: "0.75rem",
                display: "block",
                mt: 0.25,
              }}
            >
              Live Route: /model/{model.slug}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            href={`/model/${model.slug}`}
            target="_blank"
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              borderColor: "#e2e8f0",
              color: "#334155",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textTransform: "none",
              px: 1.75,
              py: 0.75,
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Preview Page
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              bgcolor: "#0f172a",
              color: "#ffffff",
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              px: 2,
              py: 0.75,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
            }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation Bar */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 1.5,
          p: 0.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => handleTabChange(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              minHeight: 36,
              py: 0.75,
              px: 1.75,
              borderRadius: 1,
              color: "#64748b",
              mr: 0.5,
              transition: "all 0.15s ease",
              "&.Mui-selected": {
                bgcolor: "#0f172a",
                color: "#ffffff",
              },
            },
          }}
        >
          {isAdmin && (
            <Tab
              value="general"
              label="General Info"
              icon={<ArticleIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          )}
          {isAdmin && (
            <Tab
              value="seo"
              label="Main SEO &amp; Tags"
              icon={<GlobeIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          )}
          {isAdmin && (
            <Tab
              value="photos-seo"
              label="Photos Page SEO"
              icon={<CameraIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          )}
          {isAdmin && (
            <Tab
              value="videos-seo"
              label="Videos Page SEO"
              icon={<MovieIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          )}
          <Tab
            value="media"
            label={`Media Sets (${model.media?.length || 0})`}
            icon={<PhotoLibraryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ======================================================== */}
      {/* 1. GENERAL INFORMATION TAB */}
      {/* ======================================================== */}
      {activeTab === "general" && isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Left Column: Profile Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Profile Details
                  </Typography>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Core model metadata rendered at /model/{model.slug}
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Display Name *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Route Slug *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      slotProps={{
                        input: {
                          sx: {
                            borderRadius: 1,
                            bgcolor: "#f8fafc",
                            fontSize: "0.875rem",
                            fontFamily: "monospace",
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Biography &amp; Career Summary
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={model.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Write a rich biographical overview of the creator..."
                    slotProps={{
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Category / Niche
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      placeholder="e.g. Glamour, Fashion, Lifestyle"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Country / Origin
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.country || ""}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="e.g. India, United States"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Profile Tags */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Profile Tags
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag and press Enter"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#e2e8f0",
                        color: "#334155",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  {model.tags && model.tags.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                        mt: 1.5,
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {model.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() => handleRemoveTag(tag)}
                          sx={{
                            borderRadius: 1,
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "#334155",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: Imagery & Controls */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Imagery Card */}
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Imagery Assets
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Profile Avatar */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Avatar Photo
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={model.profileImage || undefined}
                      variant="rounded"
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 1,
                        bgcolor: "#f1f5f9",
                        color: "#334155",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {model.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <label style={{ cursor: "pointer" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component="span"
                          disabled={uploadingAvatar}
                          startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: 1,
                            borderColor: "#e2e8f0",
                            color: "#334155",
                            fontSize: "0.75rem",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      <TextField
                        size="small"
                        placeholder="or paste image URL"
                        value={model.profileImage || ""}
                        onChange={(e) => updateField("profileImage", e.target.value)}
                        slotProps={{
                          input: {
                            sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.75rem" },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                {/* Cover Banner */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Cover Banner
                  </Typography>
                  {model.coverImage && (
                    <Box
                      component="img"
                      src={model.coverImage}
                      alt="Cover preview"
                      sx={{
                        width: "100%",
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid #e2e8f0",
                        mb: 1,
                      }}
                    />
                  )}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Cover image URL"
                      value={model.coverImage || ""}
                      onChange={(e) => updateField("coverImage", e.target.value)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.75rem" },
                        },
                      }}
                    />
                    <label style={{ cursor: "pointer" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        disabled={uploadingCover}
                        startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: 1,
                          borderColor: "#e2e8f0",
                          color: "#334155",
                          fontSize: "0.75rem",
                          textTransform: "none",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {uploadingCover ? "..." : "Upload"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Publishing Controls Card */}
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Publication Controls
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Status
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={model.status}
                      onChange={(e) => updateField("status", e.target.value)}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "#f8fafc",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                      }}
                    >
                      <MenuItem value="published">Published (Live for Public)</MenuItem>
                      <MenuItem value="draft">Draft (Admin Only)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                      Reviewed Model
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Mark verification checklist complete
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={!!model.reviewed}
                    onChange={(e) => updateField("reviewed", e.target.checked)}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                      Featured Creator
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Promote on home feeds &amp; top banners
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={!!model.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                      Cornerstone Content
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Primary domain authority pillar
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={!!model.cornerstone}
                    onChange={(e) => updateField("cornerstone", e.target.checked)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN SEO & TAGS TAB */}
      {/* ======================================================== */}
      {activeTab === "seo" && isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Left Column: Search Optimization */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Search Engine Optimization (SEO)
                  </Typography>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Configure organic search indexing snippet, keyphrases, and crawler directives
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Focus Keyphrase */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Focus Keyphrase
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.focusKeyphrase || ""}
                    onChange={(e) => updateField("focusKeyphrase", e.target.value)}
                    placeholder="e.g. Aditi Mistry photos videos"
                    slotProps={{
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                    }}
                  />
                </Box>

                {/* Meta Title */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Meta Title (Google Snippet)
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          model.metaTitle.length === 0
                            ? "#94a3b8"
                            : model.metaTitle.length <= 60
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {model.metaTitle.length}/60{" "}
                      {model.metaTitle.length > 60
                        ? "(Too long!)"
                        : model.metaTitle.length >= 25
                        ? "(Optimal)"
                        : ""}
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.metaTitle || ""}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="Title tag for search engines (max 60 chars)"
                    helperText='Max 60 chars. Do NOT append "| VIXN" (added automatically).'
                    slotProps={{
                      htmlInput: { maxLength: 60 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Meta Description */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Meta Description (Search Snippet)
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          model.metaDescription.length === 0
                            ? "#94a3b8"
                            : model.metaDescription.length < 50
                            ? "#d97706"
                            : model.metaDescription.length <= 155
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {model.metaDescription.length}/155{" "}
                      {model.metaDescription.length > 155
                        ? "(Too long!)"
                        : model.metaDescription.length >= 120
                        ? "(Optimal: 120-155)"
                        : model.metaDescription.length >= 50
                        ? "(Good)"
                        : ""}
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={model.metaDescription || ""}
                    onChange={(e) => updateField("metaDescription", e.target.value)}
                    placeholder="Search snippet description (strict limit: 50–155 characters)"
                    helperText="Strict limit: 155 characters. Avoid stuffing comma lists; write natural sentences."
                    slotProps={{
                      htmlInput: { maxLength: 155 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Meta Keywords */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Meta Keywords
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {model.metaKeywords?.length || 0} keywords
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
                      }
                      placeholder="Add keyword and press Enter"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddKeyword}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#e2e8f0",
                        color: "#334155",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setBulkKeywordsTarget("main");
                        setBulkKeywordsText("");
                        setBulkKeywordsOpen(true);
                      }}
                      startIcon={<PlaylistAddIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#cbd5e1",
                        color: "#1e293b",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Bulk
                    </Button>
                  </Box>

                  {model.metaKeywords && model.metaKeywords.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                        mt: 1.5,
                        maxHeight: 160,
                        overflowY: "auto",
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {model.metaKeywords.map((kw) => (
                        <Chip
                          key={kw}
                          label={kw}
                          size="small"
                          onDelete={() => handleRemoveKeyword(kw)}
                          sx={{
                            borderRadius: 1,
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "#334155",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Canonical & Robots */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Canonical URL Override
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.canonicalUrl || ""}
                      onChange={(e) => updateField("canonicalUrl", e.target.value)}
                      placeholder={`https://vixn.fun/model/${model.slug}`}
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      Robots Directive
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={model.robotsDirective || "index, follow"}
                        onChange={(e) => updateField("robotsDirective", e.target.value)}
                        sx={{ borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.8125rem" }}
                      >
                        <MenuItem value="index, follow">Index, Follow (Recommended)</MenuItem>
                        <MenuItem value="noindex, follow">No Index, Follow</MenuItem>
                        <MenuItem value="index, nofollow">Index, No Follow</MenuItem>
                        <MenuItem value="noindex, nofollow">No Index, No Follow</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Social Media OpenGraph Card */}
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Social Sharing Cards (OpenGraph &amp; Twitter)
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      OG Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.ogTitle || ""}
                      onChange={(e) => updateField("ogTitle", e.target.value)}
                      placeholder="OpenGraph social title"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                      OG Image URL (1200x630)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={model.ogImage || ""}
                      onChange={(e) => updateField("ogImage", e.target.value)}
                      placeholder="https://.../og-preview.jpg"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    OG Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={model.ogDescription || ""}
                    onChange={(e) => updateField("ogDescription", e.target.value)}
                    placeholder="Social snippet description..."
                    slotProps={{
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Editorial / About Content Card */}
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
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    Editorial Article &amp; About Story
                  </Typography>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                    In-depth editorial biography for long-tail SEO ranking and indexing authority
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={model.aboutContent || ""}
                  onChange={(e) => updateField("aboutContent", e.target.value)}
                  placeholder="Write a long-form article covering career biography, photoshoot highlights, media background..."
                  slotProps={{
                    input: {
                      sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem", lineHeight: 1.6 },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: SERP Preview & Checklist */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* SERP Preview */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
                position: "sticky",
                top: 20,
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                    Google SERP Preview
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5, px: 2 }}
              />
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1a0dab",
                      lineHeight: 1.3,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.metaTitle
                      ? `${model.metaTitle.replace(/\s*(?:[|\-–—:]|\bon\b)\s*VIXN/gi, "").trim()} | VIXN`
                      : `${model.name} - Photos & Videos | VIXN`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontFamily: "monospace",
                      color: "#006621",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    https://vixn.fun/model/{model.slug}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#4d5156",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                    }}
                  >
                    {model.metaDescription ||
                      `Explore ${model.name}'s exclusive photo gallery and video collection on VIXN.`}
                  </Typography>
                </Box>

                {/* SEO Checklist */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    SEO Checklist
                  </Typography>
                  {[
                    { label: "Meta title within 60 chars", ok: model.metaTitle.length > 0 && model.metaTitle.length <= 60 },
                    { label: "Description optimal (50–155 chars)", ok: model.metaDescription.length >= 50 && model.metaDescription.length <= 155 },
                    { label: "Focus keyphrase specified", ok: Boolean(model.focusKeyphrase?.length) },
                    { label: "Avatar image uploaded", ok: Boolean(model.profileImage?.length) },
                    { label: "Has media items in gallery", ok: Boolean(model.media?.length) },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: item.ok ? "#10b981" : "#cbd5e1",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: item.ok ? 600 : 400,
                          color: item.ok ? "#334155" : "#94a3b8",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 3. PHOTOS PAGE SEO TAB */}
      {/* ======================================================== */}
      {activeTab === "photos-seo" && isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                      Dedicated Photos Page SEO &amp; Copy
                    </Typography>
                    <Chip
                      label={`/model/${model.slug}/photos`}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        borderRadius: 1,
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </Box>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                    Target &quot;{model.name} photos&quot;, &quot;{model.name} photoshoot pics&quot;, and gallery queries
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Custom Page Heading (H1) */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Custom Page Heading (H1)
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {(model.photosSeo?.heading || "").length}/80
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.photosSeo?.heading || ""}
                    onChange={(e) => updatePhotosSeo("heading", e.target.value)}
                    placeholder={`e.g. ${model.name} HD Photos, Exclusive Picture Galleries`}
                    helperText={`Defaults dynamically to "${model.name} Photo Sets & HD Gallery" if left blank.`}
                    slotProps={{
                      htmlInput: { maxLength: 80 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Photos Page Meta Title */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Photos Meta Title
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          (model.photosSeo?.metaTitle || "").length === 0
                            ? "#94a3b8"
                            : (model.photosSeo?.metaTitle || "").length <= 60
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {(model.photosSeo?.metaTitle || "").length}/60
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.photosSeo?.metaTitle || ""}
                    onChange={(e) => updatePhotosSeo("metaTitle", e.target.value)}
                    placeholder={`e.g. ${model.name} Photos, HD Galleries & Pictures`}
                    helperText='Max 60 chars. Do NOT include "| VIXN" (added automatically).'
                    slotProps={{
                      htmlInput: { maxLength: 60 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Photos Page Meta Description */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Photos Meta Description
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          (model.photosSeo?.metaDescription || "").length === 0
                            ? "#94a3b8"
                            : (model.photosSeo?.metaDescription || "").length <= 155
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {(model.photosSeo?.metaDescription || "").length}/155
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    value={model.photosSeo?.metaDescription || ""}
                    onChange={(e) => updatePhotosSeo("metaDescription", e.target.value)}
                    placeholder={`e.g. Browse all exclusive high-definition photoshoot pictures and photo sets of ${model.name} on VIXN.`}
                    helperText="Strict limit: 155 characters for search engines."
                    slotProps={{
                      htmlInput: { maxLength: 155 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Photos SEO Keywords */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Photo Specific Keywords
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {(model.photosSeo?.metaKeywords || []).length} keywords
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={photoKeywordInput}
                      onChange={(e) => setPhotoKeywordInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddPhotoKeyword())
                      }
                      placeholder="Add photo keyword and press Enter"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddPhotoKeyword}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#e2e8f0",
                        color: "#334155",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setBulkKeywordsTarget("photos");
                        setBulkKeywordsText("");
                        setBulkKeywordsOpen(true);
                      }}
                      startIcon={<PlaylistAddIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#cbd5e1",
                        color: "#1e293b",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Bulk
                    </Button>
                  </Box>

                  {(model.photosSeo?.metaKeywords || []).length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                        mt: 1.5,
                        maxHeight: 140,
                        overflowY: "auto",
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {model.photosSeo?.metaKeywords?.map((kw) => (
                        <Chip
                          key={kw}
                          label={kw}
                          size="small"
                          onDelete={() => handleRemovePhotoKeyword(kw)}
                          sx={{
                            borderRadius: 1,
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "#334155",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Photos Intro Text */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Photo Gallery Editorial Story / Intro Paragraph
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={model.photosSeo?.introText || ""}
                    onChange={(e) => updatePhotosSeo("introText", e.target.value)}
                    placeholder={`Write a descriptive intro for the photo gallery page describing ${model.name}'s photoshoot themes, styles, and photo highlights...`}
                    helperText="Rendered at the top of /model/[slug]/photos for crawlers and visitors."
                    slotProps={{
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem", lineHeight: 1.5 },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: SERP Preview */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
                position: "sticky",
                top: 20,
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                    Google Photos SERP Preview
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5, px: 2 }}
              />
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1a0dab",
                      lineHeight: 1.3,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.photosSeo?.metaTitle
                      ? `${model.photosSeo.metaTitle.replace(/\s*(?:[|\-–—:]|\bon\b)\s*VIXN/gi, "").trim()} | VIXN`
                      : `${model.name} Photos, HD Galleries & Pictures (${model.media?.filter((m) => m.type === "photo").length || 0}) | VIXN`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontFamily: "monospace",
                      color: "#006621",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    https://vixn.fun/model/{model.slug}/photos
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#4d5156",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                    }}
                  >
                    {model.photosSeo?.metaDescription ||
                      `Browse all exclusive high-definition photoshoot pictures and photo sets of ${model.name} on VIXN.`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 4. VIDEOS PAGE SEO TAB */}
      {/* ======================================================== */}
      {activeTab === "videos-seo" && isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                      Dedicated Videos Page SEO &amp; Copy
                    </Typography>
                    <Chip
                      label={`/model/${model.slug}/videos`}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        borderRadius: 1,
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </Box>
                }
                subheader={
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.25 }}>
                    Target &quot;{model.name} videos&quot;, &quot;{model.name} 4k clips&quot;, and streaming reel queries
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.75, px: 2.5 }}
              />
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Custom Page Heading (H1) */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Custom Page Heading (H1)
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {(model.videosSeo?.heading || "").length}/80
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.videosSeo?.heading || ""}
                    onChange={(e) => updateVideosSeo("heading", e.target.value)}
                    placeholder={`e.g. ${model.name} 4K Video Clips, Streams & Exclusive Reels`}
                    helperText={`Defaults dynamically to "${model.name} Video Showcase & Clips" if left blank.`}
                    slotProps={{
                      htmlInput: { maxLength: 80 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Videos Page Meta Title */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Videos Meta Title
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          (model.videosSeo?.metaTitle || "").length === 0
                            ? "#94a3b8"
                            : (model.videosSeo?.metaTitle || "").length <= 60
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {(model.videosSeo?.metaTitle || "").length}/60
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={model.videosSeo?.metaTitle || ""}
                    onChange={(e) => updateVideosSeo("metaTitle", e.target.value)}
                    placeholder={`e.g. ${model.name} Videos, 4K Clips & Streaming`}
                    helperText='Max 60 chars. Do NOT include "| VIXN" (added automatically).'
                    slotProps={{
                      htmlInput: { maxLength: 60 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Videos Page Meta Description */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Videos Meta Description
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color:
                          (model.videosSeo?.metaDescription || "").length === 0
                            ? "#94a3b8"
                            : (model.videosSeo?.metaDescription || "").length <= 155
                            ? "#059669"
                            : "#dc2626",
                      }}
                    >
                      {(model.videosSeo?.metaDescription || "").length}/155
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    value={model.videosSeo?.metaDescription || ""}
                    onChange={(e) => updateVideosSeo("metaDescription", e.target.value)}
                    placeholder={`e.g. Watch exclusive high-definition video clips, 4K reels, and streaming videos of ${model.name} on VIXN.`}
                    helperText="Strict limit: 155 characters for search engines."
                    slotProps={{
                      htmlInput: { maxLength: 155 },
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>

                {/* Videos SEO Keywords */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Video Specific Keywords
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {(model.videosSeo?.metaKeywords || []).length} keywords
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={videoKeywordInput}
                      onChange={(e) => setVideoKeywordInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddVideoKeyword())
                      }
                      placeholder="Add video keyword and press Enter"
                      slotProps={{
                        input: {
                          sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddVideoKeyword}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#e2e8f0",
                        color: "#334155",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setBulkKeywordsTarget("videos");
                        setBulkKeywordsText("");
                        setBulkKeywordsOpen(true);
                      }}
                      startIcon={<PlaylistAddIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#cbd5e1",
                        color: "#1e293b",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Bulk
                    </Button>
                  </Box>

                  {(model.videosSeo?.metaKeywords || []).length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                        mt: 1.5,
                        maxHeight: 140,
                        overflowY: "auto",
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {model.videosSeo?.metaKeywords?.map((kw) => (
                        <Chip
                          key={kw}
                          label={kw}
                          size="small"
                          onDelete={() => handleRemoveVideoKeyword(kw)}
                          sx={{
                            borderRadius: 1,
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "#334155",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Videos Intro Text */}
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                    Video Showcase Editorial Story / Intro Paragraph
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={model.videosSeo?.introText || ""}
                    onChange={(e) => updateVideosSeo("introText", e.target.value)}
                    placeholder={`Write a descriptive intro for the video page describing ${model.name}'s video streams, clip formats, quality, and highlights...`}
                    helperText="Rendered at the top of /model/[slug]/videos for crawlers and visitors."
                    slotProps={{
                      input: {
                        sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem", lineHeight: 1.5 },
                      },
                      formHelperText: { sx: { fontSize: "0.6875rem", color: "#94a3b8" } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: SERP Preview */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                bgcolor: "#ffffff",
                position: "sticky",
                top: 20,
              }}
            >
              <CardHeader
                title={
                  <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                    Google Videos SERP Preview
                  </Typography>
                }
                sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5, px: 2 }}
              />
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1a0dab",
                      lineHeight: 1.3,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.videosSeo?.metaTitle
                      ? `${model.videosSeo.metaTitle.replace(/\s*(?:[|\-–—:]|\bon\b)\s*VIXN/gi, "").trim()} | VIXN`
                      : `${model.name} Videos, 4K Clips & Streaming (${model.media?.filter((m) => m.type === "video").length || 0}) | VIXN`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontFamily: "monospace",
                      color: "#006621",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    https://vixn.fun/model/{model.slug}/videos
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#4d5156",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                    }}
                  >
                    {model.videosSeo?.metaDescription ||
                      `Watch exclusive high-definition video clips, 4K reels, and streaming videos of ${model.name} on VIXN.`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 5. MEDIA SETS TAB */}
      {/* ======================================================== */}
      {activeTab === "media" && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 1.5,
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              p: 2.5,
              borderBottom: "1px solid #f1f5f9",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                Media Sets Gallery
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                Upload photos directly to storage or attach external streaming video links with SEO tags
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setUploadType("photo");
                  setUploadDialogOpen(true);
                }}
                startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  borderColor: "#e2e8f0",
                  color: "#334155",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 1.75,
                  py: 0.75,
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                Upload File
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={() => setMediaDialogOpen(true)}
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  bgcolor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 1.75,
                  py: 0.75,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1e293b", boxShadow: "none" },
                }}
              >
                Add Direct URL
              </Button>
            </Box>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            {model.media.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center", maxWidth: 360, mx: "auto" }}>
                <PhotoLibraryIcon sx={{ fontSize: 42, color: "#cbd5e1", mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                  No media assets in gallery
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
                  Upload photos or configure external video links to populate the public media gallery.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {model.media.map((item) => (
                  <Card
                    key={item._id}
                    elevation={0}
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      position: "relative",
                      bgcolor: "#ffffff",
                      transition: "all 0.15s ease",
                      "&:hover .delete-btn": { opacity: 1 },
                    }}
                  >
                    {item.type === "photo" ? (
                      <Box
                        component="img"
                        src={item.url}
                        alt={item.alt || item.title}
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: 180,
                          bgcolor: "#0f172a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {item.thumbnail ? (
                          <Box
                            component="img"
                            src={item.thumbnail}
                            alt={item.title || "Video thumbnail"}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              opacity: 0.75,
                            }}
                          />
                        ) : null}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(0,0,0,0.25)",
                          }}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              bgcolor: "rgba(255,255,255,0.25)",
                              backdropFilter: "blur(4px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                            }}
                          >
                            <MovieIcon sx={{ fontSize: 20 }} />
                          </Box>
                        </Box>

                        <Box sx={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 0.5 }}>
                          <Chip
                            label="VIDEO"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              borderRadius: 1,
                              bgcolor: "#0f172a",
                              color: "#ffffff",
                            }}
                          />
                          {item.isExternal && (
                            <Chip
                              label="REDIRECT"
                              size="small"
                              icon={<OpenInNewIcon sx={{ fontSize: "10px !important", color: "#ffffff" }} />}
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                borderRadius: 1,
                                bgcolor: "#2563eb",
                                color: "#ffffff",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ p: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title || "Untitled Media"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6875rem",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          mt: 0.25,
                        }}
                      >
                        {item.alt || "No SEO alt text"}
                      </Typography>

                      {item.keywords && item.keywords.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                          {item.keywords.slice(0, 2).map((kw, ki) => (
                            <Chip
                              key={ki}
                              label={`#${kw}`}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: "0.625rem",
                                fontWeight: 600,
                                borderRadius: 0.75,
                                bgcolor: "#f1f5f9",
                                color: "#475569",
                              }}
                            />
                          ))}
                          {item.keywords.length > 2 && (
                            <Typography sx={{ fontSize: "0.625rem", color: "#94a3b8", alignSelf: "center" }}>
                              +{item.keywords.length - 2}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Delete button on hover */}
                    <IconButton
                      size="small"
                      className="delete-btn"
                      onClick={() => {
                        setMediaToDelete(item);
                        setDeleteMediaDialogOpen(true);
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#dc2626",
                        p: 0.5,
                        opacity: 0,
                        transition: "opacity 0.15s ease",
                        "&:hover": { bgcolor: "#dc2626", color: "#ffffff" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* DIALOGS */}
      {/* ======================================================== */}

      {/* 1. File Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 1.5, border: "1px solid #e2e8f0" },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem" }}>
            Upload Media to Gallery
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.25 }}>
            Upload high-resolution photos or configure video redirect streams
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Media Type Switcher */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, bgcolor: "#f1f5f9", p: 0.5, borderRadius: 1 }}>
            <Button
              size="small"
              onClick={() => setUploadType("photo")}
              startIcon={<CameraIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                ...(uploadType === "photo"
                  ? { bgcolor: "#ffffff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }
                  : { color: "#64748b" }),
              }}
            >
              Photo (Image File)
            </Button>
            <Button
              size="small"
              onClick={() => setUploadType("video")}
              startIcon={<MovieIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                ...(uploadType === "video"
                  ? { bgcolor: "#ffffff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }
                  : { color: "#64748b" }),
              }}
            >
              Video (Redirect Stream)
            </Button>
          </Box>

          {/* Photo File Dropzone */}
          {uploadType === "photo" && (
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                Select Image File *
              </Typography>
              {!uploadFile ? (
                <label style={{ cursor: "pointer", display: "block" }}>
                  <Box
                    sx={{
                      height: 120,
                      borderRadius: 1,
                      border: "2px dashed #cbd5e1",
                      bgcolor: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 28, color: "#64748b" }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                      Click to choose image file
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
                      JPG, PNG, WebP, AVIF (Max 50MB)
                    </Typography>
                  </Box>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleSelectUploadFile(e.target.files?.[0] || null)}
                  />
                </label>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Box
                    component="img"
                    src={uploadPreview}
                    alt="Preview"
                    sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 1, border: "1px solid #e2e8f0" }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }} noWrap>
                      {uploadFile.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview("");
                    }}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Change
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Video Stream URL */}
          {uploadType === "video" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                  Video Stream / Redirect URL *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="https://.../video-streaming-page"
                  value={uploadForm.videoUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, videoUrl: e.target.value })}
                  slotProps={{
                    input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                  Video Poster / Thumbnail Image
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Poster image URL"
                    value={uploadForm.thumbnailUrl}
                    onChange={(e) => setUploadForm({ ...uploadForm, thumbnailUrl: e.target.value })}
                    slotProps={{
                      input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                    }}
                  />
                  <label style={{ cursor: "pointer" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      component="span"
                      startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 1,
                        borderColor: "#e2e8f0",
                        color: "#334155",
                        fontSize: "0.75rem",
                        textTransform: "none",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        py: 0.9,
                      }}
                    >
                      Browse
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleSelectThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </Box>
              </Box>
            </Box>
          )}

          {/* Shared Metadata Fields */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Title Caption
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={uploadType === "video" ? "e.g. 4K Studio Session 01" : "e.g. Portrait Shoot in Studio"}
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Alt Text (SEO Image/Video Ranking)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={`e.g. ${model.name} photoshoot in studio`}
              value={uploadForm.alt}
              onChange={(e) => setUploadForm({ ...uploadForm, alt: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              SEO Keywords (Comma-separated)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. bikini, glamour, photoshoot, 4k"
              value={uploadForm.keywords}
              onChange={(e) => setUploadForm({ ...uploadForm, keywords: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setUploadDialogOpen(false)}
            disabled={uploading}
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
            onClick={handlePerformUpload}
            disabled={uploading}
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
            {uploading ? "Uploading & Adding..." : "Add to Media Set"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Direct Media URL Dialog */}
      <Dialog
        open={mediaDialogOpen}
        onClose={() => !directMediaAdding && setMediaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 1.5, border: "1px solid #e2e8f0" },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem" }}>
            Add Media by URL
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.25 }}>
            Link externally hosted images or streaming video urls
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Media Type
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={newMedia.type}
                onChange={(e) =>
                  setNewMedia({ ...newMedia, type: e.target.value as "photo" | "video" })
                }
                sx={{ borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" }}
              >
                <MenuItem value="photo">Photo</MenuItem>
                <MenuItem value="video">Video (Redirect Stream)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              {newMedia.type === "video" ? "Video Stream URL *" : "Photo Image URL *"}
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={newMedia.type === "video" ? "https://.../video-stream" : "https://.../photo.jpg"}
              value={newMedia.url}
              onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>

          {newMedia.type === "video" && (
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
                Video Thumbnail / Poster Image URL
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="https://.../video-thumbnail.jpg"
                value={newMedia.thumbnail}
                onChange={(e) => setNewMedia({ ...newMedia, thumbnail: e.target.value })}
                slotProps={{
                  input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
                }}
              />
            </Box>
          )}

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Title Caption
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Exclusive Studio Session 01"
              value={newMedia.title}
              onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Alt Text (SEO Image Ranking)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Descriptive text for search engine images"
              value={newMedia.alt}
              onChange={(e) => setNewMedia({ ...newMedia, alt: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              SEO Keywords (Comma-separated)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. glamour, portrait, 4k"
              value={newMedia.keywords}
              onChange={(e) => setNewMedia({ ...newMedia, keywords: e.target.value })}
              slotProps={{
                input: { sx: { borderRadius: 1, bgcolor: "#f8fafc", fontSize: "0.875rem" } },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setMediaDialogOpen(false)}
            disabled={directMediaAdding}
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
            onClick={handleAddMedia}
            disabled={directMediaAdding}
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
            {directMediaAdding ? "Adding..." : "Add to Gallery"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Bulk Keywords Dialog */}
      <Dialog
        open={bulkKeywordsOpen}
        onClose={() => setBulkKeywordsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 1.5, border: "1px solid #e2e8f0" },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem" }}>
            Add Keywords in Bulk
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.25 }}>
            Paste keywords line-by-line or comma-separated. Duplicates will be deduplicated.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder={`aditi mistry photos\naditi mistry 4k videos\naditi mistry instagram\naditi mistry full portfolio`}
            value={bulkKeywordsText}
            onChange={(e) => setBulkKeywordsText(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1,
                  bgcolor: "#f8fafc",
                  fontSize: "0.8125rem",
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                },
              },
            }}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
            Detected:{" "}
            <strong style={{ color: "#0f172a" }}>
              {
                bulkKeywordsText
                  .split(/\r?\n|,/)
                  .map((k) => k.trim())
                  .filter(Boolean).length
              }
            </strong>{" "}
            keywords
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setBulkKeywordsOpen(false)}
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
            onClick={handleAddBulkKeywords}
            disabled={!bulkKeywordsText.trim()}
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
            Add Keywords
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Delete Media Confirmation Dialog */}
      <Dialog
        open={deleteMediaDialogOpen}
        onClose={() => setDeleteMediaDialogOpen(false)}
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
            Delete Media Item?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <DialogContentText sx={{ fontSize: "0.8125rem", color: "#64748b" }}>
            Are you sure you want to remove &quot;{mediaToDelete?.title || "this media item"}&quot; from this model&apos;s gallery?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteMediaDialogOpen(false);
              setMediaToDelete(null);
            }}
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
            onClick={handleDeleteMedia}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            Delete Media
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
