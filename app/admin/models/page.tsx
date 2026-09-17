"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Chip,
  Avatar,
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
  PhotoLibraryOutlined as PhotoLibraryIcon,
  WhatshotOutlined as FlameIcon,
  EditOutlined as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
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
  const [limit, setLimit] = useState(15);

  // Create Dialog State
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

  // Action Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuModel, setActiveMenuModel] = useState<ModelItem | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<ModelItem | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
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
  }, [page, limit, search, statusFilter]);

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

  const handleDelete = async () => {
    if (!modelToDelete) return;
    const { _id, name } = modelToDelete;
    try {
      const res = await fetch(`/api/models/${_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${name} deleted`);
      setDeleteDialogOpen(false);
      setModelToDelete(null);
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
    setNewModel((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
      metaTitle: `${name} - Photos & Videos`,
      metaDescription: `Explore ${name}'s exclusive photo gallery and video collection on VIXN.`,
    }));
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, model: ModelItem) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuModel(model);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuModel(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
            }}
          >
            Models Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25, fontSize: "0.85rem" }}>
            Overview of creator catalogs, custom routes, SEO pipelines, and content publishing.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={fetchModels}
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

          {isAdmin && (
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
              Create Model Route
            </Button>
          )}
        </Box>
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
          placeholder="Search model name, tags or slug..."
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

        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 } }}>
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
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": { borderColor: "#0f172a" },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Material UI Table Card */}
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
          <Table sx={{ minWidth: 700 }} size="small">
            <TableHead sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <TableRow>
                <TableCell sx={{ py: 1.5, px: 2.5, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Model
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Live Route
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Status
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Review
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Media
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Created
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, px: 2.5, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} sx={{ borderBottom: "1px solid #f1f5f9" }}>
                    <TableCell sx={{ py: 1.5, px: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: 1 }} />
                        <Box sx={{ width: 140 }}>
                          <Skeleton variant="text" width="90%" height={20} />
                          <Skeleton variant="text" width="60%" height={14} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={75} height={22} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="text" width={40} height={20} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Skeleton variant="text" width={70} height={20} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: 2.5 }}>
                      <Skeleton variant="circular" width={28} height={28} sx={{ ml: "auto" }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8, textAlign: "center" }}>
                    <Box sx={{ maxWidth: 300, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <FlameIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                        No models found
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {search || statusFilter !== "all"
                          ? "Try adjusting your search criteria or status filter."
                          : "Create your first model route to populate the directory."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow
                    key={model._id}
                    hover
                    onClick={() => router.push(`/admin/models/${model._id}`)}
                    sx={{
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      "&:last-child": { borderBottom: "none" },
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Model Info */}
                    <TableCell sx={{ py: 1.5, px: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={model.profileImage || undefined}
                          variant="rounded"
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            bgcolor: "#f1f5f9",
                            color: "#334155",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {model.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
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
                            {model.name}
                          </Typography>
                          {model.country ? (
                            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "#64748b", display: "block", mt: 0.25 }}>
                              {model.country}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "#94a3b8", display: "block", mt: 0.25 }}>
                              {model.tags?.slice(0, 2).join(", ") || "Creator"}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Live Route */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          color: "#64748b",
                          bgcolor: "#f8fafc",
                          px: 1,
                          py: 0.4,
                          borderRadius: 1,
                          border: "1px solid #e2e8f0",
                          display: "inline-block",
                        }}
                      >
                        /model/{model.slug}
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
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
                    </TableCell>

                    {/* Review Toggle */}
                    <TableCell
                      sx={{ py: 1.5, px: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Switch
                          size="small"
                          checked={!!model.reviewed}
                          onChange={() => handleToggleReviewed(model._id, !!model.reviewed)}
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
                            color: model.reviewed ? "#059669" : "#94a3b8",
                          }}
                        >
                          {model.reviewed ? "Reviewed" : "Pending"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Media Count */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <PhotoLibraryIcon sx={{ fontSize: 15, color: "#f43f5e" }} />
                        <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#334155" }}>
                          {model.media?.length || 0}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                        {new Date(model.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    {/* Action Menu */}
                    <TableCell
                      align="right"
                      sx={{ py: 1.5, px: 2.5 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, model)}
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
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={[10, 15, 25, 50]}
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
        )}
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
              minWidth: 180,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              p: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {activeMenuModel && (
          <>
            <MenuItem
              onClick={() => {
                router.push(`/admin/models/${activeMenuModel._id}`);
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
              Edit Model &amp; Media
            </MenuItem>

            <MenuItem
              component={Link}
              href={`/model/${activeMenuModel.slug}`}
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
              View Public Route
            </MenuItem>

            {isAdmin && (
              <MenuItem
                onClick={() => {
                  setModelToDelete(activeMenuModel);
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
                Delete Model
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* Create Model Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              border: "1px solid #e2e8f0",
            },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem" }}>
            Create New Model Route
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.25 }}>
            Establish a canonical directory route at /model/[slug] with custom metadata.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Full Name */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Model Full Name *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Aditi Mistry"
              value={newModel.name}
              onChange={(e) => handleNameChange(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                },
              }}
            />
          </Box>

          {/* Route Slug */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Canonical Route Slug *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="aditi-mistry"
              value={newModel.slug}
              onChange={(e) =>
                setNewModel({ ...newModel, slug: slugify(e.target.value) })
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.8125rem", fontFamily: "monospace" }}>
                        /model/
                      </Typography>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                },
              }}
            />
          </Box>

          {/* Country */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Country / Origin
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. India, United States"
              value={newModel.country}
              onChange={(e) =>
                setNewModel({ ...newModel, country: e.target.value })
              }
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                },
              }}
            />
          </Box>

          {/* Meta Title */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Meta Title (SEO)
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color:
                    newModel.metaTitle.length === 0
                      ? "#94a3b8"
                      : newModel.metaTitle.length <= 60
                      ? "#059669"
                      : "#dc2626",
                }}
              >
                {newModel.metaTitle.length}/60{" "}
                {newModel.metaTitle.length > 60
                  ? "(Too long!)"
                  : newModel.metaTitle.length >= 25
                  ? "(Optimal)"
                  : ""}
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="SEO title for Google SERP (max 60 chars)"
              value={newModel.metaTitle}
              onChange={(e) =>
                setNewModel({ ...newModel, metaTitle: e.target.value })
              }
              helperText='Max 60 chars. Do NOT add "| VIXN" (added automatically).'
              slotProps={{
                htmlInput: { maxLength: 60 },
                input: {
                  sx: {
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                },
                formHelperText: {
                  sx: { fontSize: "0.6875rem", color: "#94a3b8" },
                },
              }}
            />
          </Box>

          {/* Meta Description */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Meta Description
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color:
                    newModel.metaDescription.length === 0
                      ? "#94a3b8"
                      : newModel.metaDescription.length < 50
                      ? "#d97706"
                      : newModel.metaDescription.length <= 155
                      ? "#059669"
                      : "#dc2626",
                }}
              >
                {newModel.metaDescription.length}/155{" "}
                {newModel.metaDescription.length > 155
                  ? "(Too long!)"
                  : newModel.metaDescription.length >= 120
                  ? "(Optimal)"
                  : ""}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2.5}
              placeholder="Compelling description for search snippets (max 155 chars)"
              value={newModel.metaDescription}
              onChange={(e) =>
                setNewModel({
                  ...newModel,
                  metaDescription: e.target.value,
                })
              }
              helperText="Strict limit: 155 characters for search engines."
              slotProps={{
                htmlInput: { maxLength: 155 },
                input: {
                  sx: {
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                },
                formHelperText: {
                  sx: { fontSize: "0.6875rem", color: "#94a3b8" },
                },
              }}
            />
          </Box>

          {/* Status Select */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>
              Publication Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={newModel.status}
                onChange={(e) =>
                  setNewModel({
                    ...newModel,
                    status: e.target.value as "draft" | "published",
                  })
                }
                sx={{
                  borderRadius: 1,
                  bgcolor: "#f8fafc",
                  fontSize: "0.875rem",
                  "& fieldset": { borderColor: "#e2e8f0" },
                }}
              >
                <MenuItem value="published">Published (Live for Public)</MenuItem>
                <MenuItem value="draft">Draft (Admin Only)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* SERP Preview Box */}
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
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#94a3b8",
                letterSpacing: "0.05em",
              }}
            >
              Google Search Snippet Preview
            </Typography>
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
              {newModel.metaTitle
                ? `${newModel.metaTitle.replace(/\s*(?:[|\-–—:]|\bon\b)\s*VIXN/gi, "").trim()} | VIXN`
                : `${newModel.name || "Model Name"} - Photos & Videos | VIXN`}
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
              https://vixn.fun/model/{newModel.slug || "model-slug"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#4d5156",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {newModel.metaDescription ||
                "Explore model's exclusive photo gallery and video collection on VIXN."}
            </Typography>
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
            variant="contained"
            onClick={handleCreate}
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
            {creating ? "Creating..." : "Save & Open Editor"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              border: "1px solid #e2e8f0",
            },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pt: 2.5, px: 3, pb: 1 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.0625rem" }}>
            Delete &quot;{modelToDelete?.name}&quot;?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <DialogContentText sx={{ fontSize: "0.8125rem", color: "#64748b" }}>
            This will permanently remove the route{" "}
            <strong style={{ color: "#0f172a" }}>/model/{modelToDelete?.slug}</strong>,
            along with all uploaded photos, videos, and associated metadata. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteDialogOpen(false);
              setModelToDelete(null);
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
            onClick={handleDelete}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

