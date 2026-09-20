import Link from "next/link";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

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
    <section className="pt-12 space-y-6 border-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold mb-2 border-none">
            <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
            <span>Discover More Creators</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore Videos from Other Models</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Watch trending videos from other popular adult models and creators
          </p>
        </div>

        <Link
          href="/models"
          className="px-4 py-2 rounded-md text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-md border-none self-start sm:self-auto"
        >
          <span>View All Models</span>
          <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((item) => {
          const poster =
            item.video.thumbnail || item.modelAvatar || "/logo.jpg";

          return (
            <div
              key={`${item.modelSlug}-${item.mediaSlug}`}
              className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
            >
              {/* Video Thumbnail Container */}
              <Link
                href={item.url}
                className="relative aspect-video w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.015] transition-all duration-300 block"
              >
                <img
                  src={poster}
                  alt={item.video.alt || `${item.modelName} video`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Play button overlay - visible only on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-transform">
                    <PlayArrowRoundedIcon sx={{ fontSize: 26 }} />
                  </div>
                </div>
              </Link>

              {/* Title and Info Below Thumbnail - Completely Transparent */}
              <div className="pt-3 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1.5 bg-transparent">
                <Link href={item.url} className="block">
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                    {item.video.title || `${item.modelName} Video Clip`}
                  </h4>
                </Link>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-400 bg-transparent border-none">
                  <Link
                    href={`/model/${item.modelSlug}`}
                    className="flex items-center gap-2 min-w-0 group/author hover:text-white transition-colors"
                  >
                    {item.modelAvatar && (
                      <img
                        src={item.modelAvatar}
                        alt={item.modelName}
                        className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                      />
                    )}
                    <span className="font-semibold text-slate-300 group-hover/author:text-rose-400 truncate text-[11px]">
                      {item.modelName}
                    </span>
                  </Link>

                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {item.totalVideos} videos
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
