import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import SearchTag from "@/lib/models/search-tag";
import { slugify } from "@/lib/seo";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").trim();
    const activeParam = searchParams.get("active");

    const query: Record<string, unknown> = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [{ tag: { $regex: searchRegex } }, { slug: { $regex: searchRegex } }];
    }

    if (activeParam === "true") {
      query.active = true;
    } else if (activeParam === "false") {
      query.active = false;
    }

    const [tags, total, totalActive] = await Promise.all([
      SearchTag.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SearchTag.countDocuments(query),
      SearchTag.countDocuments({ active: true }),
    ]);

    return NextResponse.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        totalActive,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/search-tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Support both single tag object or bulk text / array
    let rawItems: string[] = [];

    if (typeof body.text === "string") {
      // Multiline textarea input
      rawItems = body.text
        .split(/[\r\n,]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.tags)) {
      rawItems = body.tags
        .map((s: string) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
    } else if (typeof body.tag === "string") {
      rawItems = [body.tag.trim()].filter(Boolean);
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one search tag or phrase" },
        { status: 400 }
      );
    }

    // Deduplicate within the incoming batch
    const uniqueMap = new Map<string, { tag: string; slug: string }>();
    for (const raw of rawItems) {
      const cleanTag = raw.replace(/\s+/g, " ").trim();
      const slug = slugify(cleanTag);
      if (cleanTag && slug && !uniqueMap.has(slug)) {
        uniqueMap.set(slug, { tag: cleanTag, slug });
      }
    }

    const candidateSlugs = Array.from(uniqueMap.keys());
    const existingTags = await SearchTag.find({ slug: { $in: candidateSlugs } }).select("slug").lean();
    const existingSlugSet = new Set(existingTags.map((t: any) => t.slug));

    const docsToInsert: Array<{
      tag: string;
      slug: string;
      customTitle?: string;
      customDescription?: string;
      active: boolean;
      clicks: number;
    }> = [];

    for (const [slug, item] of uniqueMap.entries()) {
      if (!existingSlugSet.has(slug)) {
        docsToInsert.push({
          tag: item.tag,
          slug: item.slug,
          customTitle: body.customTitle?.trim() || "",
          customDescription: body.customDescription?.trim() || "",
          active: true,
          clicks: 0,
        });
      }
    }

    let insertedCount = 0;
    if (docsToInsert.length > 0) {
      const inserted = await SearchTag.insertMany(docsToInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    const skippedCount = candidateSlugs.length - insertedCount;

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedCount} new search SEO tags (${skippedCount} existing were skipped).`,
      addedCount: insertedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("POST /api/admin/search-tags error:", error);
    return NextResponse.json(
      { error: "Failed to create search tags" },
      { status: 500 }
    );
  }
}
