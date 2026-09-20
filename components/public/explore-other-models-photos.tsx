import Link from "next/link";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";

export interface OtherModelPhotoItem {
  modelName: string;
  modelSlug: string;
  modelAvatar?: string;
  category?: string;
  photo: {
    _id?: any;
    url?: string;
    title?: string;
    alt?: string;
  };
  mediaSlug: string;
  url: string;
  totalPhotos: number;
}

interface Props {
  photos: OtherModelPhotoItem[];
  currentModelName?: string;
}

export default function ExploreOtherModelsPhotos({
  photos,
  currentModelName,
}: Props) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="pt-12 space-y-6 border-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold mb-2 border-none">
            <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
            <span>Discover More Creators</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore Photos from Other Models</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse high-definition photoshoots and pictures from other adult creators
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {photos.map((item) => {
          const photoUrl =
            item.photo.url || item.modelAvatar || "/logo.jpg";

          return (
            <div
              key={`${item.modelSlug}-${item.mediaSlug}`}
              className="w-full transition-all duration-300 group flex flex-col border-none bg-transparent"
            >
              {/* Photo Thumbnail Container */}
              <Link
                href={item.url}
                className="relative aspect-4/5 w-full rounded-md overflow-hidden bg-[#0e1424] shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 block"
              >
                <img
                  src={photoUrl}
                  alt={item.photo.alt || `${item.modelName} photo`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 border-none">
                  <PhotoCameraRoundedIcon sx={{ fontSize: 13, color: "#818cf8" }} />
                  <span>4K</span>
                </div>

                {item.category && (
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-300 shadow-md border-none">
                    {item.category}
                  </div>
                )}
              </Link>

              {/* Title and Info Below Thumbnail - Completely Transparent */}
              <div className="pt-2.5 pb-1 px-0.5 flex flex-col justify-between flex-1 gap-1 bg-transparent">
                <Link href={item.url} className="block">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1 leading-snug">
                    {item.modelName}
                  </h4>
                </Link>

                <div className="flex items-center justify-between text-[11px] text-slate-400 bg-transparent border-none">
                  <span className="text-slate-400 truncate max-w-[90px]">
                    {item.totalPhotos} photos
                  </span>
                  <Link
                    href={item.url}
                    className="font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
