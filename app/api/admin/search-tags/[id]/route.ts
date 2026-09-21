import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import SearchTag from "@/lib/models/search-tag";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();
    const body = await request.json();

    const updateFields: Record<string, unknown> = {};
    if (typeof body.active === "boolean") updateFields.active = body.active;
    if (typeof body.customTitle === "string") updateFields.customTitle = body.customTitle.trim();
    if (typeof body.customDescription === "string") updateFields.customDescription = body.customDescription.trim();
    if (typeof body.tag === "string" && body.tag.trim().length > 0) updateFields.tag = body.tag.trim();

    const updated = await SearchTag.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Search tag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, tag: updated });
  } catch (error) {
    console.error("PATCH /api/admin/search-tags/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update search tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const deleted = await SearchTag.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Search tag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Search tag deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/search-tags/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete search tag" },
      { status: 500 }
    );
  }
}
