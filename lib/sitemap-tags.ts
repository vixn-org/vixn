import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { slugify } from "@/lib/seo";

export interface SitemapTag {
  slug: string;
  lastmod: Date;
}

function extractKeywords(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => extractKeywords(v));
  }
  if (typeof val === "string") {
    return val
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

let cachedTags: SitemapTag[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in-memory cache

/**
 * Aggregates, deduplicates, and sorts all unique keyword tags across published models for sitemaps.
 */
export async function getUniqueSitemapTags(forceRefresh = false): Promise<SitemapTag[]> {
  const now = Date.now();
  if (!forceRefresh && cachedTags && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedTags;
  }

  await connectDB();

  const models = await Model.find({ status: "published" })
    .select(
      "tags metaKeywords photosSeo.metaKeywords videosSeo.metaKeywords media.keywords updatedAt createdAt"
    )
    .lean();

  const tagMap = new Map<string, Date>();

  for (const m of models as any[]) {
    const lastmod = m.updatedAt || m.createdAt || new Date();

    // 1. Model tags & SEO keywords
    const allKeywords: string[] = [
      ...extractKeywords(m.tags),
      ...extractKeywords(m.metaKeywords),
      ...extractKeywords(m.photosSeo?.metaKeywords),
      ...extractKeywords(m.videosSeo?.metaKeywords),
    ];

    // 2. Individual media keywords
    (m.media || []).forEach((item: any) => {
      allKeywords.push(...extractKeywords(item.keywords));
    });

    for (const t of allKeywords) {
      if (!t || typeof t !== "string") continue;
      const cleanSlug = slugify(t);
      if (!cleanSlug) continue;

      const existingDate = tagMap.get(cleanSlug);
      if (!existingDate || new Date(lastmod) > new Date(existingDate)) {
        tagMap.set(cleanSlug, new Date(lastmod));
      }
    }
  }

  const result = Array.from(tagMap.entries())
    .map(([slug, lastmod]) => ({ slug, lastmod }))
    .sort((a, b) => b.lastmod.getTime() - a.lastmod.getTime());

  cachedTags = result;
  lastFetchTime = Date.now();
  return result;
}
