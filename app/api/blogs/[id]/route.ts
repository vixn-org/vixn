import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlogPost from "@/lib/models/blog";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/seo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await connectDB();
    const { id } = await params;

    const blog = await BlogPost.findById(id).lean();
    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can edit blogs" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.slug) {
      const formattedSlug = slugify(body.slug);
      const existing = await BlogPost.findOne({
        slug: formattedSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 400 }
        );
      }
      body.slug = formattedSlug;
    }

    // Auto-calculate reading time if content changed
    if (body.content) {
      const wordCount = body.content.split(/\s+/).filter(Boolean).length;
      body.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // If publishing for the first time
    if (body.status === "published" && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const blog = await BlogPost.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete blogs" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
