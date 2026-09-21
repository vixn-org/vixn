import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import SearchTag from "@/lib/models/search-tag";
import { getMediaSlug, slugify } from "@/lib/seo";

export interface SearchVideoItem {
  id: string;
  title: string;
  alt: string;
  thumbnail: string;
  url: string;
  isExternal: boolean;
  order: number;
  videoSlug: string;
  model: {
    name: string;
    slug: string;
    profileImage: string;
    coverImage: string;
    category?: string;
  };
  score: number;
  isFallback?: boolean;
}

export interface SearchResultResponse {
  query: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalMatches: number;
  hasMatches: boolean;
  videos: SearchVideoItem[];
  relatedTags?: Array<{ tag: string; slug: string }>;
}

/**
 * Generate linguistic stems and root forms (e.g. "rosy" -> "rose", "videos" -> "video", "nudes" -> "nude")
 * so typos, plurals, and creator name variations match accurately.
 */
function getStems(word: string): string[] {
  const w = word.toLowerCase().trim();
  if (!w) return [];
  const stems = [w];
  if (w.endsWith("ies") && w.length > 4) stems.push(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 3) stems.push(w.slice(0, -2));
  if (w.endsWith("s") && w.length > 2) stems.push(w.slice(0, -1));
  if (w.endsWith("y") && w.length > 3) stems.push(w.slice(0, -1) + "e", w.slice(0, -1));
  if (w.endsWith("ing") && w.length > 4) stems.push(w.slice(0, -3));
  if (w.endsWith("ed") && w.length > 3) stems.push(w.slice(0, -2));
  return Array.from(new Set(stems.filter((s) => s.length >= 2)));
}

/**
 * Interleave/round-robin videos across different creators so fallback or browsing
 * never shows 32 consecutive videos from the same single model.
 */
function diversifyVideos(videos: SearchVideoItem[]): SearchVideoItem[] {
  const modelBuckets = new Map<string, SearchVideoItem[]>();
  for (const v of videos) {
    const slug = v.model.slug;
    if (!modelBuckets.has(slug)) {
      modelBuckets.set(slug, []);
    }
    modelBuckets.get(slug)!.push(v);
  }

  const result: SearchVideoItem[] = [];
  let added = true;
  let round = 0;
  while (added) {
    added = false;
    for (const bucket of modelBuckets.values()) {
      if (round < bucket.length) {
        result.push(bucket[round]);
        added = true;
      }
    }
    round++;
  }
  return result;
}

export async function searchVideos(
  rawQuery: string = "",
  page: number = 1,
  limit: number = 32,
): Promise<SearchResultResponse> {
  await connectDB();

  const query = (rawQuery || "").trim();
  const currentPage = Math.max(1, page);
  const pageSize = Math.max(1, Math.min(64, limit));

  // Fetch all published models and their video media items
  const models = await Model.find(
    { status: "published" },
    {
      name: 1,
      slug: 1,
      profileImage: 1,
      coverImage: 1,
      category: 1,
      tags: 1,
      metaKeywords: 1,
      media: 1,
      createdAt: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  const rawTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const tokens = Array.from(new Set(rawTokens.flatMap((t) => getStems(t))));
  const fullEscaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fullRegex = query.length > 0 ? new RegExp(fullEscaped, "i") : null;

  const scoredVideos: SearchVideoItem[] = [];

  for (const model of models) {
    const modelNameLower = (model.name || "").toLowerCase();
    const modelSlugLower = (model.slug || "").toLowerCase();
    const modelTagsLower = (model.tags || []).map((t: string) => (t || "").toLowerCase());
    const modelKwsLower = (model.metaKeywords || []).map((k: string) => (k || "").toLowerCase());
    const modelCatLower = (model.category || "").toLowerCase();

    // Model-level relevance score
    let modelBaseScore = 0;
    if (query.length > 0) {
      if (fullRegex && fullRegex.test(model.name || "")) modelBaseScore += 100;
      if (fullRegex && fullRegex.test(model.slug || "")) modelBaseScore += 80;

      for (const t of tokens) {
        if (modelNameLower.includes(t)) modelBaseScore += 35;
        if (modelSlugLower.includes(t)) modelBaseScore += 25;
        if (modelCatLower.includes(t)) modelBaseScore += 15;
        if (modelTagsLower.some((tag: string) => tag.includes(t))) modelBaseScore += 15;
        if (modelKwsLower.some((kw: string) => kw.includes(t))) modelBaseScore += 10;
      }
    }

    const allMedia = Array.isArray(model.media) ? model.media : [];
    let videoIndex = 0;

    for (const item of allMedia) {
      if (item.type !== "video") continue;

      let vidScore = modelBaseScore;

      if (query.length > 0) {
        const vidTitleLower = (item.title || "").toLowerCase();
        const vidAltLower = (item.alt || "").toLowerCase();
        const rawKeywords = item.keywords;
        const vidKwsLower = Array.isArray(rawKeywords)
          ? rawKeywords.map((k: string) => (k || "").toLowerCase())
          : typeof rawKeywords === "string"
          ? (rawKeywords as string).toLowerCase().split(/[\s,]+/)
          : [];

        if (fullRegex && fullRegex.test(item.title || "")) vidScore += 60;
        if (fullRegex && fullRegex.test(item.alt || "")) vidScore += 40;

        for (const t of tokens) {
          if (vidTitleLower.includes(t)) vidScore += 15;
          if (vidAltLower.includes(t)) vidScore += 10;
          if (vidKwsLower.some((k: string) => k.includes(t))) vidScore += 10;
        }
      }

      const videoSlug = getMediaSlug(item, "video", videoIndex);
      const posterSrc =
        item.thumbnail || model.coverImage || model.profileImage || "";

      scoredVideos.push({
        id: item._id?.toString() || `${model.slug}-${videoIndex}`,
        title: item.title || `${model.name} Video #${videoIndex + 1}`,
        alt: item.alt || item.title || `${model.name} HD Video`,
        thumbnail: posterSrc,
        url: item.url || "",
        isExternal: Boolean(item.isExternal),
        order: typeof item.order === "number" ? item.order : videoIndex,
        videoSlug,
        model: {
          name: model.name,
          slug: model.slug,
          profileImage: model.profileImage || "",
          coverImage: model.coverImage || "",
          category: model.category || "",
        },
        score: vidScore,
      });

      videoIndex++;
    }
  }

  // Fetch active search tags for suggestions / quick chips
  let relatedTags: Array<{ tag: string; slug: string }> = [];
  try {
    const tagsFromDb = await SearchTag.find({ active: true })
      .select("tag slug")
      .limit(12)
      .sort({ clicks: -1, createdAt: -1 })
      .lean();
    relatedTags = tagsFromDb.map((t: any) => ({ tag: t.tag, slug: t.slug }));
  } catch {
    relatedTags = [];
  }

  // Sorting:
  // If query empty: natural display of diverse latest videos
  if (query.length === 0) {
    const diversified = diversifyVideos(scoredVideos);
    const total = diversified.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const pagedVideos = diversified.slice(startIndex, startIndex + pageSize);

    return {
      query: "",
      page: currentPage,
      limit: pageSize,
      total,
      totalPages,
      totalMatches: total,
      hasMatches: true,
      videos: pagedVideos,
      relatedTags,
    };
  }

  const matches = scoredVideos.filter((v) => v.score > 0);
  const rawFallbacks = scoredVideos.filter((v) => v.score === 0);
  const fallbacks = diversifyVideos(rawFallbacks);

  // Sort matches by highest score first, then order
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.order - b.order;
  });

  const hasMatches = matches.length > 0;
  const totalMatches = matches.length;

  // ─── Smart Guardrails: Auto-Capture Valid Search Tags for Organic SEO ───
  if (query.length >= 3 && query.length <= 60) {
    const isUrlOrSpam =
      /https?:\/\/|\.com|\.net|\.org|\.xyz|\.ru|\.cn|\.top|<|>|script|href|select\s+|union\s+|drop\s+|www\./i.test(
        query
      );
    const hasEnoughLetters = /[a-zA-Z]{2,}/.test(query);

    if (!isUrlOrSpam && hasEnoughLetters) {
      const cleanTag = query.replace(/\s+/g, " ").trim();
      const slugKey = slugify(cleanTag);

      if (slugKey && slugKey.length >= 3) {
        if (hasMatches && totalMatches > 0) {
          // Has real videos on site: auto-save to DB and include in sitemap
          SearchTag.updateOne(
            { slug: slugKey },
            {
              $setOnInsert: {
                tag: cleanTag,
                slug: slugKey,
                customTitle: "",
                customDescription: "",
                active: true,
                createdAt: new Date(),
              },
              $inc: { clicks: 1 },
              $set: { updatedAt: new Date() },
            },
            { upsert: true }
          )
            .exec()
            .catch(() => {});
        } else {
          // Zero matches: only track click if admin previously created the tag
          SearchTag.updateOne(
            { slug: slugKey },
            { $inc: { clicks: 1 }, $set: { updatedAt: new Date() } }
          )
            .exec()
            .catch(() => {});
        }
      }
    }
  }

  if (hasMatches) {
    // We have actual matches
    const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const matchedSlice = matches.slice(startIndex, startIndex + pageSize);

    // If on current page we have fewer than pageSize items, fill remaining slots with diverse trending fallbacks
    let finalVideos = [...matchedSlice];
    if (finalVideos.length < pageSize) {
      const needed = pageSize - finalVideos.length;
      const matchedIds = new Set(matches.map((m) => m.id));
      const availableFallbacks = fallbacks
        .filter((f) => !matchedIds.has(f.id))
        .map((f) => ({ ...f, isFallback: true }));

      const filler = availableFallbacks.slice(0, needed);
      finalVideos = [...finalVideos, ...filler];
    }

    return {
      query,
      page: currentPage,
      limit: pageSize,
      total: totalMatches,
      totalPages,
      totalMatches,
      hasMatches: true,
      videos: finalVideos,
      relatedTags,
    };
  } else {
    // 0 matches found! Diversify fallback videos across creators so every row features different models
    const total = fallbacks.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const pagedFallbacks = fallbacks
      .slice(startIndex, startIndex + pageSize)
      .map((v) => ({ ...v, isFallback: true }));

    return {
      query,
      page: currentPage,
      limit: pageSize,
      total,
      totalPages,
      totalMatches: 0,
      hasMatches: false,
      videos: pagedFallbacks,
      relatedTags,
    };
  }
}
