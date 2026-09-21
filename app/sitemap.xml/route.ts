import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";
import SearchTag from "@/lib/models/search-tag";
import { getUniqueSitemapTags } from "@/lib/sitemap-tags";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const CHUNK_SIZE = 45000;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [modelCount, blogCount, uniqueTags, searchTagCount] = await Promise.all([
      Model.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "published" }),
      getUniqueSitemapTags(),
      SearchTag.countDocuments({ active: true }),
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

    const videosCount = mediaAgg.find((a) => a._id === "video")?.count || 0;
    const photosCount = mediaAgg.find((a) => a._id === "photo")?.count || 0;

    // Each model generates 3 URLs (profile + /photos + /videos hubs)
    const modelUrlCount = modelCount * 3;
    const modelChunks = Math.max(1, Math.ceil(modelUrlCount / CHUNK_SIZE));
    const videoChunks = Math.max(1, Math.ceil(videosCount / CHUNK_SIZE));
    const photoChunks = Math.max(1, Math.ceil(photosCount / CHUNK_SIZE));
    const blogChunks = Math.max(1, Math.ceil(blogCount / CHUNK_SIZE));
    const tagChunks = Math.max(1, Math.ceil(uniqueTags.length / CHUNK_SIZE));
    const searchChunks = Math.max(1, Math.ceil(searchTagCount / CHUNK_SIZE));

    const now = new Date().toISOString();

    const sitemaps: string[] = [];

    // Static pages sitemap
    sitemaps.push(
      `  <sitemap>
    <loc>${SITE_URL}/sitemaps/static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
    );

    // Model profile sitemaps
    for (let i = 1; i <= modelChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/models-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      );
    }

    // Individual video page sitemaps
    for (let i = 1; i <= videoChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/videos-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      );
    }

    // Individual photo page sitemaps
    for (let i = 1; i <= photoChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/photos-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      );
    }

    // Blog sitemaps
    for (let i = 1; i <= blogChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/blogs-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      );
    }

    // Keyword Tags sitemaps (chunked with SEO lastmod matching models-1, videos-1, photos-1)
    for (let i = 1; i <= tagChunks; i++) {
      const chunkStartIndex = (i - 1) * CHUNK_SIZE;
      const chunkFirstTag = uniqueTags[chunkStartIndex];
      const tagLastmod = chunkFirstTag?.lastmod
        ? new Date(chunkFirstTag.lastmod).toISOString()
        : now;

      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/tags-${i}.xml</loc>
    <lastmod>${tagLastmod}</lastmod>
  </sitemap>`,
      );
    }

    // Search SEO Keywords sitemaps (chunked when limit crosses, matching video1 photo1)
    for (let i = 1; i <= searchChunks; i++) {
      sitemaps.push(
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/search-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      );
    }

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
    <loc>${SITE_URL}/sitemaps/static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
