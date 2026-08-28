"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  FolderOpen,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import AdsterraBanner from "@/components/ads/adsterra-banner";
import AdsterraNativeBanner from "@/components/ads/adsterra-native";
import { ADS_ENABLED } from "@/lib/ads-config";

interface ModelItem {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  category?: string;
  country?: string;
  tags?: string[];
  profileImage?: string;
  coverImage?: string;
  featured?: boolean;
  photoCount: number;
  videoCount: number;
  createdAt: string;
}

interface Props {
  models: ModelItem[];
  categories: string[];
}

export default function ModelsDirectoryClient({ models, categories }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "photos" | "videos" | "alpha"
  >("newest");

  // Filter and sort models
  const filteredModels = useMemo(() => {
    return models
      .filter((model) => {
        const matchesCategory =
          selectedCategory === "all" ||
          model.category?.toLowerCase() === selectedCategory.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          model.name.toLowerCase().includes(query) ||
          model.country?.toLowerCase().includes(query) ||
          model.tags?.some((t) => t.toLowerCase().includes(query)) ||
          model.category?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "photos") return b.photoCount - a.photoCount;
        if (sortBy === "videos") return b.videoCount - a.videoCount;
        if (sortBy === "alpha") return a.name.localeCompare(b.name);
        // default: newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [models, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Controls Bar: Search & Sort */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search model name, tag, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort models by"
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
            >
              <option value="newest">Newest Added</option>
              <option value="photos">Most Photos</option>
              <option value="videos">Most Videos</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categories:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Categories ({models.length})
          </button>
          {categories.map((cat) => {
            const count = models.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Top Banner Ads (All formats) */}
      <div className="space-y-3">
        <AdsterraBanner size="728x90" label />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <AdsterraBanner size="468x60" />
          <AdsterraBanner size="320x50" />
          <AdsterraBanner size="300x250" />
        </div>
        <AdsterraNativeBanner />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Showing {filteredModels.length} of {models.length} Models
        </p>
      </div>

      {/* Model Cards Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            No models match your criteria
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model, idx) => (
            <div key={model._id} className="contents">
              <Link
                href={`/model/${model.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 hover:border-rose-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Media Preview / Cover */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                  {model.profileImage || model.coverImage ? (
                    <img
                      src={model.profileImage || model.coverImage}
                      alt={model.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-4xl">
                      {model.name.charAt(0)}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Category Badge */}
                  {model.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-rose-600 shadow-xs border border-white/50">
                      {model.category}
                    </span>
                  )}

                  {/* Media Counts */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                      <ImageIcon className="w-3 h-3 text-rose-400" />
                      {model.photoCount}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                      <VideoIcon className="w-3 h-3 text-violet-400" />
                      {model.videoCount}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {model.name}
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>

                    {model.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {model.bio}
                      </p>
                    )}
                  </div>

                  {/* View Folder Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                      Open Folder
                    </span>
                    <span className="text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all font-black">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* In-Grid Sponsored High-CPM Ad Card */}
              {ADS_ENABLED && (idx === 2 || idx === 6 || idx === 14) && (
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900 text-white border border-rose-500/40 shadow-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-2">
                    ⚡ Sponsored 4K Premium
                  </span>
                  <AdsterraBanner size="300x250" className="my-0" />
                  <a
                    href="https://www.profitableratecpmnetwork.com/mbhhhzyzh?key=e3577dc8038eab2cc7d5221531c0f23f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black text-center rounded-xl transition-all shadow-md"
                  >
                    Unlock VIP 4K Vault →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
