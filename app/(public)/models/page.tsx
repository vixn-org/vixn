import { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import ModelsDirectoryClient from "./models-directory-client";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: { absolute: "All Models & Creators Directory | VIXN" },
  description:
    "Explore our verified directory of top models and creators. Browse HD photo collections, 4K streaming videos, and portfolios on VIXN, updated daily.",
  keywords: [
    "models directory",
    "pornstars list",
    "model portfolios",
    "verified creators",
    "hd model photos",
    "4k adult videos",
    "vixn models",
  ],
  alternates: {
    canonical: `${SITE_URL}/models`,
  },
  openGraph: {
    title: "All Models & Creators Directory | VIXN",
    description:
      "Explore our complete verified directory of top models and creators. Browse HD photo collections, 4K streaming videos, and detailed portfolios on VIXN.fun.",
    url: `${SITE_URL}/models`,
    siteName: "VIXN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "All Models & Creators Directory - VIXN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Models & Creators Directory | VIXN",
    description:
      "Explore our complete verified directory of top models and creators on VIXN.fun.",
    images: [`${SITE_URL}/logo.jpg`],
  },
};

export const revalidate = 3600;

interface SerializedModel {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  category?: string;
  country?: string;
  tags?: string[];
  profileImage?: string;
  coverImage?: string;
  featured?: boolean;
  photoCount: number;
  videoCount: number;
  createdAt: string;
}

export default async function ModelsPage() {
  let models: SerializedModel[] = [];

  try {
    await connectDB();
    const rawModels = await Model.find({ status: "published" })
      .sort("-createdAt")
      .lean();

    models = rawModels.map((m: any) => ({
      _id: m._id.toString(),
      name: m.name,
      slug: m.slug,
      bio: m.bio || "",
      category: m.category || "",
      country: m.country || "",
      tags: m.tags || [],
      profileImage: m.profileImage || "",
      coverImage: m.coverImage || "",
      featured: !!m.featured,
      photoCount: m.media?.filter((i: any) => i.type === "photo").length || 0,
      videoCount: m.media?.filter((i: any) => i.type === "video").length || 0,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : "",
    }));
  } catch (error) {
    console.error("ModelsPage DB fetch error:", error);
  }

  // Extract unique categories
  const categories = Array.from(
    new Set(models.map((m) => m.category).filter(Boolean))
  ) as string[];

  // SEO: CollectionPage & ItemList Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Models & Creators Directory",
    description:
      "Complete directory of models, photo galleries, and video sets on VIXN.fun.",
    url: `${SITE_URL}/models`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: models.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.name,
        url: `${SITE_URL}/model/${model.slug}`,
        image: model.profileImage || undefined,
      })),
    },
  };

  // SEO: Breadcrumbs Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Models",
        item: `${SITE_URL}/models`,
      },
    ],
  };

  return (
    <div className="space-y-10 pb-16 text-slate-100">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-10 border-none">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          {/* Breadcrumb Visual */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121826]/85 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-300 border-none mb-2"
          >
            <Link href="/" className="hover:text-rose-400 transition-colors flex items-center gap-1">
              <HomeRoundedIcon sx={{ fontSize: 15 }} />
              <span>Home</span>
            </Link>
            <ChevronRightRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
            <span className="text-rose-400 font-bold">Models Directory</span>
          </nav>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border-none shadow-md">
              <WhatshotRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
              <span>Verified Creator Portfolios</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Explore All{" "}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
                Models &amp; Creators
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Browse our complete collection of verified creator folders,
              high-definition photo sets, and 4K streaming videos.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-200">
            <div className="bg-[#121826]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border-none">
              <PhotoCameraRoundedIcon sx={{ fontSize: 16, color: "#818cf8" }} />
              <span>
                {models.reduce((acc, m) => acc + m.photoCount, 0)} Photos
              </span>
            </div>
            <div className="bg-[#121826]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border-none">
              <VideocamRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
              <span>
                {models.reduce((acc, m) => acc + m.videoCount, 0)} Videos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Models Directory with Search, Filter & Sorting */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ModelsDirectoryClient models={models} categories={categories} />
      </section>
    </div>
  );
}
