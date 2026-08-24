import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/models/[id]/media">
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await ctx.params;
    const body = await request.json();

    const model = await Model.findById(id);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const newMedia = {
      type: body.type || "photo",
      url: body.url,
      thumbnail: body.thumbnail || "",
      title: body.title || "",
      alt: body.alt || "",
      order: model.media.length,
      isExternal: Boolean(body.isExternal),
    };

    model.media.push(newMedia);
    await model.save();

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    console.error("POST /api/models/[id]/media error:", error);
    return NextResponse.json(
      { error: "Failed to add media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/models/[id]/media">
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await ctx.params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json(
        { error: "mediaId is required" },
        { status: 400 }
      );
    }

    const model = await Model.findById(id);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    model.media = model.media.filter(
      (m: { _id?: { toString(): string } }) => m._id?.toString() !== mediaId
    );
    await model.save();

    return NextResponse.json({ model });
  } catch (error) {
    console.error("DELETE /api/models/[id]/media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
