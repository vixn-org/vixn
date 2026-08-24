import type { Metadata } from "next";
import type { IModel } from "@/lib/models/model";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "VIXN";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function generateModelMetadata(model: IModel): Metadata {
  const title = model.metaTitle || `${model.name} - Photos & Videos`;
  const description =
    model.metaDescription ||
    `Explore ${model.name}'s exclusive photo gallery and video collection on ${SITE_NAME}. ${model.bio?.substring(0, 100) || ""}`;
  const url = `${SITE_URL}/model/${model.slug}`;
  const ogImage = model.ogImage || model.profileImage || "";

  const robots = model.robotsDirective || "index, follow";

  return {
    title,
    description,
    keywords: model.metaKeywords?.length
      ? model.metaKeywords.join(", ")
      : `${model.name}, model, photos, videos, gallery`,
    alternates: {
      canonical: model.canonicalUrl || url,
    },
    openGraph: {
      title: model.ogTitle || title,
      description: model.ogDescription || description,
      url,
      siteName: SITE_NAME,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${model.name} - ${SITE_NAME}`,
            },
          ]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: model.twitterTitle || model.ogTitle || title,
      description: model.twitterDescription || model.ogDescription || description,
      images: model.twitterImage || model.ogImage || model.profileImage
        ? [model.twitterImage || model.ogImage || model.profileImage]
        : [],
    },
    robots,
    other: {
      "article:author": model.name,
      "article:published_time": model.createdAt?.toISOString() || "",
      "article:modified_time": model.updatedAt?.toISOString() || "",
    },
  };
}

export function generateModelJsonLd(model: IModel) {
  const url = `${SITE_URL}/model/${model.slug}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: model.name,
    url,
    image: model.profileImage || undefined,
    description: model.metaDescription || model.bio?.substring(0, 200) || undefined,
  };

  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${model.name} Gallery`,
    url,
    description: `Photo and video gallery of ${model.name}`,
    image: model.media
      ?.filter((m) => m.type === "photo")
      .map((m) => ({
        "@type": "ImageObject",
        url: m.url,
        name: m.title || `${model.name} photo`,
        description: m.alt || `Photo of ${model.name}`,
      })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Models",
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: url,
      },
    ],
  };

  return { personSchema, imageGallerySchema, breadcrumbSchema };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: `${SITE_NAME} - Premium Model Gallery`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export { SITE_URL, SITE_NAME };
