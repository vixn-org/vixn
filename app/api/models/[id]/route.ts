import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { auth } from "@/lib/auth";
import { triggerIndexingPipeline, buildModelAffectedUrls } from "@/lib/indexing";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/models/[id]">
) {
  try {
    await connectDB();
    const { id } = await ctx.params;

    const model = await Model.findById(id).lean();
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error("GET /api/models/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/models/[id]">
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await ctx.params;
    const body = await request.json();

    // Check for slug uniqueness if slug is being changed
    if (body.slug) {
      const existing = await Model.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A model with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate metaDescription on update (SEO guardrail)
    if (body.metaDescription && body.metaDescription.trim().length > 0) {
      const dupDesc = await Model.findOne({
        metaDescription: body.metaDescription.trim(),
        _id: { $ne: id },
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

    const model = await Model.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Trigger auto-indexing pipeline for published models (non-blocking)
    if (model.status === "published") {
      const affectedUrls = buildModelAffectedUrls(model.slug);
      triggerIndexingPipeline(affectedUrls).catch(console.error);

      try {
        revalidatePath("/sitemap.xml");
        revalidatePath("/sitemaps/models-1");
        revalidatePath("/sitemaps/videos-1");
        revalidatePath("/sitemaps/photos-1");
      } catch (_) {
        // Non-critical
      }
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error("PUT /api/models/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update model" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/models/[id]">
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete models" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await ctx.params;

    const model = await Model.findByIdAndDelete(id);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Model deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/models/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
