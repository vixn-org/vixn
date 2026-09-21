"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Sync with URL query parameter on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (typeof q === "string") {
        setQuery(q);
      }
    }
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full max-w-xs sm:max-w-sm md:max-w-md"
      role="search"
    >
      <div className="relative w-full flex items-center">
        {/* Search Icon / Submit Button */}
        <button
          type="submit"
          aria-label="Search"
          className="absolute left-3 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center p-0.5"
        >
          <SearchRoundedIcon sx={{ fontSize: 19 }} />
        </button>

        {/* Search Input Field */}
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          placeholder="Search 4K videos, creators, tags..."
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-[#121826]/90 hover:bg-[#161e32] focus:bg-[#121826] text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-9 pr-8 py-2 border border-white/[0.08] focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner"
        />

        {/* Clear Button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-white/[0.06]"
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>
    </form>
  );
}
