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

/**
 * Aggregates, deduplicates, and sorts all unique keyword tags across published models for sitemaps.
 */
export async function getUniqueSitemapTags(): Promise<SitemapTag[]> {
  await connectDB();

  const models = await Model.find({ status: "published" })
    .select("tags metaKeywords photosSeo videosSeo media updatedAt createdAt")
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

  return Array.from(tagMap.entries())
    .map(([slug, lastmod]) => ({ slug, lastmod }))
    .sort((a, b) => b.lastmod.getTime() - a.lastmod.getTime());
}
