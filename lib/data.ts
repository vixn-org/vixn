import { cache } from "react";
import { unstable_cache } from "next/cache";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";

/**
 * Fetch a published model by slug.
 * React cache() deduplicates this call across generateMetadata and Page render
 * within the same request pass so MongoDB is queried only ONCE instead of TWICE.
 */
export const getPublishedModelBySlug = cache(async (slug: string) => {
  if (!slug) return null;
  await connectDB();
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  // 1. Direct exact index match (super fast B-tree lookup on indexed lowercase slug)
  let model = await Model.findOne({
    slug: cleanSlug,
    status: "published",
  }).lean();

  // 2. Case-insensitive fallback regex if slug in DB has mixed casing
  if (!model) {
    model = await Model.findOne({
      slug: { $regex: new RegExp(`^${cleanSlug}$`, "i") },
      status: "published",
    }).lean();
  }

  return model;
});

/**
 * Cached fetch for other models' photos for "Explore Other Models" section.
 * Cached with next/cache unstable_cache so subsequent page loads do not hit MongoDB repeatedly.
 */
export const getExploreOtherModelsPhotos = unstable_cache(
  async () => {
    await connectDB();
    return Model.find({
      status: "published",
      "media.type": "photo",
    })
      .select(
        "name slug profileImage coverImage category media._id media.type media.url media.title media.alt media.order"
      )
      .sort({ featured: -1, updatedAt: -1 })
      .limit(13)
      .lean();
  },
  ["explore-other-models-photos-v2"],
  { revalidate: 3600, tags: ["models", "explore-photos"] }
);

/**
 * Cached fetch for other models' videos for "Explore Other Models" section.
 * Cached with next/cache unstable_cache so subsequent page loads do not hit MongoDB repeatedly.
 */
export const getExploreOtherModelsVideos = unstable_cache(
  async () => {
    await connectDB();
    return Model.find({
      status: "published",
      "media.type": "video",
    })
      .select(
        "name slug profileImage coverImage category media._id media.type media.url media.title media.alt media.thumbnail media.order"
      )
      .sort({ featured: -1, updatedAt: -1 })
      .limit(13)
      .lean();
  },
  ["explore-other-models-videos-v2"],
  { revalidate: 3600, tags: ["models", "explore-videos"] }
);
