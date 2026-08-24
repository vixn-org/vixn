"use client";

import { useState } from "react";
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
  Info,
} from "lucide-react";

export interface MediaItemProps {
  _id?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title?: string;
  alt?: string;
  order?: number;
}

interface GalleryViewerProps {
  media: MediaItemProps[];
  modelName: string;
}

export default function ModelGalleryViewer({
  media,
  modelName,
}: GalleryViewerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = media.filter((item) => item.type === "photo");
  const videos = media.filter((item) => item.type === "video");

  const filteredMedia =
    activeTab === "photos"
      ? photos
      : activeTab === "videos"
      ? videos
      : media;

  const currentItem =
    lightboxIndex !== null ? filteredMedia[lightboxIndex] : null;

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredMedia.length - 1
    );
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! < filteredMedia.length - 1 ? prev! + 1 : 0
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Gallery Filter Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Content</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {media.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photos</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "photos"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {photos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "videos"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>Videos</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "videos"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {videos.length}
            </span>
          </button>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing {filteredMedia.length} of {media.length} items
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item, index) => (
            <div
              key={item._id || index}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {item.type === "photo" ? (
                <div
                  className="relative aspect-4/5 w-full bg-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={item.url}
                    alt={
                      item.alt ||
                      `${modelName} - Exclusive photo item ${index + 1}`
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full flex items-center justify-between text-white">
                      <span className="text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        Click to enlarge
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-rose-500" />
                    PHOTO
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <video
                    src={item.url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                    title={item.title || `${modelName} video clip ${index + 1}`}
                  >
                    Your browser does not support the video element.
                  </video>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs border border-white/50 flex items-center gap-1">
                    <VideoIcon className="w-3 h-3 text-violet-600" />
                    VIDEO
                  </div>
                </div>
              )}

              {/* Card Meta & Backend Details */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                    {item.title || `${modelName} - Exclusive Media #${index + 1}`}
                  </h4>
                  {item.alt && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.alt}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Indexed Content
                  </span>
                  {item.type === "photo" && (
                    <button
                      onClick={() => setLightboxIndex(index)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      View High-Res
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl"
              />
            )}

            {/* Bottom Caption */}
            {(currentItem.title || currentItem.alt) && (
              <div className="mt-4 text-center text-slate-300 text-sm max-w-2xl px-4">
                {currentItem.title && (
                  <p className="font-semibold text-white">{currentItem.title}</p>
                )}
                {currentItem.alt && (
                  <p className="text-xs text-slate-400 mt-1">{currentItem.alt}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
