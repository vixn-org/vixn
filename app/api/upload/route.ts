import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabase";
import { optimizeImageBuffer } from "@/lib/image-optimizer";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (Images only)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/heic",
      "image/heif",
    ];

    if (file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Direct video file uploads are not supported. Please use external redirect URLs for videos." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Supported image formats: JPG, PNG, WEBP, GIF, AVIF" },
        { status: 400 }
      );
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 100MB)" },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Professional Optimization: Max 1280px dimensions, WebP 78% quality, stripped metadata
    const optimized = await optimizeImageBuffer(rawBuffer, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 78,
    });

    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();
    const targetFilename = `${cleanBaseName}.${optimized.extension}`;

    const { url, bucket } = await uploadToSupabase(
      optimized.buffer,
      targetFilename,
      optimized.contentType
    );

    const savingsPercent = Math.max(
      0,
      Math.round(
        ((optimized.originalSize - optimized.optimizedSize) /
          optimized.originalSize) *
          100
      )
    );

    return NextResponse.json({
      url,
      type: "photo",
      bucket,
      filename: targetFilename,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savings: `${savingsPercent}%`,
      width: optimized.width,
      height: optimized.height,
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload and compress image" },
      { status: 500 }
    );
  }
}
