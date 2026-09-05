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

    // Backend SEO character limits validation and auto-cleaning
    const stripSuffix = (t: string) =>
      t.replace(/(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i, "").trim();

    if (body.metaTitle) {
      body.metaTitle = stripSuffix(body.metaTitle);
      if (body.metaTitle.length > 60) {
        return NextResponse.json(
          { error: `Meta title cannot exceed 60 characters for SEO (currently ${body.metaTitle.length} chars).` },
          { status: 400 }
        );
      }
    }

    if (body.metaDescription) {
      body.metaDescription = body.metaDescription.trim();
      if (body.metaDescription.length > 155) {
        return NextResponse.json(
          { error: `Meta description cannot exceed 155 characters for SEO (currently ${body.metaDescription.length} chars).` },
          { status: 400 }
        );
      }
    }

    if (body.ogTitle) {
      body.ogTitle = stripSuffix(body.ogTitle);
      if (body.ogTitle.length > 60) {
        return NextResponse.json(
          { error: `OG title cannot exceed 60 characters (currently ${body.ogTitle.length} chars).` },
          { status: 400 }
        );
      }
    }

    if (body.ogDescription) {
      body.ogDescription = body.ogDescription.trim();
      if (body.ogDescription.length > 155) {
        return NextResponse.json(
          { error: `OG description cannot exceed 155 characters (currently ${body.ogDescription.length} chars).` },
          { status: 400 }
        );
      }
    }

    if (body.photosSeo) {
      if (body.photosSeo.heading && body.photosSeo.heading.length > 80) {
        return NextResponse.json(
          { error: `Photos heading cannot exceed 80 characters (currently ${body.photosSeo.heading.length} chars).` },
          { status: 400 }
        );
      }
      if (body.photosSeo.metaTitle) {
        body.photosSeo.metaTitle = stripSuffix(body.photosSeo.metaTitle);
        if (body.photosSeo.metaTitle.length > 60) {
          return NextResponse.json(
            { error: `Photos meta title cannot exceed 60 characters (currently ${body.photosSeo.metaTitle.length} chars).` },
            { status: 400 }
          );
        }
      }
      if (body.photosSeo.metaDescription) {
        body.photosSeo.metaDescription = body.photosSeo.metaDescription.trim();
        if (body.photosSeo.metaDescription.length > 155) {
          return NextResponse.json(
            { error: `Photos meta description cannot exceed 155 characters (currently ${body.photosSeo.metaDescription.length} chars).` },
            { status: 400 }
          );
        }
      }
    }

    if (body.videosSeo) {
      if (body.videosSeo.heading && body.videosSeo.heading.length > 80) {
        return NextResponse.json(
          { error: `Videos heading cannot exceed 80 characters (currently ${body.videosSeo.heading.length} chars).` },
          { status: 400 }
        );
      }
      if (body.videosSeo.metaTitle) {
        body.videosSeo.metaTitle = stripSuffix(body.videosSeo.metaTitle);
        if (body.videosSeo.metaTitle.length > 60) {
          return NextResponse.json(
            { error: `Videos meta title cannot exceed 60 characters (currently ${body.videosSeo.metaTitle.length} chars).` },
            { status: 400 }
          );
        }
      }
      if (body.videosSeo.metaDescription) {
        body.videosSeo.metaDescription = body.videosSeo.metaDescription.trim();
        if (body.videosSeo.metaDescription.length > 155) {
          return NextResponse.json(
            { error: `Videos meta description cannot exceed 155 characters (currently ${body.videosSeo.metaDescription.length} chars).` },
            { status: 400 }
          );
        }
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
