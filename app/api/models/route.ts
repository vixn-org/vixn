import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { auth } from "@/lib/auth";
import { triggerIndexingPipeline, buildModelAffectedUrls } from "@/lib/indexing";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    const query: Record<string, unknown> = {};

    if (search) {
      // Escape special regex characters for safe and fast pattern matching
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [
        { name: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { country: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { metaKeywords: { $in: [searchRegex] } },
      ];
    }

    if (status && (status === "published" || status === "draft")) {
      query.status = status;
    }

    // For fast typeahead/header search (small limit), skip countDocuments for maximum speed
    const isFastSearch = search.length > 0 && limit <= 10;

    const findPromise = Model.find(query)
      .select("name slug profileImage coverImage category country tags media createdAt status featured")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const countPromise = isFastSearch
      ? Promise.resolve(null)
      : Model.countDocuments(query);

    const [models, totalCount] = await Promise.all([findPromise, countPromise]);
    const total = totalCount !== null ? totalCount : models.length;

    return NextResponse.json(
      {
        models,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/models error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create models" },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();

    // Check for duplicate slug
    const existing = await Model.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A model with this slug already exists" },
        { status: 400 }
      );
    }

    // Check for duplicate metaDescription (SEO guardrail)
    if (body.metaDescription && body.metaDescription.trim().length > 0) {
      const dupDesc = await Model.findOne({
        metaDescription: body.metaDescription.trim(),
      });
      if (dupDesc) {
        return NextResponse.json(
          {
            error: `Duplicate meta description — already used by model "${dupDesc.name}". Each model must have a unique meta description for SEO.`,
          },
          { status: 400 }
        );
      }
    }

    const model = await Model.create(body);

    // Trigger auto-indexing pipeline for published models (non-blocking)
    if (model.status === "published") {
      const affectedUrls = buildModelAffectedUrls(model.slug);
      triggerIndexingPipeline(affectedUrls).catch(console.error);

      // Revalidate sitemap ISR cache
      try {
        revalidatePath("/sitemap.xml");
        revalidatePath("/sitemaps/models-1");
        revalidatePath("/sitemaps/videos-1");
        revalidatePath("/sitemaps/photos-1");
      } catch (_) {
        // Non-critical — sitemaps will refresh within ISR window
      }
    }

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    console.error("POST /api/models error:", error);
    return NextResponse.json(
      { error: "Failed to create model" },
      { status: 500 }
    );
  }
}
