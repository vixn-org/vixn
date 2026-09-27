"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Chip,
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
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Refresh as RefreshIcon,
  PlaylistAdd as PlaylistAddIcon,
  EditOutlined as EditIcon,
  CheckCircleOutlined as CheckCircleIcon,
  Language as LanguageIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";
import { useAdminTheme } from "@/components/admin/mui-theme-provider";

interface SearchTagItem {
  _id: string;
  tag: string;
  slug: string;
  customTitle?: string;
  customDescription?: string;
  active: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminSearchSeoPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const { mode, toggleMode } = useAdminTheme();
  const isDark = mode === "dark";

  const [tags, setTags] = useState<SearchTagItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [limit, setLimit] = useState(25);
  const [stats, setStats] = useState<{ total: number; totalActive: number }>({
    total: 0,
    totalActive: 0,
  });

  // Bulk Add Dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  // Edit SEO Dialog
  const [editingTag, setEditingTag] = useState<SearchTagItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete Dialog
  const [tagToDelete, setTagToDelete] = useState<SearchTagItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.set("search", search);
      if (statusFilter === "active") queryParams.set("active", "true");
      if (statusFilter === "inactive") queryParams.set("active", "false");

      const res = await fetch(`/api/admin/search-tags?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch search tags");

      const data = await res.json();
      setTags(data.tags || []);
      setPagination(data.pagination || null);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load search SEO tags");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleBulkSubmit = async () => {
    if (!bulkText.trim()) {
      toast.error("Please enter at least one tag or search keyword");
      return;
    }

    setBulkSaving(true);
    try {
      const res = await fetch("/api/admin/search-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulkText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add tags");

      toast.success(data.message || `Added ${data.addedCount} new tags`);
      setBulkOpen(false);
      setBulkText("");
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Failed to save bulk tags");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleToggleActive = async (tagItem: SearchTagItem) => {
    const nextActive = !tagItem.active;
    // Optimistic UI update
    setTags((prev) =>
      prev.map((t) => (t._id === tagItem._id ? { ...t, active: nextActive } : t))
    );

    try {
      const res = await fetch(`/api/admin/search-tags/${tagItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });

      if (!res.ok) throw new Error();
      toast.success(
        nextActive
          ? `"${tagItem.tag}" activated (indexed in sitemap)`
          : `"${tagItem.tag}" deactivated`
      );
      fetchTags();
    } catch {
      // Rollback
      setTags((prev) =>
        prev.map((t) => (t._id === tagItem._id ? { ...t, active: tagItem.active } : t))
      );
      toast.error("Failed to update status");
    }
  };

  const handleOpenEdit = (tagItem: SearchTagItem) => {
    setEditingTag(tagItem);
    setEditTitle(tagItem.customTitle || "");
    setEditDescription(tagItem.customDescription || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTag) return;
    setEditSaving(true);

    try {
      const res = await fetch(`/api/admin/search-tags/${editingTag._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customTitle: editTitle,
          customDescription: editDescription,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("SEO metadata updated successfully");
      setEditingTag(null);
      fetchTags();
    } catch {
      toast.error("Failed to update SEO metadata");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/search-tags/${tagToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      toast.success(`"${tagToDelete.tag}" deleted`);
      setTagToDelete(null);
      fetchTags();
    } catch {
      toast.error("Failed to delete tag");
    } finally {
      setDeleting(false);
    }
  };

  // Preview parsed items in bulk modal
  const bulkPreviewLines = bulkText
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: isDark ? "#f8fafc" : "#0f172a",
              letterSpacing: "-0.01em",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
            }}
          >
            Search SEO &amp; Target Keywords
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b", mt: 0.25, fontSize: "0.85rem" }}>
            Add creator names, high-traffic search terms, and keywords in bulk to generate indexed 4K search landing pages and auto-chunked sitemaps.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
                borderRadius: 1,
                color: isDark ? "#fbbf24" : "#475569",
                p: 0.75,
                "&:hover": {
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9",
                },
              }}
            >
              {isDark ? (
                <LightModeIcon sx={{ fontSize: 18 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={fetchTags}
              sx={{
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
                borderRadius: 1,
                color: isDark ? "#94a3b8" : "#64748b",
                p: 0.75,
                "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9" },
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<PlaylistAddIcon />}
              onClick={() => setBulkOpen(true)}
              sx={{
                bgcolor: isDark ? "#f43f5e" : "#0f172a",
                color: "#ffffff",
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 2,
                py: 0.85,
                boxShadow: "none",
                "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b", boxShadow: "none" },
              }}
            >
              Add Tags in Bulk
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            borderRadius: 2,
            bgcolor: isDark ? "#0f1422" : "#ffffff",
          }}
        >
          <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
            TOTAL SEARCH KEYWORDS
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", mt: 0.5 }}>
            {stats.total.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Target search landing pages
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.25,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            borderRadius: 2,
            bgcolor: isDark ? "#0f1422" : "#ffffff",
          }}
        >
          <Typography variant="caption" sx={{ color: isDark ? "#34d399" : "#16a34a", fontWeight: 600 }}>
            INDEXED IN SITEMAP
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isDark ? "#34d399" : "#16a34a", mt: 0.5 }}>
            {stats.totalActive.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Included in search-*.xml sitemaps
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.25,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            borderRadius: 2,
            bgcolor: isDark ? "#0f1422" : "#ffffff",
          }}
        >
          <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
            SITEMAP PRIORITY
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#818cf8", mt: 0.5 }}>
            0.85
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Daily crawl frequency
          </Typography>
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
          placeholder="Filter keywords by name or slug..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
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
                bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                fontSize: "0.875rem",
                "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0" },
                "&:hover fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#f43f5e" },
              },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
              color: isDark ? "#f8fafc" : "#0f172a",
              borderRadius: 1,
              fontSize: "0.875rem",
              "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0" },
              "&.Mui-focused fieldset": { borderColor: "#f43f5e" },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active (Indexed)</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Table */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: isDark ? "#0f1422" : "#ffffff",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: isDark ? "#090d16" : "#f8fafc", borderBottom: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", py: 1.5, width: "30%" }}>
                  Keyword / Search Tag
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", py: 1.5, width: "25%" }}>
                  URL Slug
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", py: 1.5, width: "15%" }}>
                  Sitemap Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", py: 1.5, width: "10%" }}>
                  Searches
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", py: 1.5, width: "20%", textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6, textAlign: "center" }}>
                    <CircularProgress size={28} sx={{ color: isDark ? "#f43f5e" : "#0f172a" }} />
                    <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b", mt: 1 }}>
                      Loading search SEO tags...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 8, textAlign: "center" }}>
                    <LanguageIcon sx={{ fontSize: 40, color: isDark ? "#475569" : "#cbd5e1" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", mt: 1 }}>
                      No search tags found
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b", mb: 2 }}>
                      Click "Add Tags in Bulk" above to paste creator names and keywords.
                    </Typography>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlaylistAddIcon />}
                        onClick={() => setBulkOpen(true)}
                        sx={{
                          bgcolor: isDark ? "#f43f5e" : "#0f172a",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b" },
                        }}
                      >
                        Add First Batch
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((t) => (
                  <TableRow
                    key={t._id}
                    hover
                    sx={{
                      borderBottom: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                      "&:last-child": { borderBottom: 0 },
                      transition: "background-color 0.15s",
                      "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc" },
                    }}
                  >
                    <TableCell sx={{ py: 1.25 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {t.tag}
                        </Typography>
                        {t.customTitle && (
                          <Typography
                            variant="caption"
                            sx={{ color: isDark ? "#94a3b8" : "#64748b", display: "block", fontStyle: "italic", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            SEO: {t.customTitle}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.25 }}>
                      <Chip
                        label={`/search?q=${encodeURIComponent(t.tag)}`}
                        size="small"
                        sx={{
                          bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                          color: isDark ? "#cbd5e1" : "#475569",
                          border: "1px solid",
                          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "transparent",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          maxWidth: 240,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.25 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Switch
                          size="small"
                          checked={t.active}
                          onChange={() => handleToggleActive(t)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#10b981",
                              "& + .MuiSwitch-track": {
                                backgroundColor: "#10b981",
                              },
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: t.active ? "#34d399" : "#94a3b8",
                          }}
                        >
                          {t.active ? "Indexed" : "Disabled"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>
                        {(t.clicks || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.25, textAlign: "right" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                        <Tooltip title="View live search page">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/search?q=${encodeURIComponent(t.tag)}`}
                            target="_blank"
                            sx={{ color: isDark ? "#94a3b8" : "#64748b", "&:hover": { color: isDark ? "#f8fafc" : "#0f172a" } }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Customize SEO metadata">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(t)}
                            sx={{ color: isDark ? "#94a3b8" : "#64748b", "&:hover": { color: isDark ? "#f8fafc" : "#0f172a" } }}
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        {isAdmin && (
                          <Tooltip title="Delete tag">
                            <IconButton
                              size="small"
                              onClick={() => setTagToDelete(t)}
                              sx={{ color: "#ef4444", "&:hover": { color: "#dc2626" } }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination && pagination.total > 0 && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[15, 25, 50, 100]}
            sx={{
              borderTop: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
              bgcolor: isDark ? "#0f1422" : "#ffffff",
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                fontSize: "0.75rem",
                color: isDark ? "#94a3b8" : "#64748b",
                fontWeight: 500,
              },
              ".MuiTablePagination-select": {
                fontSize: "0.75rem",
                fontWeight: 600,
                color: isDark ? "#f8fafc" : "#334155",
              },
              ".MuiTablePagination-actions button": {
                color: isDark ? "#cbd5e1" : "#475569",
                p: 0.5,
                borderRadius: 1,
                "&.Mui-disabled": {
                  color: isDark ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1",
                },
              },
            }}
          />
        )}
      </Card>

      {/* Bulk Add Dialog */}
      <Dialog
        open={bulkOpen}
        onClose={() => !bulkSaving && setBulkOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              bgcolor: isDark ? "#0f1422" : "#ffffff",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#0f172a",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", pb: 1 }}>
          Bulk Add Search SEO Keywords &amp; Model Tags
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <DialogContentText sx={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b" }}>
            Paste target search queries, creator names, or keyword phrases line by line. Slugs are automatically created, duplicates are skipped, and all new tags will be dynamically indexed into your XML sitemaps.
          </DialogContentText>

          <TextField
            label="Search Tags (One per line or comma separated)"
            multiline
            rows={10}
            fullWidth
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Alanna Pow\nAlanna Pow 4K Videos\nClaudia Rivier\nShilpa Sethi hot scenes\nAngela White uncensored\nTabby Lookofsky streaming`}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1.5,
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1" },
                },
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: isDark ? "#cbd5e1" : "#64748b", fontWeight: 600 }}>
              Detected phrases to process: <strong>{bulkPreviewLines.length}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#94a3b8" }}>
              Duplicates within the batch and database are auto-skipped.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9" }}>
          <Button
            onClick={() => setBulkOpen(false)}
            disabled={bulkSaving}
            sx={{ color: isDark ? "#cbd5e1" : "#64748b", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkSubmit}
            disabled={bulkSaving || bulkPreviewLines.length === 0}
            startIcon={bulkSaving ? <CircularProgress size={16} color="inherit" /> : <PlaylistAddIcon />}
            sx={{
              bgcolor: isDark ? "#f43f5e" : "#0f172a",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b" },
            }}
          >
            {bulkSaving ? "Processing & Inserting..." : `Add ${bulkPreviewLines.length} Tags to SEO`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit SEO Dialog */}
      <Dialog
        open={Boolean(editingTag)}
        onClose={() => !editSaving && setEditingTag(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              bgcolor: isDark ? "#0f1422" : "#ffffff",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#0f172a",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", pb: 1 }}>
          Edit SEO Metadata: {editingTag?.tag}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
          <TextField
            label="Custom Meta Title"
            fullWidth
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            helperText="Leave empty to use the auto-generated high-converting default title"
            slotProps={{
              input: {
                sx: {
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1" },
                },
              },
              formHelperText: {
                sx: { color: isDark ? "#94a3b8" : "#64748b" },
              },
            }}
          />

          <TextField
            label="Custom Meta Description"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            helperText="Target 120-155 characters for optimal Google & Bing CTR snippet performance"
            slotProps={{
              input: {
                sx: {
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1" },
                },
              },
              formHelperText: {
                sx: { color: isDark ? "#94a3b8" : "#64748b" },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9" }}>
          <Button
            onClick={() => setEditingTag(null)}
            disabled={editSaving}
            sx={{ color: isDark ? "#cbd5e1" : "#64748b", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={editSaving}
            sx={{
              bgcolor: isDark ? "#f43f5e" : "#0f172a",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b" },
            }}
          >
            {editSaving ? "Saving..." : "Save SEO Metadata"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(tagToDelete)}
        onClose={() => !deleting && setTagToDelete(null)}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              bgcolor: isDark ? "#0f1422" : "#ffffff",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#0f172a",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
          Delete Search SEO Tag?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b" }}>
            Are you sure you want to delete <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>&quot;{tagToDelete?.tag}&quot;</strong>? It will no longer be listed in XML sitemaps or indexed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9" }}>
          <Button
            onClick={() => setTagToDelete(null)}
            disabled={deleting}
            sx={{ color: isDark ? "#cbd5e1" : "#64748b", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
