import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";
import SearchTag from "@/lib/models/search-tag";
import { getMediaSlug } from "@/lib/seo";
import { getUniqueSitemapTags } from "@/lib/sitemap-tags";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const CHUNK_SIZE = 45000;

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  url: string,
  lastmod: string,
  changefreq: string,
  priority: number,
): string {
  return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

function toIso(date: any): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
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

// ─── Static Pages ───
async function buildStaticSitemap(): Promise<string[]> {
  const now = new Date().toISOString();
  return [
    urlEntry(SITE_URL, now, "daily", 1.0),
    urlEntry(`${SITE_URL}/models`, now, "daily", 0.9),
    urlEntry(`${SITE_URL}/blog`, now, "daily", 0.8),
    urlEntry(`${SITE_URL}/faq`, now, "weekly", 0.7),
    urlEntry(`${SITE_URL}/about`, now, "weekly", 0.7),
    urlEntry(`${SITE_URL}/privacy`, now, "monthly", 0.6),
    urlEntry(`${SITE_URL}/terms`, now, "monthly", 0.6),
    urlEntry(`${SITE_URL}/dmca`, now, "monthly", 0.6),
    urlEntry(`${SITE_URL}/impressum`, now, "monthly", 0.6),
    urlEntry(`${SITE_URL}/2257`, now, "monthly", 0.6),
    urlEntry(`${SITE_URL}/cookies`, now, "monthly", 0.6),
  ];
}

// ─── Model Profiles + /photos + /videos hub pages ───
async function buildModelsSitemap(chunkIndex: number): Promise<string[]> {
  const modelsPerChunk = Math.floor(CHUNK_SIZE / 3);
  const skip = (chunkIndex - 1) * modelsPerChunk;

  const models = await Model.find({ status: "published" })
    .select("slug updatedAt featured media")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(modelsPerChunk)
    .lean();

  const entries: string[] = [];

  for (const model of models) {
    const lastmod = toIso(model.updatedAt);
    const prio = model.featured ? 0.95 : 0.9;

    // Model profile page
    entries.push(
      urlEntry(`${SITE_URL}/model/${model.slug}`, lastmod, "weekly", prio),
    );

    const hasPhotos = (model.media || []).some((m: any) => m.type === "photo");
    const hasVideos = (model.media || []).some((m: any) => m.type === "video");

    // Photos hub
    if (hasPhotos) {
      entries.push(
        urlEntry(
          `${SITE_URL}/model/${model.slug}/photos`,
          lastmod,
          "weekly",
          0.85,
        ),
      );
    }

    // Videos hub
    if (hasVideos) {
      entries.push(
        urlEntry(
          `${SITE_URL}/model/${model.slug}/videos`,
          lastmod,
          "weekly",
          0.85,
        ),
      );
    }
  }

  return entries;
}

// ─── Individual Video Pages ───
async function buildVideosSitemap(chunkIndex: number): Promise<string[]> {
  const skip = (chunkIndex - 1) * CHUNK_SIZE;

  const results = await Model.aggregate([
    { $match: { status: "published" } },
    { $unwind: { path: "$media", includeArrayIndex: "mediaIndex" } },
    { $match: { "media.type": "video" } },
    { $sort: { updatedAt: -1 } },
    { $skip: skip },
    { $limit: CHUNK_SIZE },
    {
      $project: {
        slug: 1,
        updatedAt: 1,
        media: 1,
        mediaIndex: 1,
      },
    },
  ]);

  return results.map((r) => {
    const mediaSlug = getMediaSlug(r.media, "video", r.mediaIndex);
    const lastmod = toIso(r.updatedAt);
    return urlEntry(
      `${SITE_URL}/model/${r.slug}/video/${mediaSlug}`,
      lastmod,
      "monthly",
      0.75,
    );
  });
}

// ─── Individual Photo Pages ───
async function buildPhotosSitemap(chunkIndex: number): Promise<string[]> {
  const skip = (chunkIndex - 1) * CHUNK_SIZE;

  const results = await Model.aggregate([
    { $match: { status: "published" } },
    { $unwind: { path: "$media", includeArrayIndex: "mediaIndex" } },
    { $match: { "media.type": "photo" } },
    { $sort: { updatedAt: -1 } },
    { $skip: skip },
    { $limit: CHUNK_SIZE },
    {
      $project: {
        slug: 1,
        updatedAt: 1,
        media: 1,
        mediaIndex: 1,
      },
    },
  ]);

  return results.map((r) => {
    const mediaSlug = getMediaSlug(r.media, "photo", r.mediaIndex);
    const lastmod = toIso(r.updatedAt);
    return urlEntry(
      `${SITE_URL}/model/${r.slug}/photo/${mediaSlug}`,
      lastmod,
      "monthly",
      0.7,
    );
  });
}

// ─── Blog Posts ───
async function buildBlogsSitemap(chunkIndex: number): Promise<string[]> {
  const skip = (chunkIndex - 1) * CHUNK_SIZE;

  const blogs = await BlogPost.find({ status: "published" })
    .select("slug updatedAt publishedAt featured")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(CHUNK_SIZE)
    .lean();

  return blogs.map((blog) => {
    const lastmod = toIso(blog.updatedAt || blog.publishedAt);
    const prio = blog.featured ? 0.9 : 0.8;
    return urlEntry(`${SITE_URL}/blog/${blog.slug}`, lastmod, "weekly", prio);
  });
}

// ─── Tags (Keyword Hubs) ───
async function buildTagsSitemap(chunkIndex: number = 1): Promise<string[]> {
  const uniqueTags = await getUniqueSitemapTags();
  const skip = (chunkIndex - 1) * CHUNK_SIZE;
  const chunkTags = uniqueTags.slice(skip, skip + CHUNK_SIZE);

  return chunkTags.map((t) =>
    urlEntry(`${SITE_URL}/tag/${t.slug}`, toIso(t.lastmod), "daily", 0.85),
  );
}

// ─── Search SEO Keywords (Chunked when limit crosses) ───
async function buildSearchSitemap(chunkIndex: number = 1): Promise<string[]> {
  const skip = (chunkIndex - 1) * CHUNK_SIZE;
  const tags = await SearchTag.find({ active: true })
    .select("tag slug updatedAt createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(CHUNK_SIZE)
    .lean();

  return tags.map((t: any) => {
    const lastmod = toIso(t.updatedAt || t.createdAt);
    return urlEntry(
      `${SITE_URL}/search?q=${encodeURIComponent(t.tag)}`,
      lastmod,
      "daily",
      0.85,
    );
  });
}

// ─── Main Route Handler ───
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    const cleanId = (id || "").replace(/\.xml$/i, "");

    let entries: string[] = [];

    if (cleanId === "static") {
      entries = await buildStaticSitemap();
    } else if (cleanId === "tags") {
      // Legacy alias for chunk 1
      entries = await buildTagsSitemap(1);
    } else if (cleanId.startsWith("tags-")) {
      const chunk = parseInt(cleanId.replace("tags-", ""), 10) || 1;
      entries = await buildTagsSitemap(chunk);
    } else if (cleanId === "search") {
      entries = await buildSearchSitemap(1);
    } else if (cleanId.startsWith("search-")) {
      const chunk = parseInt(cleanId.replace("search-", ""), 10) || 1;
      entries = await buildSearchSitemap(chunk);
    } else if (cleanId.startsWith("models-")) {
      const chunk = parseInt(cleanId.replace("models-", ""), 10) || 1;
      entries = await buildModelsSitemap(chunk);
    } else if (cleanId.startsWith("videos-")) {
      const chunk = parseInt(cleanId.replace("videos-", ""), 10) || 1;
      entries = await buildVideosSitemap(chunk);
    } else if (cleanId.startsWith("photos-")) {
      const chunk = parseInt(cleanId.replace("photos-", ""), 10) || 1;
      entries = await buildPhotosSitemap(chunk);
    } else if (cleanId.startsWith("blogs-")) {
      const chunk = parseInt(cleanId.replace("blogs-", ""), 10) || 1;
      entries = await buildBlogsSitemap(chunk);
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Sub-sitemap generation error:", error);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
      status: 500,
    });
  }
}
