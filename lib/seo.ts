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

/**
 * Clean, de-duplicate, and clamp SEO titles to ensure strict compliance with Bing (<= 70 chars) and Google (<= 60 chars).
 * Strips existing brand suffixes (e.g. "| VIXN", "| Vixn", "- VIXN", "on VIXN") to prevent double branding.
 * Clamps cleanly at word boundaries so that the final title with suffix is strictly <= 65 chars.
 */
export function formatSeoTitle(rawTitle: string, brandSuffix: string = SITE_NAME): string {
  if (!rawTitle) return `${brandSuffix} - Free HD Videos & Photos`;

  // Remove existing site suffix like "| VIXN", "- VIXN", "| Vixn", "on VIXN.fun", "on Vixn", "| vixn.fun"
  let clean = rawTitle
    .replace(/(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strip dangling punctuation from the end before appending suffix
  clean = clean.replace(/[\s\-,|&:]+$/, "").trim();

  const suffix = ` | ${brandSuffix}`;
  const maxBaseLen = 65 - suffix.length; // 58 chars max for base

  if (clean.length > maxBaseLen) {
    clean = clean.substring(0, maxBaseLen);
    const lastSpace = clean.lastIndexOf(" ");
    if (lastSpace > 28) {
      clean = clean.substring(0, lastSpace);
    }
  }

  // Strip dangling punctuation again after truncation
  clean = clean.replace(/[\s\-,|&:]+$/, "").trim();

  return `${clean}${suffix}`;
}

/**
 * Sanitize and clamp meta descriptions to strictly 120-155 characters.
 * Bing Webmaster Guidelines require 25-160 chars (flags 224/188 as errors).
 * Google requires 120-155 chars.
 * Eliminates keyword stuffing, excessive comma lists, and spam strings.
 */
export function formatSeoDescription(rawDesc: string | undefined | null, fallbackDesc: string): string {
  let text = (rawDesc || "").trim();

  // Detect spam/keyword stuffing: excessive commas, known spam words, or lack of proper sentence structure
  const commaCount = (text.match(/,/g) || []).length;
  const spamTerms = ["sohail khan", "elvish yadav", "gangbang", "chut", "fuck", "chudai", "bobs", "bigg boss"];
  const hasSpamTerm = spamTerms.some((term) => text.toLowerCase().includes(term));

  if (commaCount > 4 || hasSpamTerm || text.length < 25) {
    // If first sentence is clean and decent length, use it; otherwise use editorial fallback
    const sentences = text.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
    const firstSentence = sentences[0] || "";
    const firstSentenceHasSpam = spamTerms.some((t) => firstSentence.toLowerCase().includes(t));
    const firstSentenceCommas = (firstSentence.match(/,/g) || []).length;

    if (firstSentence.length >= 45 && !firstSentenceHasSpam && firstSentenceCommas <= 3) {
      text = firstSentence;
    } else {
      text = fallbackDesc.trim();
    }
  }

  text = text.replace(/\s+/g, " ").trim();

  // If text is short (< 95 chars), append high-CTR value proposition naturally
  if (text.length < 95) {
    const valueProp = `Watch free HD photo galleries and 4K streaming videos online on ${SITE_NAME}.`;
    const combined = `${text.replace(/\.+$/, "")}. ${valueProp}`;
    if (combined.length <= 155) {
      text = combined;
    } else {
      let truncated = combined.substring(0, 152);
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > 100) truncated = truncated.substring(0, lastSpace);
      text = `${truncated}...`;
    }
  }

  // If text is too long (> 155 chars), clamp cleanly at word boundary
  if (text.length > 155) {
    let truncated = text.substring(0, 152);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 110) {
      truncated = truncated.substring(0, lastSpace);
    }
    // Clean trailing punctuation before adding ellipsis
    truncated = truncated.replace(/[\s,;:\-]+$/, "");
    text = `${truncated}...`;
  }

  return text;
}

export function generateModelMetadata(model: IModel): Metadata {
  const rawTitle = model.metaTitle || `${model.name} - Photos & Videos`;
  const title = formatSeoTitle(rawTitle);

  const fallbackDesc = `Watch exclusive ${model.name} HD photos, 4K streaming videos and viral leaks on ${SITE_NAME}. Free high-definition adult gallery updated daily.`;
  const description = formatSeoDescription(model.metaDescription, fallbackDesc);

  const url = `${SITE_URL}/model/${model.slug}`;
  const ogImage = model.ogImage || model.profileImage || "";

  const robots = model.robotsDirective || "index, follow";

  return {
    title: { absolute: title },
    description,
    keywords: model.metaKeywords?.length
      ? model.metaKeywords.join(", ")
      : `${model.name}, model, photos, videos, gallery`,
    alternates: {
      canonical: model.canonicalUrl || url,
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
              height: 630,
              alt: `${model.name} - ${SITE_NAME}`,
            },
          ]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const fallbackDesc = `Watch exclusive ${model.name} HD photos, 4K streaming videos and viral leaks on ${SITE_NAME}.`;
  const cleanDescription = formatSeoDescription(model.metaDescription, fallbackDesc);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: model.name,
    url,
    image: model.profileImage || undefined,
    description: cleanDescription,
    ...(model.country
      ? {
          nationality: {
            "@type": "Country",
            name: model.country,
          },
        }
      : {}),
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
        item: `${SITE_URL}/models`,
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

export function generateModelPhotosMetadata(model: any): Metadata {
  const custom = model.photosSeo;
  const photoCount =
    model.media?.filter((m: any) => m.type === "photo").length || 0;
  const countStr = photoCount > 0 ? ` (${photoCount})` : "";

  const rawTitle =
    custom?.metaTitle?.trim() ||
    `${model.name} HD Photos & Pictures${countStr}`;
  const title = formatSeoTitle(rawTitle);

  const fallbackDesc = `Browse all exclusive high-definition photoshoot pictures and photo sets of ${model.name} on ${SITE_NAME}. Free 4K HD photo collection updated daily.`;
  const description = formatSeoDescription(custom?.metaDescription, fallbackDesc);

  const url = `${SITE_URL}/model/${model.slug}/photos`;
  const ogImage = model.ogImage || model.coverImage || model.profileImage || "";
  const robots = model.robotsDirective || "index, follow";

  const keywords =
    custom?.metaKeywords && custom.metaKeywords.length > 0
      ? custom.metaKeywords.join(", ")
      : `${model.name} photos, ${model.name} pictures, ${model.name} photoshoot, ${model.name} hd gallery, ${model.name} images`;

  return {
    title: { absolute: title },
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
              height: 630,
              alt: `${model.name} Photos & Pictures - ${SITE_NAME}`,
            },
          ]
        : [],
      type: "website",
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

export function generateModelPhotosJsonLd(model: any) {
  const url = `${SITE_URL}/model/${model.slug}/photos`;
  const photos = model.media?.filter((m: any) => m.type === "photo") || [];
  const fallbackDesc = `HD photo collection and pictures of ${model.name} on ${SITE_NAME}.`;
  const cleanDescription = formatSeoDescription(model.photosSeo?.metaDescription, fallbackDesc);

  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: model.photosSeo?.heading || `${model.name} Photo Sets & Gallery`,
    url,
    description: cleanDescription,
    author: {
      "@type": "Person",
      name: model.name,
      url: `${SITE_URL}/model/${model.slug}`,
    },
    image: photos.map((m: any, idx: number) => ({
      "@type": "ImageObject",
      url: m.url,
      name: m.title || `${model.name} photo ${idx + 1}`,
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
        name: "Photos",
        item: url,
      },
    ],
  };

  return { imageGallerySchema, breadcrumbSchema };
}

export function generateModelVideosMetadata(model: any): Metadata {
  const custom = model.videosSeo;
  const videoCount =
    model.media?.filter((m: any) => m.type === "video").length || 0;
  const countStr = videoCount > 0 ? ` (${videoCount})` : "";

  const rawTitle =
    custom?.metaTitle?.trim() ||
    `${model.name} HD Videos & 4K Clips${countStr}`;
  const title = formatSeoTitle(rawTitle);

  const fallbackDesc = `Watch exclusive high-definition video clips, 4K reels, and streaming videos of ${model.name} on ${SITE_NAME}. Free full-length streaming updated daily.`;
  const description = formatSeoDescription(custom?.metaDescription, fallbackDesc);

  const url = `${SITE_URL}/model/${model.slug}/videos`;
  const firstVideo = model.media?.find((m: any) => m.type === "video");
  const ogImage =
    firstVideo?.thumbnail ||
    model.coverImage ||
    model.profileImage ||
    "";
  const robots = model.robotsDirective || "index, follow";

  const keywords =
    custom?.metaKeywords && custom.metaKeywords.length > 0
      ? custom.metaKeywords.join(", ")
      : `${model.name} videos, ${model.name} clips, ${model.name} 4k video, ${model.name} stream, ${model.name} watch online`;

  return {
    title: { absolute: title },
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
              width: 1280,
              height: 720,
              alt: `${model.name} Videos & Clips - ${SITE_NAME}`,
            },
          ]
        : [],
      type: "video.other",
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

export function generateModelVideosJsonLd(model: any) {
  const url = `${SITE_URL}/model/${model.slug}/videos`;
  const videos = model.media?.filter((m: any) => m.type === "video") || [];
  const fallbackDesc = `Video collection and 4K streaming clips of ${model.name} on ${SITE_NAME}.`;
  const cleanDescription = formatSeoDescription(model.videosSeo?.metaDescription, fallbackDesc);

  const videoCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: model.videosSeo?.heading || `${model.name} Video Showcase & Clips`,
    url,
    description: cleanDescription,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: videos.map((v: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "VideoObject",
          name: v.title || `${model.name} Video Clip ${idx + 1}`,
          description: v.alt || `${model.name} streaming video`,
          thumbnailUrl: [
            v.thumbnail || model.profileImage || `${SITE_URL}/logo.jpg`,
          ],
          contentUrl: v.url,
          uploadDate: model.createdAt
            ? new Date(model.createdAt).toISOString()
            : new Date().toISOString(),
        },
      })),
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
        name: "Videos",
        item: url,
      },
    ],
  };

  return { videoCollectionSchema, breadcrumbSchema };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [SITE_NAME, "Vixn", "VIXN.fun", "vixn.fun", "Vixn.Fun"],
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

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: [SITE_NAME, "VIXN.fun", "Vixn"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.jpg`,
      width: 512,
      height: 512,
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
  const rawTitle = blog.metaTitle || `${blog.title} | ${SITE_NAME} Blog`;
  const title = formatSeoTitle(rawTitle);
  const fallbackDesc =
    blog.excerpt ||
    `Read ${blog.title} on ${SITE_NAME}. Tips, guides, and creator insights.`;
  const description = formatSeoDescription(blog.metaDescription, fallbackDesc);
  const url = `${SITE_URL}/blog/${blog.slug}`;
  const ogImage = blog.ogImage || blog.coverImage || "";
  const robots = blog.robotsDirective || "index, follow";

  return {
    title: { absolute: title },
    description,
    keywords: blog.metaKeywords?.length
      ? blog.metaKeywords.join(", ")
      : `${blog.title}, ${blog.category}, blog, vixn`,
    alternates: {
      canonical: blog.canonicalUrl || url,
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
  const photoTitle = mediaItem.title || `${model.name} HD Photo ${fallbackIndex + 1}`;
  const baseTitle = photoTitle.toLowerCase().includes(model.name.toLowerCase())
    ? photoTitle
    : `${photoTitle} - ${model.name}`;
  const title = formatSeoTitle(baseTitle);
  const fallbackDesc = `View high-definition photo of ${model.name} on ${SITE_NAME}. Stream full uncensored gallery, 4K picture sets, and exclusive photos online.`;
  const description = formatSeoDescription(mediaItem.alt, fallbackDesc);
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
    title: { absolute: title },
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
  const photoTitle = mediaItem.title || `${model.name} HD Photo ${fallbackIndex + 1}`;
  const fallbackDesc = `HD photo of ${model.name} on ${SITE_NAME}.`;
  const cleanDescription = formatSeoDescription(mediaItem.alt, fallbackDesc);

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
    description: cleanDescription,
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
        name: "Photos",
        item: `${SITE_URL}/model/${model.slug}/photos`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: photoTitle,
        item: url,
      },
    ],
  };

  return { imageSchema, breadcrumbSchema };
}

export function generateVideoMetadata(model: any, mediaItem: any, fallbackIndex: number = 0): Metadata {
  const videoTitle = mediaItem.title || `${model.name} HD Video ${fallbackIndex + 1}`;
  const baseTitle = videoTitle.toLowerCase().includes(model.name.toLowerCase())
    ? videoTitle
    : `${videoTitle} - ${model.name}`;
  const title = formatSeoTitle(baseTitle);
  const fallbackDesc = `Watch high-definition streaming video of ${model.name} on ${SITE_NAME}. Stream 4K video clips, exclusive full-length scenes, and viral reels online.`;
  const description = formatSeoDescription(mediaItem.alt, fallbackDesc);
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
    title: { absolute: title },
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
  const videoTitle = mediaItem.title || `${model.name} HD Video ${fallbackIndex + 1}`;
  const thumbnail = mediaItem.thumbnail || model.profileImage || `${SITE_URL}/logo.jpg`;
  const fallbackDesc = `HD streaming video of ${model.name} on ${SITE_NAME}.`;
  const cleanDescription = formatSeoDescription(mediaItem.alt, fallbackDesc);

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
    description: cleanDescription,
    thumbnailUrl: [thumbnail],
    uploadDate: model.updatedAt
      ? new Date(model.updatedAt).toISOString()
      : model.createdAt
        ? new Date(model.createdAt).toISOString()
        : new Date().toISOString(),
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
        name: "Videos",
        item: `${SITE_URL}/model/${model.slug}/videos`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: videoTitle,
        item: url,
      },
    ],
  };

  return { videoSchema, breadcrumbSchema };
}

export { SITE_URL, SITE_NAME };




