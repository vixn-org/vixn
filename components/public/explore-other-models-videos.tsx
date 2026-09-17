import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Video as VideoIcon,
  Play,
  Flame,
} from "lucide-react";

export interface OtherModelVideoItem {
  modelName: string;
  modelSlug: string;
  modelAvatar?: string;
  category?: string;
  video: {
    _id?: any;
    url?: string;
    title?: string;
    alt?: string;
    thumbnail?: string;
  };
  mediaSlug: string;
  url: string;
  totalVideos: number;
}

interface Props {
  videos: OtherModelVideoItem[];
  currentModelName?: string;
}

export default function ExploreOtherModelsVideos({
  videos,
  currentModelName,
}: Props) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="pt-12 border-t border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Discover More Creators</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explore Videos from Other Models</span>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Watch trending videos from other popular adult models and creators
          </p>
        </div>

        <Link
          href="/models"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 shrink-0 transition-colors"
        >
          <span>View All Models</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((item) => {
          const poster =
            item.video.thumbnail || item.modelAvatar || "/logo.jpg";

          return (
            <Link
              key={`${item.modelSlug}-${item.mediaSlug}`}
              href={item.url}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={poster}
                  alt={item.video.alt || `${item.modelName} video`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-rose-600/60 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-600 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs flex items-center gap-1 border border-white/10">
                  <VideoIcon className="w-3 h-3 text-rose-400" />
                  <span>VIDEO</span>
                </div>

                {item.category && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs border border-white/10">
                    {item.category}
                  </div>
                )}
              </div>

              <div className="p-3 bg-white flex-1 flex flex-col justify-between space-y-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                  {item.video.title || `${item.modelName} Video Clip`}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.modelAvatar && (
                      <img
                        src={item.modelAvatar}
                        alt={item.modelName}
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    )}
                    <span className="font-semibold text-slate-700 truncate text-[11px]">
                      {item.modelName}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {item.totalVideos} videos
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
