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
    const { url, html: pastedHtml, sourceUrl } = body;

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

    // ── Step 2: Universal Heuristic Pre-Extraction across entire document ──
    const preExtracted = extractUniversalMedia(rawHtml, resolvedSourceUrl);

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
            apiKey
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
      finalItems = await fallbackLlmExtraction(rawHtml, resolvedSourceUrl, apiKey);
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
        type: item.type === "photo" ? ("photo" as const) : ("video" as const),
        url: item.url.trim(),
        thumbnail: item.thumbnail?.trim() || "",
        title: item.title?.trim() || "Untitled Media",
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
  apiKey: string
): Promise<ExtractedMediaItem[]> {
  const candidateModels = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter(Boolean) as string[];

  const minimalCandidates = batch.map((item, idx) => ({
    id: idx,
    type: item.type,
    url: item.url,
    thumbnail: item.thumbnail || "",
    rawTitle: item.title || "",
  }));

  const prompt = `You are an expert adult media curator and SEO specialist.
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
          type: item.type === "photo" ? "photo" : "video",
          url: String(item.url || "").trim(),
          thumbnail: item.thumbnail ? String(item.thumbnail).trim() : "",
          title: item.title ? String(item.title).trim() : "Media Item",
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
