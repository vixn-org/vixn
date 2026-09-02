"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Eye, Plus, ArrowRight, Flame, Sparkles, ExternalLink } from "lucide-react";

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
  media: { _id: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentModels, setRecentModels] = useState<RecentModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRes, pubRes, draftRes] = await Promise.all([
          fetch("/api/models?limit=1"),
          fetch("/api/models?status=published&limit=1"),
          fetch("/api/models?status=draft&limit=1"),
        ]);

        const [allData, pubData, draftData] = await Promise.all([
          allRes.json(),
          pubRes.json(),
          draftRes.json(),
        ]);

        setStats({
          total: allData.pagination?.total || 0,
          published: pubData.pagination?.total || 0,
          draft: draftData.pagination?.total || 0,
        });

        const recentRes = await fetch("/api/models?limit=5&sort=-createdAt");
        const recentData = await recentRes.json();
        setRecentModels(recentData.models || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Models",
      value: stats?.total || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-100",
    },
    {
      title: "Published Live",
      value: stats?.published || 0,
      icon: Eye,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "Draft Portfolios",
      value: stats?.draft || 0,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage creator routes, media items, and maximum-level SEO settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400" />
              Public Site
            </Link>
          </Button>
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-xs">
            <Link href="/admin/models">
              <Plus className="mr-2 h-4 w-4" />
              Create Model Route
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={`border rounded-2xl bg-white shadow-xs p-2 ${stat.bgColor}`}
          >
            <CardContent className="flex items-center gap-4 pt-4 pb-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs border ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.title}
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-16 mt-1 rounded-lg" />
                ) : (
                  <p className="text-2xl font-black text-slate-900">
                    {stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time SEO & Automated Indexing Command Center */}
      <Card className="border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950 text-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                Real-Time SEO Indexing
              </Badge>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Dynamic Sitemap &amp; Search Engine Indexing Pipeline
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Auto-partitioned Sitemap Index (`/sitemap.xml`) with IndexNow protocol for instant Bing/Yandex crawling, Google sitemap ping, and programmatic `/tag/[keyword]` hubs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/sitemaps/models-1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
              >
                <span>/sitemaps/models-1</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/sitemaps/tags"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
              >
                <span>/sitemaps/tags</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              onClick={async () => {
                try {
                  const res = await fetch("/api/admin/indexing/ping", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ revalidateSitemaps: true }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    const gInfo = data.google?.succeeded !== undefined
                      ? `\nGoogle Indexing API: ${data.google.succeeded} dispatched`
                      : "";
                    const inInfo = data.indexNow?.status
                      ? `\nIndexNow (Bing/Yandex): Status ${data.indexNow.status} (Accepted)`
                      : "";
                    alert(`✅ Indexing Pipeline Triggered!\nSubmitted ${data.urlCount} URLs across the site.${gInfo}${inInfo}\nGooglebot Sitemap: Pinged`);
                  } else {
                    alert(`⚠️ Indexing Error: ${data.error || "Failed"}`);
                  }
                } catch (e) {
                  alert("Failed to reach indexing API");
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg border border-rose-500/50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Trigger Global Indexing Ping
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Models List */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-4 px-6">
          <div>
            <CardTitle className="text-slate-900 text-lg font-bold">
              Recently Created Model Routes
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Direct access to model management and media editing
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/admin/models">
              View all models
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
                <Flame className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-slate-900">No models in database</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Get started by creating your first model profile with custom SEO keywords, photos, and videos.
              </p>
              <Button asChild className="mt-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                <Link href="/admin/models">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Model
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentModels.map((model) => (
                <Link
                  key={model._id}
                  href={`/admin/models/${model._id}`}
                  className="flex items-center justify-between rounded-xl p-3.5 border border-slate-100 bg-white hover:border-slate-300 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    {model.profileImage ? (
                      <img
                        src={model.profileImage}
                        alt={model.name}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-black text-sm border border-slate-200 shrink-0">
                        {model.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                        {model.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600">/model/{model.slug}</span> · {model.media?.length || 0} media assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        model.status === "published" ? "default" : "secondary"
                      }
                      className={
                        model.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }
                    >
                      {model.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
