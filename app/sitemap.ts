import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import BlogPost from "@/lib/models/blog";
import { getMediaSlug } from "@/lib/seo";

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
      url: `${SITE_URL}/blog`,
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

    const [models, blogs] = await Promise.all([
      Model.find({ status: "published" })
        .select("slug updatedAt featured media")
        .lean(),
      BlogPost.find({ status: "published" })
        .select("slug updatedAt publishedAt featured")
        .lean(),
    ]);

    const modelEntries: MetadataRoute.Sitemap = [];
    models.forEach((model) => {
      // Main Model Profile Page
      modelEntries.push({
        url: `${SITE_URL}/model/${model.slug}`,
        lastModified: model.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: model.featured ? 0.9 : 0.8,
      });

      const hasPhotos = (model.media || []).some((m: any) => m.type === "photo");
      const hasVideos = (model.media || []).some((m: any) => m.type === "video");

      // Dedicated Photos Hub Page
      if (hasPhotos) {
        modelEntries.push({
          url: `${SITE_URL}/model/${model.slug}/photos`,
          lastModified: model.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.85,
        });
      }

      // Dedicated Videos Hub Page
      if (hasVideos) {
        modelEntries.push({
          url: `${SITE_URL}/model/${model.slug}/videos`,
          lastModified: model.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.85,
        });
      }
    });

    const mediaEntries: MetadataRoute.Sitemap = [];
    models.forEach((model) => {
      (model.media || []).forEach((item: any, idx: number) => {
        if (item.type === "photo") {
          const mediaSlug = getMediaSlug(item, "photo", idx);
          mediaEntries.push({
            url: `${SITE_URL}/model/${model.slug}/photo/${mediaSlug}`,
            lastModified: model.updatedAt || new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
          });
        } else if (item.type === "video") {
          const mediaSlug = getMediaSlug(item, "video", idx);
          mediaEntries.push({
            url: `${SITE_URL}/model/${model.slug}/video/${mediaSlug}`,
            lastModified: model.updatedAt || new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.75,
          });
        }
      });
    });

    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || blog.publishedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: blog.featured ? 0.9 : 0.8,
    }));

    return [...baseEntries, ...modelEntries, ...mediaEntries, ...blogEntries];
  } catch (error) {
    console.error("Sitemap DB generation warning:", error);
    return baseEntries;
  }
}


