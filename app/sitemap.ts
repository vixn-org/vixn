import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const models = await Model.find({ status: "published" })
    .select("slug updatedAt featured")
    .lean();

  const modelEntries: MetadataRoute.Sitemap = models.map((model) => ({
    url: `${SITE_URL}/model/${model.slug}`,
    lastModified: model.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: model.featured ? 0.9 : 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...modelEntries,
  ];
}
