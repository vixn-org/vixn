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

    // If no specific URLs provided, build URLs for all published models
    let targetUrls = urls || [];
    if (targetUrls.length === 0) {
      await connectDB();
      const models = await Model.find({ status: "published" })
        .select("slug")
        .lean();
      targetUrls = models.flatMap((m) => buildModelAffectedUrls(m.slug));
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
