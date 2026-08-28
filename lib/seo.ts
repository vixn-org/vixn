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

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateHomepageItemListJsonLd(models: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: model.name,
      url: `${SITE_URL}/model/${model.slug}`,
    })),
  };
}

export function generateBlogMetadata(blog: any): Metadata {
  const title = blog.metaTitle || `${blog.title} | ${SITE_NAME} Blog`;
  const description =
    blog.metaDescription ||
    blog.excerpt ||
    `Read ${blog.title} on ${SITE_NAME}. Tips, guides, and creator insights.`;
  const url = `${SITE_URL}/blog/${blog.slug}`;
  const ogImage = blog.ogImage || blog.coverImage || "";
  const robots = blog.robotsDirective || "index, follow";

  return {
    title,
    description,
    keywords: blog.metaKeywords?.length
      ? blog.metaKeywords.join(", ")
      : `${blog.title}, ${blog.category}, blog, vixn`,
    alternates: {
      canonical: blog.canonicalUrl || url,
    },
    openGraph: {
      title: blog.ogTitle || title,
      description: blog.ogDescription || description,
      url,
      siteName: SITE_NAME,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [],
      type: "article",
      publishedTime: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : new Date(blog.createdAt).toISOString(),
      modifiedTime: blog.updatedAt
        ? new Date(blog.updatedAt).toISOString()
        : undefined,
      authors: [blog.author?.name || "VIXN Editorial"],
      tags: blog.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.twitterTitle || blog.ogTitle || title,
      description: blog.twitterDescription || blog.ogDescription || description,
      images: blog.twitterImage || ogImage ? [blog.twitterImage || ogImage] : [],
    },
    robots,
  };
}

export function generateBlogJsonLd(blog: any) {
  const url = `${SITE_URL}/blog/${blog.slug}`;
  const ogImage = blog.ogImage || blog.coverImage || `${SITE_URL}/logo.jpg`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.metaDescription || blog.title,
    image: ogImage ? [ogImage] : undefined,
    datePublished: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : new Date(blog.createdAt).toISOString(),
    dateModified: blog.updatedAt
      ? new Date(blog.updatedAt).toISOString()
      : new Date(blog.createdAt).toISOString(),
    author: {
      "@type": "Person",
      name: blog.author?.name || "VIXN Editorial",
      jobTitle: blog.author?.role || "Content Editor",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: blog.category || "Guides",
    keywords: blog.metaKeywords?.length
      ? blog.metaKeywords.join(", ")
      : blog.tags?.join(", "),
    wordCount: blog.content ? blog.content.split(/\s+/).length : undefined,
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
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: url,
      },
    ],
  };

  return { articleSchema, breadcrumbSchema };
}

export function getMediaSlug(item: any, type: "photo" | "video" = "photo", fallbackIndex: number = 0): string {
  const baseTitle = item.title || item.alt || `${type}-${fallbackIndex + 1}`;
  const cleanTitleSlug = slugify(baseTitle);
  const idPart = item._id?.toString() || item.order?.toString() || `${fallbackIndex + 1}`;
  return cleanTitleSlug ? `${cleanTitleSlug}-${idPart}` : idPart;
}

export function generatePhotoMetadata(model: any, mediaItem: any, fallbackIndex: number = 0): Metadata {
  const photoTitle = mediaItem.title || `${model.name} HD Photo`;
  const title = `${photoTitle} | ${model.name} Gallery | ${SITE_NAME}`;
  const description =
    mediaItem.alt ||
    `View exclusive high-definition photo of ${model.name} on ${SITE_NAME}. ${model.bio?.substring(0, 100) || ""}`;
  const mediaSlug = getMediaSlug(mediaItem, "photo", fallbackIndex);
  const url = `${SITE_URL}/model/${model.slug}/photo/${mediaSlug}`;
  const ogImage = mediaItem.url || model.profileImage || "";
  const robots = model.robotsDirective || "index, follow";

  const mediaKeywordsList: string[] = Array.isArray(mediaItem.keywords)
    ? mediaItem.keywords.filter(Boolean)
    : typeof mediaItem.keywords === "string" && mediaItem.keywords.trim()
    ? mediaItem.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : [];
  const mediaKeywordsStr = mediaKeywordsList.join(", ");

  const baseKeywords = model.metaKeywords?.length
    ? `${model.metaKeywords.join(", ")}, ${model.name} photo, ${model.name} picture, HD photo`
    : `${model.name}, ${model.name} photo, model photo, HD photo, vixn`;

  const keywords = mediaKeywordsStr
    ? `${baseKeywords}, ${mediaKeywordsStr}`
    : baseKeywords;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 1500,
              alt: mediaItem.alt || photoTitle,
            },
          ]
        : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots,
  };
}

export function generatePhotoJsonLd(model: any, mediaItem: any, fallbackIndex: number = 0) {
  const mediaSlug = getMediaSlug(mediaItem, "photo", fallbackIndex);
  const url = `${SITE_URL}/model/${model.slug}/photo/${mediaSlug}`;
  const photoTitle = mediaItem.title || `${model.name} HD Photo`;

  const mediaKeywordsList: string[] = Array.isArray(mediaItem.keywords)
    ? mediaItem.keywords.filter(Boolean)
    : typeof mediaItem.keywords === "string" && mediaItem.keywords.trim()
    ? mediaItem.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : [];
  const mediaKeywordsStr = mediaKeywordsList.join(", ");

  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: mediaItem.url,
    url: url,
    name: photoTitle,
    caption: mediaItem.alt || photoTitle,
    description: mediaItem.alt || `${photoTitle} - ${model.name}`,
    ...(mediaKeywordsStr ? { keywords: mediaKeywordsStr } : {}),
    author: {
      "@type": "Person",
      name: model.name,
      url: `${SITE_URL}/model/${model.slug}`,
    },
    creator: {
      "@type": "Person",
      name: model.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.jpg`,
      },
    },
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
        item: `${SITE_URL}/models`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: `${SITE_URL}/model/${model.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: photoTitle,
        item: url,
      },
    ],
  };

  return { imageSchema, breadcrumbSchema };
}

export function generateVideoMetadata(model: any, mediaItem: any, fallbackIndex: number = 0): Metadata {
  const videoTitle = mediaItem.title || `${model.name} HD Video Clip`;
  const title = `${videoTitle} | ${model.name} Videos | ${SITE_NAME}`;
  const description =
    mediaItem.alt ||
    `Watch exclusive high-definition video of ${model.name} on ${SITE_NAME}. ${model.bio?.substring(0, 100) || ""}`;
  const mediaSlug = getMediaSlug(mediaItem, "video", fallbackIndex);
  const url = `${SITE_URL}/model/${model.slug}/video/${mediaSlug}`;
  const thumbnail = mediaItem.thumbnail || model.profileImage || "";
  const robots = model.robotsDirective || "index, follow";

  const mediaKeywordsList: string[] = Array.isArray(mediaItem.keywords)
    ? mediaItem.keywords.filter(Boolean)
    : typeof mediaItem.keywords === "string" && mediaItem.keywords.trim()
    ? mediaItem.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : [];
  const mediaKeywordsStr = mediaKeywordsList.join(", ");

  const baseKeywords = model.metaKeywords?.length
    ? `${model.metaKeywords.join(", ")}, ${model.name} video, ${model.name} clip, 4K streaming`
    : `${model.name}, ${model.name} video, model video, HD stream, vixn`;

  const keywords = mediaKeywordsStr
    ? `${baseKeywords}, ${mediaKeywordsStr}`
    : baseKeywords;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: thumbnail
        ? [
            {
              url: thumbnail,
              width: 1280,
              height: 720,
              alt: mediaItem.alt || videoTitle,
            },
          ]
        : [],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
    robots,
  };
}

export function generateVideoJsonLd(model: any, mediaItem: any, fallbackIndex: number = 0) {
  const mediaSlug = getMediaSlug(mediaItem, "video", fallbackIndex);
  const url = `${SITE_URL}/model/${model.slug}/video/${mediaSlug}`;
  const videoTitle = mediaItem.title || `${model.name} HD Video Clip`;
  const thumbnail = mediaItem.thumbnail || model.profileImage || `${SITE_URL}/logo.jpg`;

  const mediaKeywordsList: string[] = Array.isArray(mediaItem.keywords)
    ? mediaItem.keywords.filter(Boolean)
    : typeof mediaItem.keywords === "string" && mediaItem.keywords.trim()
    ? mediaItem.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : [];
  const mediaKeywordsStr = mediaKeywordsList.join(", ");

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoTitle,
    description: mediaItem.alt || `${videoTitle} - ${model.name}`,
    thumbnailUrl: [thumbnail],
    uploadDate: new Date().toISOString(),
    contentUrl: mediaItem.url,
    ...(mediaKeywordsStr ? { keywords: mediaKeywordsStr } : {}),
    actor: {
      "@type": "Person",
      name: model.name,
      url: `${SITE_URL}/model/${model.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.jpg`,
      },
    },
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
        item: `${SITE_URL}/models`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: `${SITE_URL}/model/${model.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: videoTitle,
        item: url,
      },
    ],
  };

  return { videoSchema, breadcrumbSchema };
}

export { SITE_URL, SITE_NAME };




