import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabase";
import { optimizeImageBuffer } from "@/lib/image-optimizer";

/**
 * POST /api/admin/upload-remote-image
 *
 * Downloads an external image/thumbnail URL (with browser-like Referer/User-Agent
 * to bypass anti-hotlinking / 403 blocks), passes it through Sharp optimization
 * (WebP 78%, max 1280px, metadata stripped), and uploads it directly to Supabase storage.
 *
 * Request body:
 *   { imageUrl: string, filenameHint?: string }
 *
 * Response:
 *   { url: string, originalUrl: string, size: number, width?: number, height?: number }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, filenameHint } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Valid imageUrl string is required" },
        { status: 400 }
      );
    }

    const cleanUrl = imageUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "imageUrl must be a valid HTTP or HTTPS URL" },
        { status: 400 }
      );
    }

    // Determine host to construct realistic Referer header
    let referer = "";
    try {
      const parsed = new URL(cleanUrl);
      referer = `${parsed.protocol}//${parsed.host}/`;
    } catch {
      // ignore
    }

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
    };
    if (referer) {
      headers["Referer"] = referer;
    }

    const fetchRes = await fetch(cleanUrl, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!fetchRes.ok) {
      return NextResponse.json(
        {
          error: `Failed to download image from source (${fetchRes.status} ${fetchRes.statusText})`,
        },
        { status: 502 }
      );
    }

    const arrayBuf = await fetchRes.arrayBuffer();
    if (!arrayBuf || arrayBuf.byteLength === 0) {
      return NextResponse.json(
        { error: "Downloaded image is empty (0 bytes)" },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(arrayBuf);

    // Optimize using our standard Sharp pipeline: WebP 78% quality, max 1280px
    const optimized = await optimizeImageBuffer(rawBuffer, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 78,
    });

    const baseName = (filenameHint || "thumb")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40)
      .toLowerCase();

    const targetFilename = `${baseName || "image"}.${optimized.extension}`;

    const { url, bucket } = await uploadToSupabase(
      optimized.buffer,
      targetFilename,
      optimized.contentType
    );

    return NextResponse.json({
      success: true,
      url,
      originalUrl: cleanUrl,
      bucket,
      size: optimized.optimizedSize,
      width: optimized.width,
      height: optimized.height,
    });
  } catch (error: any) {
    console.error("POST /api/admin/upload-remote-image error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to download and upload remote image" },
      { status: 500 }
    );
  }
}
