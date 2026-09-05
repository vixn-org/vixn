import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";
import { getMediaSlug } from "@/lib/seo";

const CHUNK_SIZE = 45000;

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
}

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
async function buildStaticSitemap(siteUrl: string): Promise<string[]> {
  const now = new Date().toISOString();
  return [
    urlEntry(siteUrl, now, "daily", 1.0),
    urlEntry(`${siteUrl}/models`, now, "daily", 0.9),
    urlEntry(`${siteUrl}/blog`, now, "daily", 0.8),
    urlEntry(`${siteUrl}/faq`, now, "weekly", 0.7),
  ];
}

// ─── Model Profiles + /photos + /videos hub pages ───
async function buildModelsSitemap(
  chunkIndex: number,
  siteUrl: string,
): Promise<string[]> {
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
      urlEntry(`${siteUrl}/model/${model.slug}`, lastmod, "weekly", prio),
    );

    const hasPhotos = (model.media || []).some((m: any) => m.type === "photo");
    const hasVideos = (model.media || []).some((m: any) => m.type === "video");

    // Photos hub
    if (hasPhotos) {
      entries.push(
        urlEntry(
          `${siteUrl}/model/${model.slug}/photos`,
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
          `${siteUrl}/model/${model.slug}/videos`,
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
async function buildVideosSitemap(
  chunkIndex: number,
  siteUrl: string,
): Promise<string[]> {
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
      `${siteUrl}/model/${r.slug}/video/${mediaSlug}`,
      lastmod,
      "monthly",
      0.75,
    );
  });
}

// ─── Individual Photo Pages ───
async function buildPhotosSitemap(
  chunkIndex: number,
  siteUrl: string,
): Promise<string[]> {
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
      `${siteUrl}/model/${r.slug}/photo/${mediaSlug}`,
      lastmod,
      "monthly",
      0.7,
    );
  });
}

// ─── Blog Posts ───
async function buildBlogsSitemap(
  chunkIndex: number,
  siteUrl: string,
): Promise<string[]> {
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
    return urlEntry(`${siteUrl}/blog/${blog.slug}`, lastmod, "weekly", prio);
  });
}

// ─── Tags (Keyword Hubs) ───
async function buildTagsSitemap(siteUrl: string): Promise<string[]> {
  const models = await Model.find({ status: "published" })
    .select("tags metaKeywords photosSeo videosSeo media updatedAt")
    .lean();

  const tagMap = new Map<string, Date>();

  for (const m of models) {
    const lastmod = m.updatedAt || new Date();

    // 1. Root model tags & metaKeywords
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
      const cleanSlug = t
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .trim();
      if (!cleanSlug) continue;

      const existingDate = tagMap.get(cleanSlug);
      if (!existingDate || new Date(lastmod) > new Date(existingDate)) {
        tagMap.set(cleanSlug, new Date(lastmod));
      }
    }
  }

  const entries: string[] = [];
  tagMap.forEach((date, tagSlug) => {
    entries.push(
      urlEntry(`${siteUrl}/tag/${tagSlug}`, toIso(date), "daily", 0.8),
    );
  });

  return entries;
}

// ─── Main Route Handler ───
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    const siteUrl = getBaseUrl(request);

    let entries: string[] = [];

    if (id === "static") {
      entries = await buildStaticSitemap(siteUrl);
    } else if (id === "tags") {
      entries = await buildTagsSitemap(siteUrl);
    } else if (id.startsWith("models-")) {
      const chunk = parseInt(id.replace("models-", ""), 10) || 1;
      entries = await buildModelsSitemap(chunk, siteUrl);
    } else if (id.startsWith("videos-")) {
      const chunk = parseInt(id.replace("videos-", ""), 10) || 1;
      entries = await buildVideosSitemap(chunk, siteUrl);
    } else if (id.startsWith("photos-")) {
      const chunk = parseInt(id.replace("photos-", ""), 10) || 1;
      entries = await buildPhotosSitemap(chunk, siteUrl);
    } else if (id.startsWith("blogs-")) {
      const chunk = parseInt(id.replace("blogs-", ""), 10) || 1;
      entries = await buildBlogsSitemap(chunk, siteUrl);
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
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
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
