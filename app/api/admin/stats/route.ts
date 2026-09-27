import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [total, published, draft, recentModels] = await Promise.all([
      Model.countDocuments({}),
      Model.countDocuments({ status: "published" }),
      Model.countDocuments({ status: "draft" }),
      Model.find({})
        .select("name slug profileImage status createdAt media._id")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return NextResponse.json(
      {
        stats: { total, published, draft },
        recentModels,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
