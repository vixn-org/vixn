"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  OpenInNew as ExternalLinkIcon,
  PeopleAltOutlined as PeopleIcon,
  CheckCircleOutlined as PublishedIcon,
  EditNoteOutlined as DraftIcon,
  ArrowForward as ArrowForwardIcon,
  BoltOutlined as SparklesIcon,
  Refresh as RefreshIcon,
  FolderOutlined as FolderIcon,
  ArticleOutlined as ArticleIcon,
  LanguageOutlined as GlobeIcon,
  Search as SearchIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
} from "@mui/icons-material";
import { useAdminTheme } from "@/components/admin/mui-theme-provider";

interface DashboardStats {
  total: number;
  published: number;
  draft: number;
}

interface RecentModel {
  _id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  profileImage?: string;
  media: { _id: string; type?: string }[];
}

export default function AdminDashboard() {
  const { mode, toggleMode } = useAdminTheme();
  const isDark = mode === "dark";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentModels, setRecentModels] = useState<RecentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || { total: 0, published: 0, draft: 0 });
        setRecentModels(data.recentModels || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleTriggerIndexing() {
    setPinging(true);
    setPingMessage(null);
    try {
      const res = await fetch("/api/admin/indexing/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revalidateSitemaps: true }),
      });
      const data = await res.json();
      if (res.ok) {
        const gInfo =
          data.google?.succeeded !== undefined
            ? ` • Google: ${data.google.succeeded} queued`
            : "";
        const inInfo = data.indexNow?.status
          ? ` • IndexNow: ${data.indexNow.status} (Accepted)`
          : "";
        setPingMessage(
          `Success: ${data.urlCount || 0} URLs dispatched to search engines${gInfo}${inInfo}`
        );
      } else {
        setPingMessage(`Error: ${data.error || "Failed to trigger indexing"}`);
      }
    } catch {
      setPingMessage("Network error triggering indexing API");
    } finally {
      setPinging(false);
    }
  }

  const statCards = [
    {
      title: "Total Models",
      value: stats?.total || 0,
      icon: <PeopleIcon sx={{ fontSize: 20, color: isDark ? "#f8fafc" : "#1e293b" }} />,
      tag: "All registered",
      accent: "#e2e8f0",
    },
    {
      title: "Published Live",
      value: stats?.published || 0,
      icon: <PublishedIcon sx={{ fontSize: 20, color: "#10b981" }} />,
      tag: "Active in sitemap",
      accent: "#bbf7d0",
    },
    {
      title: "Draft Portfolios",
      value: stats?.draft || 0,
      icon: <DraftIcon sx={{ fontSize: 20, color: "#f59e0b" }} />,
      tag: "Unpublished",
      accent: "#fed7aa",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Top Header Bar */}
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
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b", mt: 0.25, fontSize: "0.85rem" }}>
            Overview of creator catalogs, SEO pipelines, and content publishing.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                borderRadius: 1,
                p: 0.85,
                color: isDark ? "#fbbf24" : "#475569",
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
              onClick={fetchData}
              disabled={loading}
              sx={{
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                borderRadius: 1,
                p: 0.85,
                color: isDark ? "#94a3b8" : "#475569",
                "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9" },
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            component={Link}
            href="/"
            target="_blank"
            variant="outlined"
            size="small"
            startIcon={<ExternalLinkIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#334155",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
              borderRadius: 1,
              fontWeight: 600,
              fontSize: "0.8rem",
              "&:hover": {
                bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f8fafc",
                borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1",
              },
            }}
          >
            Live Site
          </Button>

          <Button
            component={Link}
            href="/admin/models"
            variant="contained"
            size="small"
            disableElevation
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: isDark ? "#f43f5e" : "#0f172a",
              color: "#ffffff",
              borderRadius: 1,
              fontWeight: 600,
              fontSize: "0.8rem",
              "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b" },
            }}
          >
            New Model
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
              bgcolor: isDark ? "#0f1422" : "#ffffff",
              transition: "all 0.15s",
              "&:hover": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "#cbd5e1",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isDark ? "#94a3b8" : "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {stat.title}
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              {loading ? (
                <Skeleton variant="text" width={50} height={32} />
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? "#f8fafc" : "#0f172a",
                    lineHeight: 1.1,
                    fontSize: "1.75rem",
                  }}
                >
                  {stat.value}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#94a3b8", fontSize: "0.75rem", mt: 0.5, display: "block" }}>
                {stat.tag}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* SEO & Programmatic Indexing Hub */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          bgcolor: isDark ? "#0f1422" : "#ffffff",
          overflow: "hidden",
        }}
      >
        {pinging && <LinearProgress color="primary" sx={{ height: 2 }} />}

        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                <Chip
                  size="small"
                  label="Search Automation"
                  sx={{
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                    color: isDark ? "#cbd5e1" : "#334155",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: 1,
                  }}
                />
                <Chip
                  size="small"
                  label="Active"
                  sx={{
                    bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                    color: isDark ? "#34d399" : "#059669",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.95rem" }}
              >
                Sitemaps &amp; Automated Indexing Pipeline
              </Typography>

              <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b", mt: 0.25, fontSize: "0.8rem" }}>
                Multi-chunk sitemap indexes with instant IndexNow (Bing/Yandex) pings and dynamic tag route indexing.
              </Typography>

              {/* Sitemap Links */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.25 }}>
                {[
                  { label: "/sitemap.xml", href: "/sitemap.xml" },
                  { label: "/sitemaps/models-1", href: "/sitemaps/models-1" },
                  { label: "/sitemaps/tags", href: "/sitemaps/tags" },
                  { label: "/tag", href: "/tag" },
                ].map((item) => (
                  <Chip
                    key={item.label}
                    component="a"
                    href={item.href}
                    target="_blank"
                    clickable
                    label={item.label}
                    size="small"
                    icon={<ExternalLinkIcon sx={{ fontSize: "11px !important" }} />}
                    sx={{
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                      color: isDark ? "#cbd5e1" : "#475569",
                      fontSize: "0.725rem",
                      fontWeight: 500,
                      borderRadius: 1,
                      height: 24,
                      "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9" },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ alignSelf: { xs: "stretch", md: "center" } }}>
              <Button
                variant="contained"
                disableElevation
                size="small"
                onClick={handleTriggerIndexing}
                disabled={pinging}
                startIcon={<SparklesIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: isDark ? "#f43f5e" : "#1e293b",
                  color: "#ffffff",
                  px: 2.25,
                  py: 0.85,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  width: { xs: "100%", md: "auto" },
                  "&:hover": { bgcolor: isDark ? "#e11d48" : "#0f172a" },
                }}
              >
                {pinging ? "Dispatching..." : "Trigger Indexing Ping"}
              </Button>
            </Box>
          </Box>

          {pingMessage && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: 1,
                bgcolor: pingMessage.startsWith("Success")
                  ? isDark ? "rgba(16, 185, 129, 0.15)" : "#f0fdf4"
                  : isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                border: `1px solid ${
                  pingMessage.startsWith("Success")
                    ? isDark ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0"
                    : isDark ? "rgba(239, 68, 68, 0.3)" : "#fecaca"
                }`,
                color: pingMessage.startsWith("Success")
                  ? isDark ? "#34d399" : "#166534"
                  : isDark ? "#fca5a5" : "#991b1b",
                fontSize: "0.775rem",
                fontWeight: 600,
              }}
            >
              {pingMessage}
            </Box>
          )}
        </Box>
      </Card>

      {/* Quick Navigation Shortcuts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <Card
          component={Link}
          href="/admin/models"
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            bgcolor: isDark ? "#0f1422" : "#ffffff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.15s",
            "&:hover": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "#cbd5e1",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <FolderIcon sx={{ fontSize: 18, color: isDark ? "#94a3b8" : "#475569" }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.825rem" }}>
                Models Directory
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.725rem" }}>
                Add, edit &amp; manage models
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIcon sx={{ fontSize: 14, color: isDark ? "#64748b" : "#94a3b8" }} />
        </Card>

        <Card
          component={Link}
          href="/admin/blogs"
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            bgcolor: isDark ? "#0f1422" : "#ffffff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.15s",
            "&:hover": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "#cbd5e1",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <ArticleIcon sx={{ fontSize: 18, color: isDark ? "#94a3b8" : "#475569" }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.825rem" }}>
                SEO Articles
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.725rem" }}>
                Manage editorial guides
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIcon sx={{ fontSize: 14, color: isDark ? "#64748b" : "#94a3b8" }} />
        </Card>

        <Card
          component={Link}
          href="/tag"
          target="_blank"
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            bgcolor: isDark ? "#0f1422" : "#ffffff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.15s",
            "&:hover": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "#cbd5e1",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <GlobeIcon sx={{ fontSize: 18, color: isDark ? "#94a3b8" : "#475569" }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.825rem" }}>
                Category Tags
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.725rem" }}>
                Browse live keyword archive
              </Typography>
            </Box>
          </Box>
          <ExternalLinkIcon sx={{ fontSize: 14, color: isDark ? "#64748b" : "#94a3b8" }} />
        </Card>
      </Box>

      {/* Recent Models List */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          bgcolor: isDark ? "#0f1422" : "#ffffff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            bgcolor: isDark ? "#0f1422" : "#ffffff",
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.875rem" }}>
              Recent Models
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.725rem" }}>
              Quick access to edit profiles and media
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/admin/models"
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            sx={{ color: isDark ? "#f8fafc" : "#334155", fontWeight: 600, fontSize: "0.75rem", p: 0.5 }}
          >
            View all
          </Button>
        </Box>

        <Box sx={{ p: 1.5 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                  }}
                >
                  <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={120} height={18} />
                    <Skeleton variant="text" width={90} height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : recentModels.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>
                No models created yet
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#64748b", display: "block", mt: 0.25 }}>
                Get started by creating your first model profile.
              </Typography>
              <Button
                component={Link}
                href="/admin/models"
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  mt: 1.5,
                  bgcolor: isDark ? "#f43f5e" : "#0f172a",
                  color: "#ffffff",
                  borderRadius: 1,
                  "&:hover": { bgcolor: isDark ? "#e11d48" : "#1e293b" },
                }}
              >
                Add Model
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {recentModels.map((m) => (
                <Box
                  key={m._id}
                  component={Link}
                  href={`/admin/models/${m._id}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.25,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                    "&:hover": {
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f8fafc",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "#e2e8f0",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Avatar
                      src={m.profileImage}
                      alt={m.name}
                      variant="rounded"
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1,
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                        color: isDark ? "#f8fafc" : "#334155",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                      }}
                    >
                      {m.name.charAt(0)}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isDark ? "#f8fafc" : "#0f172a",
                          lineHeight: 1.2,
                          fontSize: "0.825rem",
                          "&:hover": { color: isDark ? "#fb7185" : "#2563eb" },
                        }}
                      >
                        {m.name}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: isDark ? "#94a3b8" : "#64748b",
                            fontSize: "0.7rem",
                          }}
                        >
                          /model/{m.slug}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1" }}>
                          •
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#94a3b8", fontSize: "0.7rem" }}>
                          {m.media?.length || 0} assets
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Chip
                      size="small"
                      label={m.status === "published" ? "Published" : "Draft"}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.68rem",
                        height: 20,
                        borderRadius: 1,
                        bgcolor: m.status === "published"
                          ? isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5"
                          : isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                        color: m.status === "published"
                          ? isDark ? "#34d399" : "#059669"
                          : isDark ? "#cbd5e1" : "#64748b",
                        border: "1px solid",
                        borderColor: m.status === "published"
                          ? isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0"
                          : isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                      }}
                    />

                    <ArrowForwardIcon sx={{ fontSize: 14, color: isDark ? "#64748b" : "#94a3b8" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}
