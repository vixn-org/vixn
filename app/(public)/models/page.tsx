import { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import {
  Flame,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Search,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Filter,
  Grid,
} from "lucide-react";
import ModelsDirectoryClient from "./models-directory-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: "All Models & Creators Directory | VIXN",
  description:
    "Explore our complete verified directory of top models and creators. Browse HD photo collections, 4K streaming videos, and detailed portfolios on VIXN.fun.",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "All Models & Creators Directory | VIXN",
    description:
      "Explore our complete verified directory of top models and creators on VIXN.fun.",
  },
};

export const dynamic = "force-dynamic";

interface SerializedModel {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  category?: string;
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
    new Set(models.map((m) => m.category).filter(Boolean)),
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
        name: "Models Directory",
        item: `${SITE_URL}/models`,
      },
    ],
  };

  return (
    <div className="space-y-12 pb-16">
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
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-10 pb-12 border-b border-slate-100">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb Visual */}
          <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900">Models Directory</span>
          </nav>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight">
            Explore All{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Models &amp; Creators
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Browse our complete collection of verified creator folders,
            high-definition photo sets, and 4K streaming videos.
          </p>

          {/* Quick Metrics */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-slate-700">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>
                {models.reduce((acc, m) => acc + m.photoCount, 0)} Photos
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-violet-600" />
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
