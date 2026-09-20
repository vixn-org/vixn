"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { getMediaSlug } from "@/lib/seo";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ZoomOutMapRoundedIcon from "@mui/icons-material/ZoomOutMapRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";

export interface MediaItemProps {
  _id?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title?: string;
  alt?: string;
  keywords?: string[];
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
    let shortestCol = 0;
    for (let i = 1; i < colCount; i++) {
      if (colHeights[i] < colHeights[shortestCol]) {
        shortestCol = i;
      }
    }

    cols[shortestCol].push({ item, originalIndex: index });
    // Adjust height weight to accommodate the title bar below
    const heightWeight = item.type === "photo" ? 1.4 : 0.85;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | number | null>(
    null,
  );

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE) || 1;

  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return media.slice(start, start + ITEMS_PER_PAGE);
  }, [media, currentPage]);

  const cols4 = useMemo(
    () => distributeMediaItems(paginatedMedia, 4),
    [paginatedMedia],
  );
  const cols3 = useMemo(
    () => distributeMediaItems(paginatedMedia, 3),
    [paginatedMedia],
  );
  const cols2 = useMemo(
    () => distributeMediaItems(paginatedMedia, 2),
    [paginatedMedia],
  );

  const currentItem =
    lightboxIndex !== null ? media[lightboxIndex] : null;

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
      prev! > 0 ? prev! - 1 : media.length - 1,
    );
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! < media.length - 1 ? prev! + 1 : 0,
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

    const titleText =
      item.title ||
      (item.type === "video"
        ? `${modelName} HD Video #${globalIndex + 1}`
        : `${modelName} Photo Capture #${globalIndex + 1}`);

    return (
      <div
        key={mediaKey}
        className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
      >
        {/* Media Preview Container */}
        {item.type === "photo" ? (
          photoHref ? (
            <Link
              href={photoHref}
              className="relative aspect-4/5 w-full bg-[#182238] cursor-pointer overflow-hidden block rounded-md shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300"
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
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="w-full flex items-center justify-between text-white">
                  <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                    View HD Photo
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ZoomOutMapRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="relative aspect-4/5 w-full bg-[#182238] cursor-pointer overflow-hidden rounded-md shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300"
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
            </div>
          )
        ) : videoHref ? (
          <Link
            href={videoHref}
            className="relative aspect-video w-full bg-[#0e1424] overflow-hidden cursor-pointer group/video block rounded-md shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300"
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
              <div className="w-full h-full flex items-center justify-center bg-[#0e1424] text-slate-500">
                <VideocamRoundedIcon sx={{ fontSize: 44, color: "#64748b" }} />
              </div>
            )}
            {/* Play button overlay - visible only on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-13 h-13 rounded-full bg-rose-600/90 group-hover/video:bg-rose-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover/video:scale-110 transition-transform">
                <PlayArrowRoundedIcon sx={{ fontSize: 30 }} />
              </div>
            </div>
          </Link>
        ) : (
          <div className="relative aspect-video w-full bg-[#0a0e1a] overflow-hidden flex items-center justify-center rounded-md shadow-xl">
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
          </div>
        )}

        {/* Video / Photo Title and Info Below Thumbnail - Completely Transparent */}
        <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
          {photoHref ? (
            <Link href={photoHref} className="block">
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                {titleText}
              </h4>
            </Link>
          ) : videoHref ? (
            <Link href={videoHref} className="block">
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                {titleText}
              </h4>
            </Link>
          ) : (
            <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
              {titleText}
            </h4>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 bg-transparent border-none">
            <div className="flex items-center gap-1.5">
              {item.type === "video" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-semibold text-[11px]">
                  <VideocamRoundedIcon sx={{ fontSize: 13 }} />
                  Full Clip
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold text-[11px]">
                  <PhotoCameraRoundedIcon sx={{ fontSize: 13 }} />
                  HD Photo
                </span>
              )}
            </div>

            {photoHref ? (
              <Link
                href={photoHref}
                className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
              >
                <span>View</span>
                <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
              </Link>
            ) : videoHref ? (
              <Link
                href={videoHref}
                className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
              >
                <span>Watch</span>
                <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
              </Link>
            ) : null}
          </div>
        </div>
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
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                currentPage === p
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="w-8 text-center text-slate-500 text-xs">
              ...
            </span>
          ),
        )}
      </div>
    );
  };

  return (
    <div ref={galleryRef} className="w-full space-y-6">
      {/* Gallery Header Info */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
        <span className="font-semibold text-slate-300">
          Showing {paginatedMedia.length} of {media.length} media items
        </span>
        {totalPages > 1 && (
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Gallery Grid */}
      {media.length === 0 ? (
        <div className="py-20 text-center rounded-md bg-[#121826]/70 backdrop-blur-xl border-none">
          <AutoAwesomeRoundedIcon sx={{ fontSize: 40, color: "#475569" }} className="mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            No media available in this section
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Check back later for fresh updates.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop 4 Columns */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5 items-start">
            {cols4.map((col, colIdx) => (
              <div key={`col4-${colIdx}`} className="flex flex-col gap-5">
                {col.map(({ item, originalIndex }) =>
                  renderMediaCard(item, originalIndex),
                )}
              </div>
            ))}
          </div>

          {/* Tablet 2 Columns */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:hidden gap-5 items-start">
            {cols2.map((col, colIdx) => (
              <div key={`col2-${colIdx}`} className="flex flex-col gap-5">
                {col.map(({ item, originalIndex }) =>
                  renderMediaCard(item, originalIndex),
                )}
              </div>
            ))}
          </div>

          {/* Mobile 1 Column */}
          <div className="flex flex-col sm:hidden gap-4">
            {paginatedMedia.map((item, index) => renderMediaCard(item, index))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, media.length)}{" "}
                of {media.length} assets
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer border-none"
                  aria-label="Previous page"
                >
                  <NavigateBeforeRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Prev</span>
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer border-none"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <NavigateNextRoundedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && currentItem && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          {/* Top action bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold bg-white/10 px-3.5 py-1.5 rounded-full">
                {lightboxIndex + 1} / {media.length}
              </span>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline-block">
                {currentItem.title || `${modelName} Gallery`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentItem.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg border-none"
                title="Download Ultra HD 4K"
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                <span>Download 4K</span>
              </a>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
                title="Download original"
              >
                <FileDownloadRoundedIcon sx={{ fontSize: 20 }} />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
                title="Close"
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 cursor-pointer border-none"
            aria-label="Previous image"
          >
            <NavigateBeforeRoundedIcon sx={{ fontSize: 28 }} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 cursor-pointer border-none"
            aria-label="Next image"
          >
            <NavigateNextRoundedIcon sx={{ fontSize: 28 }} />
          </button>

          {/* Main Media Display */}
          <div className="max-w-5xl max-h-[80vh] flex flex-col items-center justify-center">
            {currentItem.type === "photo" ? (
              <img
                src={currentItem.url}
                alt={currentItem.alt || modelName}
                className="max-h-[75vh] max-w-full object-contain rounded-md shadow-2xl"
              />
            ) : (
              <video
                src={currentItem.url}
                poster={currentItem.thumbnail}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-md shadow-2xl"
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
