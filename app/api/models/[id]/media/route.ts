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

    const rawItems: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.items)
      ? body.items
      : [body];

    let currentOrder = model.media.length;
    for (const item of rawItems) {
      if (!item || !item.url) continue;

      let keywords: string[] = [];
      if (Array.isArray(item.keywords)) {
        keywords = item.keywords.map((k: any) => String(k).trim()).filter(Boolean);
      } else if (typeof item.keywords === "string" && item.keywords.trim()) {
        keywords = item.keywords
          .split(/\r?\n|,/)
          .map((k: string) => k.trim())
          .filter(Boolean);
      }

      const newMedia = {
        type: item.type || "photo",
        url: item.url,
        thumbnail: item.thumbnail || "",
        title: item.title || "",
        alt: item.alt || item.title || "",
        keywords,
        order: currentOrder++,
        isExternal:
          item.type === "video"
            ? item.isExternal !== undefined
              ? Boolean(item.isExternal)
              : true
            : Boolean(item.isExternal),
      };

      model.media.push(newMedia);
    }

    await model.save();

    return NextResponse.json({ model, count: rawItems.length }, { status: 201 });
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
