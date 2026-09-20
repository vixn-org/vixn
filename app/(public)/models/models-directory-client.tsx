"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

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
      <div className="bg-[#121826]/90 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 border-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <SearchRoundedIcon
              sx={{ fontSize: 18, color: "#94a3b8" }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search model name, tag, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-white/[0.04] text-sm text-slate-100 placeholder:text-slate-500 border-none shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white border-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <SortRoundedIcon sx={{ fontSize: 16 }} />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort models by"
              className="px-3.5 py-2 rounded-2xl bg-white/[0.06] text-xs font-bold text-slate-200 border-none focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="newest" className="bg-[#121826] text-slate-100">Newest Added</option>
              <option value="photos" className="bg-[#121826] text-slate-100">Most Photos</option>
              <option value="videos" className="bg-[#121826] text-slate-100">Most Videos</option>
              <option value="alpha" className="bg-[#121826] text-slate-100">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-none">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <FilterListRoundedIcon sx={{ fontSize: 16 }} />
            <span>Categories:</span>
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
              selectedCategory === "all"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            All ({models.length})
          </button>
          {categories.map((cat) => {
            const count = models.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                  selectedCategory === cat
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        <p>Showing {filteredModels.length} of {models.length} Models</p>
      </div>

      {/* Model Cards Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-20 bg-[#121826]/60 rounded-md border-none space-y-3">
          <PeopleAltRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} className="mx-auto" />
          <h3 className="text-lg font-bold text-white">
            No models match your criteria
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-2 px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer border-none"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredModels.map((model) => (
            <div
              key={model._id}
              className="group flex flex-col border-none bg-transparent transition-all duration-300"
            >
              <Link href={`/model/${model.slug}`} className="block">
                {/* Media Preview Thumbnail */}
                <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
                  {model.profileImage || model.coverImage ? (
                    <img
                      src={model.profileImage || model.coverImage}
                      alt={model.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#0e1424] text-slate-500 font-bold text-4xl">
                      {model.name.charAt(0)}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Verified Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 border-none">
                    <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#10b981" }} />
                    <span>VERIFIED</span>
                  </div>

                  {/* Category Badge */}
                  {model.category && (
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-300 shadow-md border-none">
                      {model.category}
                    </span>
                  )}

                  {/* Thumbnail Bottom Info */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <p className="font-bold text-sm leading-tight truncate group-hover:text-rose-400 transition-colors">
                      {model.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                      <span>{model.videoCount}V</span>
                      <span>•</span>
                      <span>{model.photoCount}P</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Direct Crawlable Links to Photos, Videos & Profile - Transparent */}
              <div className="pt-2.5 pb-1 px-0.5 flex items-center justify-between gap-2 text-[11px] font-bold bg-transparent border-none">
                <Link
                  href={`/model/${model.slug}/photos`}
                  className="flex-1 py-1.5 px-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 border-none text-center"
                >
                  <PhotoCameraRoundedIcon sx={{ fontSize: 13, color: "#818cf8" }} />
                  <span>{model.photoCount} Photos</span>
                </Link>
                <Link
                  href={`/model/${model.slug}/videos`}
                  className="flex-1 py-1.5 px-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 border-none text-center"
                >
                  <VideocamRoundedIcon sx={{ fontSize: 13, color: "#f43f5e" }} />
                  <span>{model.videoCount} Videos</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
