/**
 * Automated SEO Indexing & Crawl Pipeline
 *
 * 1. Google Indexing API: Instant real-time crawl dispatch (requires GOOGLE_CLIENT_EMAIL & GOOGLE_PRIVATE_KEY)
 * 2. IndexNow Protocol: Instant push to Bing, Yandex, Naver, Seznam (requires INDEXNOW_KEY)
 * 3. Google Sitemap Ping: Direct ping notification to search engine crawler
 */

import { google } from "googleapis";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "ed7c125f718315b5b4d997c99aed3a75";

// ── Google Indexing API ─────────────────────────────────────────────
export async function notifyGoogleIndex(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ success: boolean; data?: any; error?: string }> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return {
      success: false,
      error: "Google Service Account not configured (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY missing)",
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const indexing = google.indexing({ version: "v3", auth });
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    console.log(`[Google Indexing API] Success for ${url}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Google Indexing API] Error for ${url}:`, msg);
    return { success: false, error: msg };
  }
}

// ── IndexNow Protocol (Bing / Yandex / Naver / Seznam) ───────────────
export async function notifyIndexNow(urls: string[]): Promise<{
  success: boolean;
  status?: number;
  error?: string;
}> {
  if (!INDEXNOW_KEY || urls.length === 0) {
    return { success: false, error: "IndexNow key not configured or no URLs" };
  }

  try {
    // Derive host from the first URL to ensure host matches urlList perfectly (www vs non-www)
    const firstUrl = urls[0];
    const host = firstUrl ? new URL(firstUrl).host : new URL(SITE_URL).host;

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000), // IndexNow batch limit
      }),
    });

    console.log(
      `[IndexNow] Submitted ${urls.length} URLs to IndexNow (host: ${host}) — status: ${response.status}`
    );
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[IndexNow] Error:", msg);
    return { success: false, error: msg };
  }
}

// ── Google Sitemap Ping ─────────────────────────────────────────────
export async function pingGoogleSitemap(): Promise<{
  success: boolean;
  status?: number;
  error?: string;
}> {
  try {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    const response = await fetch(pingUrl, { method: "GET" });

    console.log(
      `[Google Sitemap Ping] Pinged ${sitemapUrl} — status: ${response.status}`
    );
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Google Sitemap Ping] Error:", msg);
    return { success: false, error: msg };
  }
}

// ── Unified Automated Indexing Trigger ──────────────────────────────
export async function autoIndexUrls(urls: string[]): Promise<{
  google: { attempted: number; succeeded: number };
  indexNow: { success: boolean; status?: number; error?: string };
  googlePing: { success: boolean; status?: number; error?: string };
}> {
  if (!urls || urls.length === 0) {
    return {
      google: { attempted: 0, succeeded: 0 },
      indexNow: { success: false, error: "No URLs provided" },
      googlePing: { success: false, error: "No URLs provided" },
    };
  }

  // Google Indexing API for each unique URL (up to 200/day limit)
  const googleResults = await Promise.allSettled(
    urls.slice(0, 100).map((url) => notifyGoogleIndex(url, "URL_UPDATED"))
  );
  const googleSucceeded = googleResults.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  // IndexNow batch + Sitemap ping
  const [indexNowRes, pingRes] = await Promise.allSettled([
    notifyIndexNow(urls),
    pingGoogleSitemap(),
  ]);

  return {
    google: {
      attempted: Math.min(urls.length, 100),
      succeeded: googleSucceeded,
    },
    indexNow:
      indexNowRes.status === "fulfilled"
        ? indexNowRes.value
        : { success: false, error: String(indexNowRes.reason) },
    googlePing:
      pingRes.status === "fulfilled"
        ? pingRes.value
        : { success: false, error: String(pingRes.reason) },
  };
}

export const triggerIndexingPipeline = autoIndexUrls;

// ── Helper: build all affected URLs for a model ──────────────────────
export function buildModelAffectedUrls(
  slug: string,
  tags: string[] = [],
  mediaSlugs: { type: "photo" | "video"; slug: string }[] = []
): string[] {
  const urls = [
    `${SITE_URL}/model/${slug}`,
    `${SITE_URL}/model/${slug}/videos`,
    `${SITE_URL}/model/${slug}/photos`,
  ];

  // Add individual media URLs
  mediaSlugs.forEach((m) => {
    urls.push(`${SITE_URL}/model/${slug}/${m.type}/${m.slug}`);
  });

  // Add associated tag hub URLs
  tags.forEach((t) => {
    if (!t) return;
    const cleanTag = t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "").trim();
    if (cleanTag) {
      urls.push(`${SITE_URL}/tag/${cleanTag}`);
    }
  });

  return Array.from(new Set(urls));
}
