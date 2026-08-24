import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/models`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    await connectDB();

    const models = await Model.find({ status: "published" })
      .select("slug updatedAt featured")
      .lean();

    const modelEntries: MetadataRoute.Sitemap = models.map((model) => ({
      url: `${SITE_URL}/model/${model.slug}`,
      lastModified: model.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: model.featured ? 0.9 : 0.8,
    }));

    return [...baseEntries, ...modelEntries];
  } catch (error) {
    console.error("Sitemap DB generation warning:", error);
    return baseEntries;
  }
}
