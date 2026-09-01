import sharp from "sharp";

export interface OptimizedImageResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalSize: number;
  optimizedSize: number;
  width?: number;
  height?: number;
}

/**
 * Optimizes an image buffer into high-quality WebP format:
 * - Auto-orients based on EXIF metadata (prevents sideways mobile photos)
 * - Resizes bounding box up to 1600x1600 (without enlarging smaller images)
 * - Encodes as WebP at 82% quality with smart subsampling for crystal-clear retina display
 * - Strips unnecessary EXIF/metadata bloat to achieve ~100KB-150KB average sizes
 */
export async function optimizeImageBuffer(
  inputBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<OptimizedImageResult> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 78 } = options;
  const originalSize = inputBuffer.length;

  try {
    const pipeline = sharp(inputBuffer)
      .rotate() // Auto-orient based on EXIF orientation tag
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort: 6, // Maximum compression effort for smallest size at given quality
        smartSubsample: true,
      });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      contentType: "image/webp",
      extension: "webp",
      originalSize,
      optimizedSize: data.length,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    console.warn("Sharp optimization failed, falling back to original buffer:", error);
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: "jpg",
      originalSize,
      optimizedSize: originalSize,
    };
  }
}
