import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Image as ImageIcon,
  Flame,
} from "lucide-react";

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
    <section className="pt-12 border-t border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Discover More Creators</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explore Photos from Other Models</span>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse high-definition photoshoots and pictures from other adult creators
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((item) => {
          const photoUrl =
            item.photo.url || item.modelAvatar || "/logo.jpg";

          return (
            <Link
              key={`${item.modelSlug}-${item.mediaSlug}`}
              href={item.url}
              className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
            >
              <img
                src={photoUrl}
                alt={item.photo.alt || `${item.modelName} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs flex items-center gap-1 border border-white/10">
                <ImageIcon className="w-2.5 h-2.5 text-sky-400" />
                <span>HD</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-2.5 text-white space-y-0.5">
                <p className="text-xs font-bold truncate leading-tight">
                  {item.modelName}
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  {item.photo.title || `${item.totalPhotos} photos in gallery`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
