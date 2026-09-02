import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const CHUNK_SIZE = 45000;

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const siteUrl = getBaseUrl(request);

    const [modelCount, blogCount] = await Promise.all([
      Model.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "published" }),
    ]);

    // Count total individual media items for video/photo sub-sitemaps
    const mediaAgg = await Model.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$media" },
      {
        $group: {
          _id: "$media.type",
          count: { $sum: 1 },
        },
      },
    ]);

    const videosCount =
      mediaAgg.find((a) => a._id === "video")?.count || 0;
    const photosCount =
      mediaAgg.find((a) => a._id === "photo")?.count || 0;

    // Each model generates 3 URLs (profile + /photos + /videos hubs)
    const modelUrlCount = modelCount * 3;
    const modelChunks = Math.max(1, Math.ceil(modelUrlCount / CHUNK_SIZE));
    const videoChunks = Math.max(1, Math.ceil(videosCount / CHUNK_SIZE));
    const photoChunks = Math.max(1, Math.ceil(photosCount / CHUNK_SIZE));
    const blogChunks = Math.max(1, Math.ceil(blogCount / CHUNK_SIZE));

    const now = new Date().toISOString();

    const sitemaps: string[] = [];

    // Static pages sitemap
    sitemaps.push(
      `  <sitemap>
    <loc>${siteUrl}/sitemaps/static</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    );

    // Model profile sitemaps
    for (let i = 1; i <= modelChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${siteUrl}/sitemaps/models-${i}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
      );
    }

    // Individual video page sitemaps
    for (let i = 1; i <= videoChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${siteUrl}/sitemaps/videos-${i}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
      );
    }

    // Individual photo page sitemaps
    for (let i = 1; i <= photoChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${siteUrl}/sitemaps/photos-${i}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
      );
    }

    // Blog sitemaps
    for (let i = 1; i <= blogChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${siteUrl}/sitemaps/blogs-${i}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
      );
    }

    // Tags (keyword hub pages) sitemap
    sitemaps.push(
      `  <sitemap>
    <loc>${siteUrl}/sitemaps/tags</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join("\n")}
</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Sitemap Index generation error:", error);
    // Return minimal valid sitemap index on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemaps/static</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
