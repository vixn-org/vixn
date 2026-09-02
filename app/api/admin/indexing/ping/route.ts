import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { triggerIndexingPipeline, buildModelAffectedUrls } from "@/lib/indexing";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { urls, revalidateSitemaps } = body as {
      urls?: string[];
      revalidateSitemaps?: boolean;
    };

    // Revalidate sitemap ISR cache
    if (revalidateSitemaps !== false) {
      try {
        revalidatePath("/sitemap.xml");
        revalidatePath("/sitemaps/static");
        revalidatePath("/sitemaps/models-1");
        revalidatePath("/sitemaps/videos-1");
        revalidatePath("/sitemaps/photos-1");
        revalidatePath("/sitemaps/blogs-1");
      } catch (e) {
        console.error("[Ping] Sitemap revalidation error:", e);
      }
    }

    // If no specific URLs provided, build comprehensive URLs for all published content
    let targetUrls = urls || [];
    if (targetUrls.length === 0) {
      await connectDB();
      const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

      // 1. Static Pages
      targetUrls.push(
        SITE_URL,
        `${SITE_URL}/models`,
        `${SITE_URL}/blog`,
        `${SITE_URL}/faq`
      );

      // 2. Models & All Media Items & Tags
      const models = await Model.find({ status: "published" })
        .select("slug tags metaKeywords photosSeo videosSeo media")
        .lean();

      const tagSet = new Set<string>();

      for (const m of models) {
        // Model profile, photos hub, videos hub
        targetUrls.push(
          `${SITE_URL}/model/${m.slug}`,
          `${SITE_URL}/model/${m.slug}/photos`,
          `${SITE_URL}/model/${m.slug}/videos`
        );

        // Individual photos and videos
        (m.media || []).forEach((mediaItem: any, idx: number) => {
          const type = mediaItem.type === "video" ? "video" : "photo";
          const mediaTitle = mediaItem.title || mediaItem.alt || `${type}-${idx + 1}`;
          const cleanSlug = mediaTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .trim();
          const idPart = mediaItem._id?.toString() || `${idx + 1}`;
          const mediaSlug = cleanSlug ? `${cleanSlug}-${idPart}` : idPart;

          targetUrls.push(`${SITE_URL}/model/${m.slug}/${type}/${mediaSlug}`);

          // Collect media keywords
          if (Array.isArray(mediaItem.keywords)) {
            mediaItem.keywords.forEach((k: string) => k && tagSet.add(k));
          }
        });

        // Collect model tags
        (m.tags || []).forEach((t: string) => t && tagSet.add(t));
        (m.metaKeywords || []).forEach((k: string) => k && tagSet.add(k));
        (m.photosSeo?.metaKeywords || []).forEach((k: string) => k && tagSet.add(k));
        (m.videosSeo?.metaKeywords || []).forEach((k: string) => k && tagSet.add(k));
      }

      // Add all unique tag hub URLs
      tagSet.forEach((t) => {
        const cleanTag = t
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .trim();
        if (cleanTag) {
          targetUrls.push(`${SITE_URL}/tag/${cleanTag}`);
        }
      });

      // Deduplicate
      targetUrls = Array.from(new Set(targetUrls));
    }

    const result = await triggerIndexingPipeline(targetUrls);

    return NextResponse.json({
      message: "Indexing pipeline triggered",
      urlCount: targetUrls.length,
      sitemapsRevalidated: revalidateSitemaps !== false,
      indexNow: result.indexNow,
      googlePing: result.googlePing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/admin/indexing/ping error:", error);
    return NextResponse.json(
      { error: "Failed to trigger indexing pipeline" },
      { status: 500 }
    );
  }
}
