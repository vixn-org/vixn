import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ezjjxiuinehrdbtyxzhp.supabase.co";

// Use service role key if available, otherwise anon key or empty string fallback
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

export const BUCKET_IMAGES = "images";
export const BUCKET_VIDEOS = "videos";

/**
 * Upload a media file buffer to Supabase storage.
 * Directs images to the 'images' bucket and videos to the 'videos' bucket.
 */
export async function uploadToSupabase(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; bucket: string; path: string }> {
  const isVideo = contentType.startsWith("video/");
  const bucket = isVideo ? BUCKET_VIDEOS : BUCKET_IMAGES;
  const ext = filename.split(".").pop() || (isVideo ? "mp4" : "jpg");
  const filePath = `${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Supabase upload error in bucket "${bucket}":`, error);
    throw new Error(error.message || `Failed to upload file to ${bucket}`);
  }

  // Retrieve public URL from Supabase storage
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicData.publicUrl,
    bucket,
    path: data.path,
  };
}

/**
 * Delete a media file from Supabase storage.
 */
export async function deleteFromSupabase(
  url: string,
  type: "photo" | "video"
): Promise<void> {
  const bucket = type === "video" ? BUCKET_VIDEOS : BUCKET_IMAGES;

  // Extract path from public URL
  // e.g. https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const urlPrefix = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(urlPrefix)) return;

  const filePath = url.replace(urlPrefix, "");
  if (!filePath) return;

  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    console.error(`Supabase delete error in bucket "${bucket}":`, error);
  }
}
