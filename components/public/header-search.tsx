"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CircularProgress from "@mui/material/CircularProgress";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  profileImage?: string;
  category?: string;
  tags?: string[];
  media?: Array<{ type: string }>;
}

// Global client-side memory cache for ultra-fast search results
const searchCache = new Map<string, SearchResult[]>();

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search with in-memory caching and request cancellation
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Check memory cache first for 0ms instant response
    const cacheKey = trimmed.toLowerCase();
    if (searchCache.has(cacheKey)) {
      setResults(searchCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    // Cancel prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/models?search=${encodeURIComponent(trimmed)}&status=published&limit=6`,
          { signal: abortController.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const items: SearchResult[] = data.models || [];
          searchCache.set(cacheKey, items);
          setResults(items);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          setLoading(false);
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      router.push(`/model/${results[selectedIndex].slug}`);
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/model/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md sm:max-w-xs md:max-w-sm lg:max-w-md">
      {/* Search Input Bar - Borderless Dark Glass */}
      <div className="relative flex items-center">
        <SearchRoundedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search models, tags, categories..."
          className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] text-xs font-medium text-white placeholder:text-slate-400 border-none outline-none transition-all shadow-lg backdrop-blur-xl"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {loading ? (
            <CircularProgress size={14} sx={{ color: "#f43f5e" }} />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border-none"
            >
              <CloseRoundedIcon fontSize="inherit" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white/[0.06] rounded-lg border-none shadow-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Live Search Results Dropdown - Borderless Dark Card */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121826]/95 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[380px] overflow-y-auto backdrop-blur-2xl">
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <CircularProgress size={16} sx={{ color: "#f43f5e" }} />
              <span>Searching verified directory...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Matching Creators</span>
                <span>{results.length} results</span>
              </div>
              <div className="py-1">
                {results.map((item, idx) => {
                  const photoCount =
                    item.media?.filter((m) => m.type === "photo").length || 0;
                  const videoCount =
                    item.media?.filter((m) => m.type === "video").length || 0;

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item.slug)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        selectedIndex === idx
                          ? "bg-white/[0.1] text-white"
                          : "hover:bg-white/[0.06] text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.profileImage ? (
                          <img
                            src={item.profileImage}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">
                              {item.name}
                            </span>
                            <CheckCircleRoundedIcon className="text-emerald-400 text-sm shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {item.category && (
                              <span className="text-slate-300 font-medium truncate">
                                {item.category}
                              </span>
                            )}
                            {item.category && <span>•</span>}
                            <span className="flex items-center gap-1 text-slate-400">
                              <PhotoCameraRoundedIcon className="text-xs text-rose-400" />
                              {photoCount}
                            </span>
                            {videoCount > 0 && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <VideocamRoundedIcon className="text-xs text-indigo-400" />
                                {videoCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRightRoundedIcon className="text-slate-500 text-sm shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="font-semibold text-xs text-slate-200">
                No matching models found
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try searching for a different name, tag, or category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
