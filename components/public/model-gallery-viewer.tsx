"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { getMediaSlug } from "@/lib/seo";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Download,
  Play,
  ExternalLink,
} from "lucide-react";

export interface MediaItemProps {
  _id?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title?: string;
  alt?: string;
  order?: number;
  isExternal?: boolean;
}

interface GalleryViewerProps {
  media: MediaItemProps[];
  modelName: string;
  modelSlug?: string;
}

const ITEMS_PER_PAGE = 24;

function distributeMediaItems(
  items: MediaItemProps[],
  colCount: number,
): { item: MediaItemProps; originalIndex: number }[][] {
  const cols: { item: MediaItemProps; originalIndex: number }[][] = Array.from(
    { length: colCount },
    () => [],
  );
  const colHeights = Array(colCount).fill(0);

  items.forEach((item, index) => {
    // Find column with the lowest accumulated height
    let shortestCol = 0;
    for (let i = 1; i < colCount; i++) {
      if (colHeights[i] < colHeights[shortestCol]) {
        shortestCol = i;
      }
    }

    cols[shortestCol].push({ item, originalIndex: index });
    // Photo (portrait 4:5) has weight 1.25. Video (widescreen 16:9) has weight 0.5625.
    // 2 videos (0.5625 * 2 = 1.125) stack naturally to match 1 photo (1.25)
    const heightWeight = item.type === "photo" ? 1.25 : 0.5625;
    colHeights[shortestCol] += heightWeight;
  });

  return cols;
}

export default function ModelGalleryViewer({
  media,
  modelName,
  modelSlug,
}: GalleryViewerProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | number | null>(
    null,
  );

  const photos = media.filter((item) => item.type === "photo");
  const videos = media.filter((item) => item.type === "video");

  const filteredMedia =
    activeTab === "photos" ? photos : activeTab === "videos" ? videos : media;

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE) || 1;

  // Paginated subset of filtered media
  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedia.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedia, currentPage]);

  const cols3 = useMemo(
    () => distributeMediaItems(paginatedMedia, 3),
    [paginatedMedia],
  );
  const cols2 = useMemo(
    () => distributeMediaItems(paginatedMedia, 2),
    [paginatedMedia],
  );

  const currentItem =
    lightboxIndex !== null ? filteredMedia[lightboxIndex] : null;

  const handleTabChange = (tab: "all" | "photos" | "videos") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (galleryRef.current) {
      const topOffset =
        galleryRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredMedia.length - 1,
    );
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! < filteredMedia.length - 1 ? prev! + 1 : 0,
    );
  };

  const renderMediaCard = (item: MediaItemProps, globalIndex: number) => {
    const mediaKey = item._id || globalIndex;
    const isPlaying = playingVideoId === mediaKey;
    const posterSrc = item.thumbnail || (item.type === "photo" ? item.url : "");

    const photoHref = modelSlug
      ? `/model/${modelSlug}/photo/${getMediaSlug(item, "photo", globalIndex)}`
      : null;

    const videoHref = modelSlug
      ? `/model/${modelSlug}/video/${getMediaSlug(item, "video", globalIndex)}`
      : null;

    return (
      <div
        key={mediaKey}
        className="w-full rounded-xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 group relative bg-slate-900"
      >
        {item.type === "photo" ? (
          photoHref ? (
            /* Dedicated Photo Link */
            <Link
              href={photoHref}
              className="relative aspect-4/5 w-full bg-slate-100 cursor-pointer overflow-hidden block"
            >
              <img
                src={item.url}
                alt={
                  item.alt ||
                  `${modelName} - Exclusive photo item ${globalIndex + 1}`
                }
                title={item.title || `${modelName} photo ${globalIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="w-full flex items-center justify-between text-white">
                  <span className="text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    View HD Photo
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1 z-10">
                <ImageIcon className="w-3 h-3 text-rose-500" />
                PHOTO
              </div>
            </Link>
          ) : (
            /* Lightbox Fallback */
            <div
              className="relative aspect-4/5 w-full bg-slate-100 cursor-pointer overflow-hidden"
              onClick={() => setLightboxIndex(globalIndex)}
            >
              <img
                src={item.url}
                alt={
                  item.alt ||
                  `${modelName} - Exclusive photo item ${globalIndex + 1}`
                }
                title={item.title || `${modelName} photo ${globalIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1 z-10">
                <ImageIcon className="w-3 h-3 text-rose-500" />
                PHOTO
              </div>
            </div>
          )
        ) : videoHref ? (
          /* Dedicated Video Link */
          <Link
            href={videoHref}
            className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer group/video block"
          >
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={item.alt || `${modelName} video thumbnail`}
                title={
                  item.title || `${modelName} video clip ${globalIndex + 1}`
                }
                className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                <VideoIcon className="w-12 h-12 text-slate-600" />
              </div>
            )}
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover/video:bg-transparent transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-rose-600/40 group-hover/video:bg-rose-600/70 text-white flex items-center justify-center shadow-lg transform group-hover/video:scale-110 transition-all">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
            {/* Badges */}
            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
              <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1">
                <VideoIcon className="w-3 h-3 text-violet-600" />
                VIDEO
              </div>
              {item.isExternal && (
                <div className="bg-indigo-600/90 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          </Link>
        ) : (
          /* Fallback Direct Player */
          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
            <video
              src={item.url}
              poster={posterSrc}
              controls
              autoPlay={isPlaying}
              preload="metadata"
              className="w-full h-full object-cover"
              title={item.title || `${modelName} video clip ${globalIndex + 1}`}
              aria-label={
                item.alt || `${modelName} video clip ${globalIndex + 1}`
              }
            >
              Your browser does not support the video element.
            </video>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1 z-10">
              <VideoIcon className="w-3 h-3 text-violet-600" />
              VIDEO
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return (
      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => handlePageChange(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === p
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="w-8 text-center text-slate-400 text-xs">
              ...
            </span>
          ),
        )}
      </div>
    );
  };

  return (
    <div ref={galleryRef} className="w-full space-y-6">
      {/* Gallery Filter Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleTabChange("all")}
            className={`shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Content</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                activeTab === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {media.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("photos")}
            className={`shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Photos</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                activeTab === "photos"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {photos.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("videos")}
            className={`shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "videos"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Videos</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                activeTab === "videos"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {videos.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] sm:text-xs font-medium text-slate-500">
          Showing {paginatedMedia.length} of {filteredMedia.length} items
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredMedia.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No media available in this section
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Check back later for fresh updates.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop 3 Columns - Smart Auto-Balanced */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
            {cols3.map((col, colIdx) => (
              <div key={`col3-${colIdx}`} className="flex flex-col gap-6">
                {col.map(({ item, originalIndex }) =>
                  renderMediaCard(item, originalIndex),
                )}
              </div>
            ))}
          </div>

          {/* Tablet 2 Columns - Smart Auto-Balanced */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:hidden gap-6 items-start">
            {cols2.map((col, colIdx) => (
              <div key={`col2-${colIdx}`} className="flex flex-col gap-6">
                {col.map(({ item, originalIndex }) =>
                  renderMediaCard(item, originalIndex),
                )}
              </div>
            ))}
          </div>

          {/* Mobile 1 Column */}
          <div className="flex flex-col sm:hidden gap-6">
            {paginatedMedia.map((item, index) => renderMediaCard(item, index))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedia.length)}{" "}
                of {filteredMedia.length} assets
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && currentItem && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          {/* Top action bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                {lightboxIndex + 1} / {filteredMedia.length}
              </span>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline-block">
                {currentItem.title || `${modelName} Gallery`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://omg10.com/4/11653141"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                title="Download Ultra HD 4K"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Download 4K</span>
              </a>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Download original"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Media Display */}
          <div className="max-w-5xl max-h-[80vh] flex flex-col items-center justify-center">
            {currentItem.type === "photo" ? (
              <img
                src={currentItem.url}
                alt={currentItem.alt || modelName}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={currentItem.url}
                poster={currentItem.thumbnail}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl"
              />
            )}

            {/* Bottom Caption */}
            {(currentItem.title || currentItem.alt) && (
              <div className="mt-4 text-center text-slate-300 text-sm max-w-2xl px-4">
                {currentItem.title && (
                  <p className="font-semibold text-white">
                    {currentItem.title}
                  </p>
                )}
                {currentItem.alt && (
                  <p className="text-xs text-slate-400 mt-1">
                    {currentItem.alt}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
