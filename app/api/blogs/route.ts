import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlogPost from "@/lib/models/blog";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/seo";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
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
        { error: "Forbidden: Only admins can create blogs" },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Blog title is required" },
        { status: 400 }
      );
    }

    let slug = body.slug ? slugify(body.slug) : slugify(body.title);
    if (!slug) slug = "untitled-post";

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await BlogPost.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Calculate reading time (~200 words per minute)
    const wordCount = (body.content || "").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const blog = await BlogPost.create({
      ...body,
      slug: uniqueSlug,
      readingTime: body.readingTime || readingTime,
      publishedAt: body.status === "published" ? body.publishedAt || new Date() : undefined,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create blog post" },
      { status: 500 }
    );
  }
}
