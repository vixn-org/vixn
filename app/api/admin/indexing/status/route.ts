import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalModels,
      publishedModels,
      draftModels,
      totalBlogs,
      mediaAgg,
    ] = await Promise.all([
      Model.countDocuments(),
      Model.countDocuments({ status: "published" }),
      Model.countDocuments({ status: "draft" }),
      BlogPost.countDocuments({ status: "published" }),
      Model.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$media" },
        {
          $group: {
            _id: "$media.type",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const videosCount = mediaAgg.find((a) => a._id === "video")?.count || 0;
    const photosCount = mediaAgg.find((a) => a._id === "photo")?.count || 0;

    // Calculate sub-sitemap URL counts
    const CHUNK_SIZE = 45000;
    const modelUrlCount = publishedModels * 3; // profile + /photos + /videos
    const modelChunks = Math.max(1, Math.ceil(modelUrlCount / CHUNK_SIZE));
    const videoChunks = Math.max(1, Math.ceil(videosCount / CHUNK_SIZE));
    const photoChunks = Math.max(1, Math.ceil(photosCount / CHUNK_SIZE));
    const blogChunks = Math.max(1, Math.ceil(totalBlogs / CHUNK_SIZE));

    const indexNowConfigured = !!process.env.INDEXNOW_KEY;

    return NextResponse.json({
      content: {
        totalModels,
        publishedModels,
        draftModels,
        totalVideos: videosCount,
        totalPhotos: photosCount,
        totalBlogs,
        totalIndexableUrls:
          4 + modelUrlCount + videosCount + photosCount + totalBlogs, // 4 = static pages
      },
      sitemaps: {
        totalSubSitemaps: 1 + modelChunks + videoChunks + photoChunks + blogChunks,
        breakdown: {
          static: { chunks: 1, urls: 4 },
          models: { chunks: modelChunks, urls: modelUrlCount },
          videos: { chunks: videoChunks, urls: videosCount },
          photos: { chunks: photoChunks, urls: photosCount },
          blogs: { chunks: blogChunks, urls: totalBlogs },
        },
      },
      indexing: {
        indexNowConfigured,
        indexNowKey: indexNowConfigured
          ? process.env.INDEXNOW_KEY!.slice(0, 8) + "..."
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/admin/indexing/status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch indexing status" },
      { status: 500 }
    );
  }
}
