import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/admin/crawl-media
 *
 * Universal Media Extraction Pipeline:
 * 1. Pre-extracts ALL media items from HTML using structural heuristics (JSON-LD,
 *    media cards, thumbnail patterns, video links) across the entire document.
 * 2. Token-optimizes by sending compact structured candidate batches to Groq LLM
 *    (openai/gpt-oss-120b / openai/gpt-oss-20b) to refine titles, generate SEO titles,
 *    and generate SEO keywords without wasting tokens on raw HTML.
 * 3. Works universally across 100s of different websites without hardcoded site rules.
 */

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, html: pastedHtml, sourceUrl, mediaType, strategy, modelName } = body;
    const isPhotoTarget = mediaType === "photo";

    if (
      (!url || typeof url !== "string") &&
      (!pastedHtml || typeof pastedHtml !== "string")
    ) {
      return NextResponse.json(
        { error: "Either a URL to crawl or pasted HTML is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in environment variables" },
        { status: 500 }
      );
    }

    // ── Step 1: Obtain the HTML ──
    let rawHtml = "";
    let resolvedSourceUrl: string = (url || sourceUrl || "").trim();

    if (pastedHtml && pastedHtml.trim().length > 50) {
      rawHtml = pastedHtml;
      // If no sourceUrl was provided, auto-detect from canonical or og:url meta tags
      if (!resolvedSourceUrl) {
        const canonicalMatch = rawHtml.match(
          /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i
        );
        if (canonicalMatch) {
          resolvedSourceUrl = canonicalMatch[1];
        } else {
          const ogMatch = rawHtml.match(
            /<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i
          );
          if (ogMatch) resolvedSourceUrl = ogMatch[1];
        }
      }
    } else {
      // Auto-crawl mode
      const browserHeaders: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Upgrade-Insecure-Requests": "1",
      };

      try {
        let crawlRes = await fetch(url, {
          headers: browserHeaders,
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
        });

        // Retry with referer and cookie if blocked
        if (crawlRes.status === 403 || crawlRes.status === 429) {
          const parsedUrl = new URL(url);
          await new Promise((r) => setTimeout(r, 1000));
          crawlRes = await fetch(url, {
            headers: {
              ...browserHeaders,
              Referer: `${parsedUrl.origin}/`,
              Origin: parsedUrl.origin,
              Cookie: "age_verified=1; consent=1",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(15000),
          });
        }

        if (!crawlRes.ok) {
          return NextResponse.json(
            {
              error: `Failed to fetch URL (HTTP ${crawlRes.status}). The site may be blocking automated requests. Try using "Paste Source" mode instead.`,
            },
            { status: 422 }
          );
        }

        rawHtml = await crawlRes.text();
      } catch (fetchErr: any) {
        return NextResponse.json(
          {
            error:
              fetchErr?.name === "TimeoutError"
                ? 'URL request timed out (15s). Try using "Paste Source" mode instead.'
                : `Could not reach URL: ${fetchErr?.message || "Unknown error"}. Try using "Paste Source" mode instead.`,
          },
          { status: 422 }
        );
      }
    }

    if (!rawHtml || rawHtml.length < 50) {
      return NextResponse.json(
        { error: "Page content is empty or invalid" },
        { status: 422 }
      );
    }

    // ── Step 2: Extraction Strategy (Google & Social Deep Extractor vs Universal) ──
    const isGoogleSocial =
      strategy === "google_social" ||
      (isPhotoTarget &&
        (rawHtml.includes("encrypted-tbn0.gstatic.com") ||
          rawHtml.includes("AF_initDataCallback") ||
          rawHtml.includes("pbs.twimg.com") ||
          rawHtml.includes("cdninstagram.com")));

    let preExtracted: ExtractedMediaItem[] = [];
    if (isGoogleSocial) {
      preExtracted = extractGoogleAndSocialPhotos(rawHtml, resolvedSourceUrl);
      if (preExtracted.length === 0) {
        preExtracted = extractUniversalPhotos(rawHtml, resolvedSourceUrl);
      }
    } else if (isPhotoTarget) {
      preExtracted = extractUniversalPhotos(rawHtml, resolvedSourceUrl);
      if (preExtracted.length === 0) {
        preExtracted = extractGoogleAndSocialPhotos(rawHtml, resolvedSourceUrl);
      }
    } else {
      preExtracted = extractUniversalMedia(rawHtml, resolvedSourceUrl);
    }

    let finalItems: ExtractedMediaItem[] = [];

    // ── Step 3: AI Enrichment (Batched for Token Efficiency & High Volume) ──
    if (preExtracted.length > 0) {
      // Process in batches of 25 to stay token-efficient while handling dozens/hundreds of items
      const BATCH_SIZE = 25;
      const batches: ExtractedMediaItem[][] = [];
      for (let i = 0; i < preExtracted.length; i += BATCH_SIZE) {
        batches.push(preExtracted.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        try {
          const enrichedBatch = await enrichBatchWithGroq(
            batch,
            resolvedSourceUrl,
            apiKey,
            isPhotoTarget ? "photo" : "all",
            modelName
          );
          finalItems.push(...enrichedBatch);
        } catch (enrichErr) {
          console.warn("AI enrichment failed for batch, keeping pre-extracted:", enrichErr);
          // Fallback: keep pre-extracted items untouched if AI call fails
          finalItems.push(...batch);
        }
      }
    } else {
      // Fallback: if heuristic found 0 items, use LLM extraction on media-relevant HTML context
      finalItems = isPhotoTarget
        ? await fallbackLlmExtractionForPhotos(rawHtml, resolvedSourceUrl, apiKey)
        : await fallbackLlmExtraction(rawHtml, resolvedSourceUrl, apiKey);
    }

    // Clean & deduplicate final output
    const seen = new Set<string>();
    const cleanedItems = finalItems
      .filter((item) => {
        if (!item || !item.url || typeof item.url !== "string") return false;
        const normalized = item.url.trim().toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .map((item) => ({
        type: isPhotoTarget
          ? ("photo" as const)
          : item.type === "photo"
          ? ("photo" as const)
          : ("video" as const),
        url: item.url.trim(),
        thumbnail:
          item.thumbnail?.trim() || (isPhotoTarget ? item.url.trim() : ""),
        title: item.title?.trim() || (isPhotoTarget ? "Photo" : "Untitled Media"),
        seoTitle: item.seoTitle?.trim() || item.title?.trim() || "",
        keywords: item.keywords?.trim() || "",
      }));

    return NextResponse.json({
      items: cleanedItems,
      sourceUrl: resolvedSourceUrl,
      totalFound: cleanedItems.length,
    });
  } catch (error) {
    console.error("POST /api/admin/crawl-media error:", error);
    return NextResponse.json(
      { error: "Internal server error during media extraction" },
      { status: 500 }
    );
  }
}

// ── Types ──

export interface ExtractedMediaItem {
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title?: string;
  seoTitle?: string;
  keywords?: string;
}

// ── Helper: Universal Heuristic Media Extractor (Works on ANY site) ──

export function extractUniversalMedia(
  html: string,
  baseUrl: string
): ExtractedMediaItem[] {
  const items: ExtractedMediaItem[] = [];
  const seenUrls = new Set<string>();
  const seenThumbs = new Set<string>();

  function resolveUrl(urlStr: string): string {
    if (!urlStr || typeof urlStr !== "string") return "";
    let u = urlStr.trim();
    // In case of markdown formatting like [url](url)
    const md = u.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (md) u = md[2] || md[1];
    if (
      !u ||
      u.startsWith("javascript:") ||
      u.startsWith("#") ||
      u.startsWith("data:")
    ) {
      return "";
    }
    try {
      return new URL(u, baseUrl || "https://example.com").href;
    } catch {
      return u.startsWith("http") ? u : "";
    }
  }

  function cleanString(str: string): string {
    if (!str) return "";
    return str
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 1. Universal JSON-LD Structured Data Extractor (Schema.org standard across web)
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const traverse = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        const type = obj["@type"] || obj.type;
        if (
          type === "VideoObject" ||
          type === "ImageObject" ||
          type === "MediaObject"
        ) {
          const mediaUrl = resolveUrl(
            obj.contentUrl || obj.embedUrl || obj.url || ""
          );
          const thumb = resolveUrl(
            Array.isArray(obj.thumbnailUrl)
              ? obj.thumbnailUrl[0]
              : obj.thumbnailUrl || ""
          );
          const title = cleanString(obj.name || obj.description || "");
          const isVid = type !== "ImageObject";

          if (mediaUrl && !seenUrls.has(mediaUrl)) {
            seenUrls.add(mediaUrl);
            if (thumb) seenThumbs.add(thumb);
            items.push({
              type: isVid ? "video" : "photo",
              url: mediaUrl,
              thumbnail: thumb,
              title: title || (isVid ? "Video" : "Photo"),
            });
          }
        }
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === "object") traverse(obj[k]);
        }
      };
      traverse(data);
    } catch {
      // ignore JSON parse errors in script tags
    }
  }

  // 2. Universal Anchor + Media Elements Pattern
  // Matches any <a ...> ... </a>
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let anchorMatch;

  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    const attrs = anchorMatch[1];
    const inner = anchorMatch[2];

    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const fullHref = resolveUrl(hrefMatch[1]);
    if (!fullHref) continue;

    // Filter out generic navigation/utility URLs common to websites
    if (
      /\/(login|signup|register|signin|logout|terms|privacy|dmca|contact|support|help|feedback|faq|report|search|searching|tag|tags|category|categories|channel|channels|network|pornstar|pornstars|model|models|profile|user|users|join|upgrade|billing|order)\b/i.test(
        fullHref
      )
    ) {
      continue;
    }

    // Check for images inside the link or card
    const imgMatch = inner.match(/<img\b([^>]*)>/i);
    let thumb = "";
    let title = "";

    // Check title attribute on the anchor itself
    const aTitleMatch = attrs.match(/title=["']([^"']+)["']/i);
    if (aTitleMatch) title = cleanString(aTitleMatch[1]);

    if (imgMatch) {
      const imgAttrs = imgMatch[1];
      // Check lazy-loading and standard thumbnail attributes in order of popularity & quality
      const thumbCandidates = [
        imgAttrs.match(/data-original=["']([^"']+)["']/i),
        imgAttrs.match(/data-src=["']([^"']+)["']/i),
        imgAttrs.match(/data-thumb(?:nail)?=["']([^"']+)["']/i),
        imgAttrs.match(/data-preview=["']([^"']+)["']/i),
        imgAttrs.match(/data-poster=["']([^"']+)["']/i),
        imgAttrs.match(/data-webp=["']([^"']+)["']/i),
        imgAttrs.match(/data-lazy=["']([^"']+)["']/i),
        imgAttrs.match(/srcset=["']([^"'\s]+)/i),
        imgAttrs.match(/src=["']([^"']+)["']/i),
      ];

      for (const cand of thumbCandidates) {
        if (
          cand &&
          cand[1] &&
          !cand[1].startsWith("data:image/svg") &&
          !cand[1].includes("placeholder") &&
          !cand[1].includes("transparent")
        ) {
          thumb = resolveUrl(cand[1]);
          break;
        }
      }

      // If thumb is still empty, grab any src
      if (!thumb) {
        const anySrc = imgAttrs.match(/src=["']([^"']+)["']/i);
        if (anySrc && !anySrc[1].startsWith("data:")) {
          thumb = resolveUrl(anySrc[1]);
        }
      }

      const altMatch = imgAttrs.match(/alt=["']([^"']+)["']/i);
      if (!title && altMatch) title = cleanString(altMatch[1]);
      const imgTitleMatch = imgAttrs.match(/title=["']([^"']+)["']/i);
      if (!title && imgTitleMatch) title = cleanString(imgTitleMatch[1]);
    }

    // Skip tracking pixels, logos, avatars, icons
    if (
      thumb &&
      /(logo|icon|avatar|pixel|badge|banner|spacer|button|tracker)/i.test(thumb)
    ) {
      continue;
    }

    // If still no title, inspect text inside anchor
    if (!title) {
      const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (
        text.length >= 3 &&
        text.length <= 150 &&
        !/^(HD|4K|\d+:\d+|No video available|Play|Watch|Click)$/i.test(text)
      ) {
        title = cleanString(text);
      }
    }

    // Determine type: photo vs video
    const isPhotoLink =
      /\.(jpg|jpeg|png|webp)($|\?)/i.test(fullHref) ||
      /data-lightbox|gallery|photo|photos|image/i.test(attrs);

    const isVideo =
      !isPhotoLink &&
      (/\/(video|videos|watch|view|clip|movie|out)\/|\.(mp4|webm|m3u8)($|\?)/i.test(
        fullHref
      ) ||
        /\d+:\d+/.test(inner) ||
        /\b(hd|4k|1080p|720p)\b/i.test(inner) ||
        /video|tube|thumb|player|card/i.test(attrs) ||
        /video|tube|thumb|player|card/i.test(inner));

    if (thumb || isPhotoLink || isVideo) {
      // If we already saw this URL, merge extra metadata (e.g. thumbnail or better title)
      const existing = items.find((it) => it.url === fullHref);
      if (existing) {
        if (!existing.thumbnail && thumb) existing.thumbnail = thumb;
        if (
          (!existing.title ||
            existing.title === "Video" ||
            existing.title === "Photo") &&
          title
        ) {
          existing.title = title;
        }
        continue;
      }

      // Avoid using the exact same thumbnail for multiple unrelated items
      if (thumb && seenThumbs.has(thumb)) {
        continue;
      }

      seenUrls.add(fullHref);
      if (thumb) seenThumbs.add(thumb);

      items.push({
        type: isPhotoLink ? "photo" : "video",
        url: fullHref,
        thumbnail: thumb,
        title: title || (isPhotoLink ? "Photo" : "Video"),
      });
    }
  }

  return items;
}

// ── Helper: AI Batch Enrichment (Token-Optimized) ──

async function enrichBatchWithGroq(
  batch: ExtractedMediaItem[],
  sourceUrl: string,
  apiKey: string,
  mediaType: "photo" | "all" = "all",
  modelName?: string
): Promise<ExtractedMediaItem[]> {
  const isPhotoMode = mediaType === "photo";
  const candidateModels = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter(Boolean) as string[];

  const minimalCandidates = batch.map((item, idx) => ({
    id: idx,
    type: isPhotoMode ? "photo" : item.type,
    url: item.url,
    thumbnail: item.thumbnail || "",
    rawTitle: item.title || "",
  }));

  const modelContext = modelName ? `These photos feature the adult performer/model: "${modelName}". ` : "";

  const prompt = isPhotoMode
    ? `You are an expert adult media curator and SEO specialist.
${modelContext}Given this list of extracted PHOTOS/IMAGES from: ${sourceUrl || "webpage or social source"}

Candidates:
${JSON.stringify(minimalCandidates)}

For each candidate:
1. "title": Clean up or generate an appealing, high-quality title (Title Case, remove durations, resolutions like "1080p", "4K", site watermarks, random hash codes, camera file numbers like DSC001). Naturally incorporate performer name "${modelName || 'Model'}" when relevant (e.g. "${modelName || 'Model'} - Glamour Photo Shoot", "${modelName || 'Model'} - Red Lingerie Portrait").
2. "seoTitle": Create an engaging, search-optimized title tailored for photo sets (e.g. "${modelName || 'Model Name'} - Stunning High Res Photo Shoot").
3. "keywords": Generate 3 to 6 comma-separated relevant tags/keywords (e.g. "${modelName || 'model name'}, photo gallery, photoshoot, glamour, portrait, high res, hd photos").
4. "type": Must be "photo".
5. Keep the same "url" and "thumbnail".
Filter out any items that are clearly advertisements or UI graphics rather than actual photos.

Return ONLY a JSON object:
{ "items": [ { "type": "photo", "url": "...", "thumbnail": "...", "title": "...", "seoTitle": "...", "keywords": "..." } ] }`
    : `You are an expert adult media curator and SEO specialist.
Given this list of extracted media items from: ${sourceUrl || "webpage"}

Candidates:
${JSON.stringify(minimalCandidates)}

For each candidate:
1. "title": Clean up the title (Title Case, remove durations like "35:49", resolutions like "1080p", "4K", site watermarks, weird random code suffixes like "z627bp"). Preserve performer names and descriptive actions.
2. "seoTitle": Create an engaging, search-optimized title.
3. "keywords": Generate 3 to 6 comma-separated relevant tags/keywords (e.g. "performer name, category, hd, action").
4. Keep the same "url", "thumbnail", and "type".
Filter out any items that are clearly advertisements rather than actual videos or photos.

Return ONLY a JSON object:
{ "items": [ { "type": "video"|"photo", "url": "...", "thumbnail": "...", "title": "...", "seoTitle": "...", "keywords": "..." } ] }`;

  let lastError = "";

  for (const model of candidateModels) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert media curator. You ONLY output valid JSON. No explanations, no markdown fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 8192,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) {
        const text = await res.text();
        console.warn(`Groq batch model ${model} error:`, res.status, text);
        lastError = `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      let cleanJson = content.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanJson);
      const items: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
          ? parsed.items
          : Array.isArray(parsed.media)
            ? parsed.media
            : [];

      if (items.length > 0) {
        return items.map((item) => ({
          type: isPhotoMode ? "photo" : item.type === "photo" ? "photo" : "video",
          url: String(item.url || "").trim(),
          thumbnail: item.thumbnail
            ? String(item.thumbnail).trim()
            : isPhotoMode
            ? String(item.url || "").trim()
            : "",
          title: item.title ? String(item.title).trim() : isPhotoMode ? "Photo Item" : "Media Item",
          seoTitle: item.seoTitle ? String(item.seoTitle).trim() : item.title,
          keywords: item.keywords ? String(item.keywords).trim() : "",
        }));
      }
    } catch (err: any) {
      console.warn(`Groq batch with ${model} failed:`, err?.message || err);
      lastError = err?.message || "Batch failed";
    }
  }

  throw new Error(`Groq batch enrichment failed: ${lastError}`);
}

// ── Helper: Fallback LLM Extraction if heuristics found 0 items ──

async function fallbackLlmExtraction(
  html: string,
  sourceUrl: string,
  apiKey: string
): Promise<ExtractedMediaItem[]> {
  // Strip non-content tags
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Extract chunks that have images, videos, or links
  const matches =
    cleaned.match(
      /(?:<a\b[^>]*>[\s\S]*?<\/a>|<video[\s\S]*?<\/video>|<iframe[^>]*>)/gi
    ) || [];

  const mediaSnippet = matches.slice(0, 100).join("\n").substring(0, 35000);
  if (mediaSnippet.length < 20) return [];

  const prompt = `Extract all photos and videos from this HTML snippet.
Source URL: ${sourceUrl}

For each item return:
{ "type": "photo"|"video", "url": "<absolute URL>", "thumbnail": "<thumbnail URL>", "title": "<clean title>", "seoTitle": "<seo title>", "keywords": "<comma separated keywords>" }

HTML:
${mediaSnippet}

Return ONLY a JSON object: { "items": [ ... ] }`;

  const candidateModels = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert media extractor. You ONLY output valid JSON. No explanations, no markdown fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 8192,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      let cleanJson = content.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");
      }
      const parsed = JSON.parse(cleanJson);
      const items: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
          ? parsed.items
          : [];

      return items.map((i) => ({
        type: i.type === "photo" ? "photo" : "video",
        url: String(i.url || "").trim(),
        thumbnail: i.thumbnail ? String(i.thumbnail).trim() : "",
        title: i.title ? String(i.title).trim() : "Media Item",
        seoTitle: i.seoTitle ? String(i.seoTitle).trim() : i.title,
        keywords: i.keywords ? String(i.keywords).trim() : "",
      }));
    } catch {
      // try next model
    }
  }

  return [];
}

// ── Helper: Universal Heuristic Photo/Image Extractor (Dedicated for Image Galleries) ──

export function extractUniversalPhotos(
  html: string,
  baseUrl: string
): ExtractedMediaItem[] {
  const items: ExtractedMediaItem[] = [];
  const seenUrls = new Set<string>();

  function resolveUrl(urlStr: string): string {
    if (!urlStr || typeof urlStr !== "string") return "";
    let u = urlStr.trim();
    const md = u.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (md) u = md[2] || md[1];
    if (
      !u ||
      u.startsWith("javascript:") ||
      u.startsWith("#") ||
      u.startsWith("data:image/svg") ||
      u.startsWith("data:application")
    ) {
      return "";
    }
    try {
      return new URL(u, baseUrl || "https://example.com").href;
    } catch {
      return u.startsWith("http") ? u : "";
    }
  }

  function cleanString(str: string): string {
    if (!str) return "";
    return str
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseSrcsetBestUrl(srcset: string): string {
    if (!srcset) return "";
    const parts = srcset.split(",").map((s) => s.trim()).filter(Boolean);
    let bestUrl = "";
    let maxWeight = 0;
    for (const part of parts) {
      const tokens = part.split(/\s+/);
      if (!tokens[0]) continue;
      const candUrl = tokens[0];
      let weight = 1;
      if (tokens[1]) {
        const matchW = tokens[1].match(/^(\d+)w$/i);
        const matchX = tokens[1].match(/^([\d.]+)x$/i);
        if (matchW) weight = parseInt(matchW[1], 10);
        else if (matchX) weight = parseFloat(matchX[1]) * 1000;
      }
      if (weight > maxWeight) {
        maxWeight = weight;
        bestUrl = candUrl;
      }
    }
    return bestUrl ? resolveUrl(bestUrl) : "";
  }

  function isJunkImage(
    url: string,
    title?: string,
    alt?: string,
    width?: number,
    height?: number
  ): boolean {
    if (!url) return true;
    if (url.startsWith("data:image/svg") || url.startsWith("data:application")) return true;
    if (/\.svg($|\?)/i.test(url)) return true;

    if (width !== undefined && height !== undefined && width > 0 && height > 0) {
      if (width < 100 && height < 100) return true;
    }

    const text = `${url} ${title || ""} ${alt || ""}`.toLowerCase();
    if (
      /(?:avatar|site-logo|footer-logo|header-logo|favicon|pixel|spacer|tracker|tracking|badge|arrow|spinner|loader|placeholder|transparent|adsystem|ads-|\/ads\/|1x1|btn-|button-|comment-avatar|user-icon)/i.test(
        text
      )
    ) {
      return true;
    }

    if (
      /\/(login|signup|register|signin|logout|terms|privacy|dmca|contact|support|help|faq|search)\b/i.test(
        url
      )
    ) {
      return true;
    }

    return false;
  }

  function deriveTitleFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const filename = parsed.pathname.split("/").pop() || "";
      const nameWithoutExt = filename.replace(/\.[a-z0-9]+$/i, "");
      if (
        nameWithoutExt.length >= 3 &&
        !/^[0-9a-f]{20,}$/i.test(nameWithoutExt) &&
        !/^\d+$/.test(nameWithoutExt)
      ) {
        return nameWithoutExt
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
      }
    } catch {
      // ignore
    }
    return "Photo";
  }

  function addPhoto(
    photoUrl: string,
    thumbUrl: string,
    title: string,
    alt: string,
    width?: number,
    height?: number
  ) {
    const resolvedPhoto = resolveUrl(photoUrl);
    if (!resolvedPhoto) return;
    if (isJunkImage(resolvedPhoto, title, alt, width, height)) return;

    const hasImageExt = /\.(jpe?g|png|webp|avif)($|\?)/i.test(resolvedPhoto);
    const hasImageKeywords = /\/(photos?|images?|galleries?|gallery|uploads?|media|pictures?|pics?)\//i.test(
      resolvedPhoto
    );
    if (!hasImageExt && !hasImageKeywords && !resolvedPhoto.startsWith("data:image/")) {
      return;
    }

    const normKey = resolvedPhoto.toLowerCase().split("#")[0];
    if (seenUrls.has(normKey)) return;
    seenUrls.add(normKey);

    const resolvedThumb = resolveUrl(thumbUrl) || resolvedPhoto;
    const finalTitle = cleanString(title || alt || deriveTitleFromUrl(resolvedPhoto));

    items.push({
      type: "photo",
      url: resolvedPhoto,
      thumbnail: resolvedThumb,
      title: finalTitle || "Photo",
    });
  }

  // 1. JSON-LD Structured Data
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const traverse = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        const type = obj["@type"] || obj.type;
        if (
          type === "ImageObject" ||
          type === "Photograph" ||
          type === "MediaObject"
        ) {
          const mediaUrl =
            obj.contentUrl || obj.embedUrl || obj.url || "";
          const thumb =
            Array.isArray(obj.thumbnailUrl)
              ? obj.thumbnailUrl[0]
              : obj.thumbnailUrl || "";
          const title = cleanString(obj.name || obj.caption || obj.description || "");
          if (mediaUrl) addPhoto(mediaUrl, thumb, title, "");
        } else if (obj.image) {
          const imgs = Array.isArray(obj.image) ? obj.image : [obj.image];
          for (const img of imgs) {
            if (typeof img === "string") addPhoto(img, "", "", "");
            else if (img && typeof img === "object" && (img.url || img.contentUrl)) {
              addPhoto(img.url || img.contentUrl, img.thumbnailUrl || "", img.name || img.caption || "", "");
            }
          }
        }
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === "object") traverse(obj[k]);
        }
      };
      traverse(data);
    } catch {
      // ignore JSON parse errors
    }
  }

  // 2. OpenGraph & Twitter Meta tags
  const ogImgRegex =
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi;
  let ogMatch;
  while ((ogMatch = ogImgRegex.exec(html)) !== null) {
    addPhoto(ogMatch[1], "", "", "");
  }

  // 3. Anchors with Images or Direct Image Links
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let anchorMatch;
  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    const attrs = anchorMatch[1];
    const inner = anchorMatch[2];

    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    const fullHref = hrefMatch ? resolveUrl(hrefMatch[1]) : "";

    const aTitleMatch = attrs.match(/title=["']([^"']+)["']/i);
    const aTitle = aTitleMatch ? cleanString(aTitleMatch[1]) : "";

    const aHighResMatch =
      attrs.match(/data-(?:original|highres|full|large|zoom-image|src)=["']([^"']+)["']/i);
    const aHighRes = aHighResMatch ? resolveUrl(aHighResMatch[1]) : "";

    const imgMatch = inner.match(/<img\b([^>]*)>/i);
    let imgAttrs = imgMatch ? imgMatch[1] : "";
    let imgThumb = "";
    let imgAlt = "";
    let imgHighRes = "";

    if (imgAttrs) {
      const altMatch = imgAttrs.match(/alt=["']([^"']+)["']/i);
      if (altMatch) imgAlt = cleanString(altMatch[1]);

      const srcsetMatch = imgAttrs.match(/srcset=["']([^"']+)["']/i);
      const srcsetUrl = srcsetMatch ? parseSrcsetBestUrl(srcsetMatch[1]) : "";

      const highResMatch = imgAttrs.match(
        /data-(?:original|highres|full|large|zoom-image|src|image)=["']([^"']+)["']/i
      );
      if (highResMatch) imgHighRes = resolveUrl(highResMatch[1]);
      else if (srcsetUrl) imgHighRes = srcsetUrl;

      const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/i);
      if (srcMatch && !srcMatch[1].startsWith("data:")) {
        imgThumb = resolveUrl(srcMatch[1]);
      }
    }

    const title = aTitle || imgAlt;

    if (fullHref && /\.(jpe?g|png|webp|avif)($|\?)/i.test(fullHref)) {
      addPhoto(fullHref, imgThumb || fullHref, title, imgAlt);
      continue;
    }

    if (aHighRes && /\.(jpe?g|png|webp|avif)($|\?)/i.test(aHighRes)) {
      addPhoto(aHighRes, imgThumb || aHighRes, title, imgAlt);
      continue;
    }

    if (imgHighRes) {
      addPhoto(imgHighRes, imgThumb || imgHighRes, title, imgAlt);
      continue;
    } else if (imgThumb) {
      addPhoto(imgThumb, imgThumb, title, imgAlt);
      continue;
    }
  }

  // 4. Standalone and All <img> tags in the document
  const imgRegex = /<img\b([^>]*)\/?>/gi;
  let singleImgMatch;
  while ((singleImgMatch = imgRegex.exec(html)) !== null) {
    const attrs = singleImgMatch[1];

    const altMatch = attrs.match(/alt=["']([^"']+)["']/i);
    const alt = altMatch ? cleanString(altMatch[1]) : "";

    const titleMatch = attrs.match(/title=["']([^"']+)["']/i);
    const title = titleMatch ? cleanString(titleMatch[1]) : "";

    const wMatch = attrs.match(/width=["']?(\d+)["']?/i);
    const hMatch = attrs.match(/height=["']?(\d+)["']?/i);
    const width = wMatch ? parseInt(wMatch[1], 10) : undefined;
    const height = hMatch ? parseInt(hMatch[1], 10) : undefined;

    const srcsetMatch = attrs.match(/srcset=["']([^"']+)["']/i);
    const srcsetUrl = srcsetMatch ? parseSrcsetBestUrl(srcsetMatch[1]) : "";

    const highResCandidates = [
      attrs.match(/data-original=["']([^"']+)["']/i),
      attrs.match(/data-highres=["']([^"']+)["']/i),
      attrs.match(/data-full=["']([^"']+)["']/i),
      attrs.match(/data-large=["']([^"']+)["']/i),
      attrs.match(/data-zoom-image=["']([^"']+)["']/i),
      attrs.match(/data-src=["']([^"']+)["']/i),
      attrs.match(/data-lazy-src=["']([^"']+)["']/i),
      attrs.match(/data-lazy=["']([^"']+)["']/i),
    ];

    let bestPhoto = "";
    for (const cand of highResCandidates) {
      if (cand && cand[1] && !cand[1].startsWith("data:")) {
        bestPhoto = resolveUrl(cand[1]);
        break;
      }
    }

    if (!bestPhoto && srcsetUrl) bestPhoto = srcsetUrl;

    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const srcUrl = srcMatch && !srcMatch[1].startsWith("data:") ? resolveUrl(srcMatch[1]) : "";

    if (!bestPhoto) bestPhoto = srcUrl;
    if (bestPhoto) {
      addPhoto(bestPhoto, srcUrl || bestPhoto, title, alt, width, height);
    }
  }

  // 5. <source srcset="..."> inside <picture>
  const sourceRegex = /<source\b([^>]*)>/gi;
  let sourceMatch;
  while ((sourceMatch = sourceRegex.exec(html)) !== null) {
    const attrs = sourceMatch[1];
    const srcsetMatch = attrs.match(/srcset=["']([^"']+)["']/i);
    if (srcsetMatch) {
      const best = parseSrcsetBestUrl(srcsetMatch[1]);
      if (best) addPhoto(best, best, "", "");
    }
  }

  // 6. CSS Background images & data-bg
  const bgRegex =
    /(?:background(?:-image)?:\s*url\(['"]?([^'"\)]+)['"]?\)|data-bg(?:ground)?=["']([^"']+)["'])/gi;
  let bgMatch;
  while ((bgMatch = bgRegex.exec(html)) !== null) {
    const bgUrl = bgMatch[1] || bgMatch[2];
    if (bgUrl && !bgUrl.startsWith("data:")) {
      addPhoto(bgUrl, bgUrl, "", "");
    }
  }

  return items;
}

// ── Helper: Fallback LLM Extraction for Photos ──

async function fallbackLlmExtractionForPhotos(
  html: string,
  sourceUrl: string,
  apiKey: string
): Promise<ExtractedMediaItem[]> {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Pre-parse and extract ONLY clean, minimal image tags (strip all noise: classes, styles, scripts, wrappers)
  const imageSnippets: string[] = [];
  const imgMatches = cleaned.matchAll(/<img\b([^>]*)>/gi);
  for (const m of imgMatches) {
    const rawAttrs = m[1];
    const src = rawAttrs.match(/(?:data-original|data-highres|data-full|data-src|src)=["']([^"']+)["']/i);
    const alt = rawAttrs.match(/alt=["']([^"']+)["']/i);
    const title = rawAttrs.match(/title=["']([^"']+)["']/i);
    if (src && !src[1].startsWith("data:image/svg") && !src[1].includes("pixel") && !src[1].includes("tracker")) {
      imageSnippets.push(`<img src="${src[1]}"${alt ? ` alt="${alt[1]}"` : ""}${title ? ` title="${title[1]}"` : ""}>`);
    }
    if (imageSnippets.length >= 60) break;
  }

  const mediaSnippet = imageSnippets.join("\n");
  if (mediaSnippet.length < 15) return [];

  const prompt = `Extract all photos and gallery images from these pre-parsed image tags.
Source URL: ${sourceUrl}

For each photo item return:
{ "type": "photo", "url": "<direct image URL>", "thumbnail": "<thumbnail or direct image URL>", "title": "<clean photo title>", "seoTitle": "<seo title>", "keywords": "<comma separated keywords>" }

Images:
${mediaSnippet}

Return ONLY a JSON object: { "items": [ ... ] }`;

  const candidateModels = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert media extractor. You ONLY output valid JSON. No explanations, no markdown fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 8192,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      let cleanJson = content.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");
      }
      const parsed = JSON.parse(cleanJson);
      const items: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
          ? parsed.items
          : [];

      return items.map((i) => ({
        type: "photo" as const,
        url: String(i.url || "").trim(),
        thumbnail: i.thumbnail ? String(i.thumbnail).trim() : String(i.url || "").trim(),
        title: i.title ? String(i.title).trim() : "Photo Item",
        seoTitle: i.seoTitle ? String(i.seoTitle).trim() : i.title,
        keywords: i.keywords ? String(i.keywords).trim() : "",
      }));
    } catch {
      // try next model
    }
  }

  return [];
}

/**
 * Specialized Deep Extractor for Google Images, Instagram, and X.com (Twitter)
 * Raw Source / DOM / Text.
 *
 * Handles:
 * 1. Google Images AF_initDataCallback arrays [["https://original.jpg", 1080, 1920]]
 * 2. Google Images encrypted-tbn0.gstatic.com CDN cached thumbnails
 * 3. Google Images data-ou, data-tu, data-src attributes
 * 4. X.com / Twitter pbs.twimg.com/media/... with auto-upgrade to name=orig
 * 5. Instagram scontent...cdninstagram.com and display_url JSON fields
 * 6. Line-separated or space-separated lists of direct image URLs
 */
export function extractGoogleAndSocialPhotos(
  rawContent: string,
  baseUrl: string = ""
): ExtractedMediaItem[] {
  const items: ExtractedMediaItem[] = [];
  const seenUrls = new Set<string>();

  if (!rawContent || typeof rawContent !== "string") return items;

  // Unescape common JSON and HTML entities found in Google / Social script blobs
  // e.g. "https:\/\/encrypted-tbn0..." -> "https://encrypted-tbn0..."
  // "\u003d" -> "=", "\u0026" -> "&", "\u002F" -> "/"
  const cleanContent = rawContent
    .replace(/\\\/|\\u002f|\\u002F/g, "/")
    .replace(/\\u0026/g, "&")
    .replace(/\\u003d/g, "=")
    .replace(/&amp;/g, "&");

  function addCandidate(url: string, thumbUrl?: string, rawTitle?: string) {
    if (!url || typeof url !== "string") return;
    const cleanUrl = url.trim();

    // Ignore tiny base64 1x1 gifs or SVGs
    if (
      cleanUrl.startsWith("data:image/gif") ||
      cleanUrl.startsWith("data:image/svg") ||
      cleanUrl.startsWith("data:application")
    ) {
      return;
    }

    // Filter out common UI icons, search engine graphics, logos, trackers
    const lower = cleanUrl.toLowerCase();
    if (
      lower.includes("googlelogo") ||
      lower.includes("nav_logo") ||
      lower.includes("favicon") ||
      lower.includes("cleardot.gif") ||
      lower.includes("1x1") ||
      lower.includes("spacer.gif") ||
      lower.includes("avatar_default") ||
      lower.includes("tia.png") ||
      lower.includes("/adsystem/") ||
      lower.includes("/ads-")
    ) {
      return;
    }

    // Must be valid HTTP(S) or data:image/jpeg
    if (
      !cleanUrl.startsWith("http://") &&
      !cleanUrl.startsWith("https://") &&
      !cleanUrl.startsWith("data:image/jpeg")
    ) {
      return;
    }

    // Normalize URL key for deduplication
    const normKey = cleanUrl.split("#")[0].split("&token=")[0].toLowerCase();
    if (seenUrls.has(normKey)) return;
    seenUrls.add(normKey);

    const finalThumb =
      thumbUrl && thumbUrl.startsWith("http") ? thumbUrl.trim() : cleanUrl;

    items.push({
      type: "photo",
      url: cleanUrl,
      thumbnail: finalThumb,
      title: rawTitle?.trim() || "Model Photo",
    });
  }

  // ── 1. Google Images AF_initDataCallback High-Res Source Pairs ──
  // Matches: ["https://example.com/original.jpg", 1080, 1920]
  const googlePairRegex =
    /\["(https?:\/\/[^"\\,]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"\\]*)?)",\s*(\d+),\s*(\d+)\]/gi;
  let gPairMatch;
  while ((gPairMatch = googlePairRegex.exec(cleanContent)) !== null) {
    const fullUrl = gPairMatch[1];
    const width = parseInt(gPairMatch[2], 10);
    const height = parseInt(gPairMatch[3], 10);

    // Skip tiny icons
    if (width > 0 && height > 0 && (width < 120 || height < 120)) {
      continue;
    }

    addCandidate(fullUrl, fullUrl, "Google High-Res Photo");
  }

  // Matches: [null, "https://...", ...]
  const googleJsonMatchRegex =
    /\[null,\s*"(https?:\/\/[^"\\,]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"\\]*)?)"/gi;
  let gJsonMatch;
  while ((gJsonMatch = googleJsonMatchRegex.exec(cleanContent)) !== null) {
    addCandidate(gJsonMatch[1], gJsonMatch[1], "Google Images Photo");
  }

  // Matches Google data attributes (data-ou = original url, data-tu = thumbnail)
  const googleDataOuRegex = /data-ou=["'](https?:\/\/[^"']+)["']/gi;
  let gOuMatch;
  while ((gOuMatch = googleDataOuRegex.exec(cleanContent)) !== null) {
    addCandidate(gOuMatch[1], gOuMatch[1], "Google Photo");
  }

  // ── 2. Google encrypted-tbn0.gstatic.com CDN Cached Images ──
  // These are Google's cached images: 100% reliable, zero CORS/hotlink block
  const googleTbnRegex =
    /(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[A-Za-z0-9_\-:]+)/gi;
  let gTbnMatch;
  while ((gTbnMatch = googleTbnRegex.exec(cleanContent)) !== null) {
    addCandidate(gTbnMatch[1], gTbnMatch[1], "Google Cached Image");
  }

  // ── 3. X.com / Twitter pbs.twimg.com/media Extraction ──
  // Auto-upgrades to name=orig for camera-master resolution
  const twitterMediaRegex =
    /https?:\/\/pbs\.twimg\.com\/media\/([A-Za-z0-9_-]+)(?:\?format=([a-z]+)&name=([a-z0-9_]+)|\.([a-z]+))?/gi;
  let twMatch;
  while ((twMatch = twitterMediaRegex.exec(cleanContent)) !== null) {
    const mediaId = twMatch[1];
    const format = twMatch[2] || twMatch[4] || "jpg";
    const fullResUrl = `https://pbs.twimg.com/media/${mediaId}?format=${format}&name=orig`;
    const thumbUrl = `https://pbs.twimg.com/media/${mediaId}?format=${format}&name=small`;
    addCandidate(fullResUrl, thumbUrl, "X (Twitter) Photo");
  }

  // ── 4. Instagram cdninstagram.com Extraction ──
  const instaRegex =
    /(https?:\/\/[a-z0-9\.\-]+cdninstagram\.com\/[^\s"'<>\\]+)/gi;
  let instaMatch;
  while ((instaMatch = instaRegex.exec(cleanContent)) !== null) {
    let instaUrl = instaMatch[1].replace(/[",;)\\]+$/, "");
    if (!instaUrl.includes("/s150x150/") && !instaUrl.includes("/s320x320/")) {
      addCandidate(instaUrl, instaUrl, "Instagram Photo");
    }
  }

  // Instagram JSON display_url
  const instaDisplayRegex = /"display_url"\s*:\s*"(https?:\/\/[^"\\]+)"/gi;
  let instaDispMatch;
  while ((instaDispMatch = instaDisplayRegex.exec(cleanContent)) !== null) {
    addCandidate(instaDispMatch[1], instaDispMatch[1], "Instagram Photo");
  }

  // ── 5. Direct Bulk Image URLs (Pasted line-by-line or space-separated) ──
  const directUrlRegex =
    /(https?:\/\/[^\s"']+\.(?:jpe?g|png|webp|avif)(?:\?[^\s"']*)?)/gi;
  let directMatch;
  while ((directMatch = directUrlRegex.exec(cleanContent)) !== null) {
    addCandidate(directMatch[1], directMatch[1], "Direct Image Link");
  }

  return items;
}

