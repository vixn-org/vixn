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
