"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
          className="w-full pl-10 pr-16 py-2 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 border border-slate-200/80 focus:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-200 transition-all shadow-xs"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Live Search Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in max-h-[380px] overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>Searching verified directory...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2 divide-y divide-slate-100">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
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
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        selectedIndex === idx
                          ? "bg-slate-50 text-slate-900"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.profileImage ? (
                          <img
                            src={item.profileImage}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {item.name}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {item.category && (
                              <span className="text-slate-600 font-medium truncate">
                                {item.category}
                              </span>
                            )}
                            {item.category && <span>•</span>}
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-rose-500" />
                              {photoCount}
                            </span>
                            {videoCount > 0 && (
                              <span className="flex items-center gap-1">
                                <VideoIcon className="w-3 h-3 text-violet-500" />
                                {videoCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-800">
                No matching models found
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try searching for a different name, tag, or category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
