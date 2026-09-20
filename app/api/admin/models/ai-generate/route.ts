import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";
import { slugify } from "@/lib/seo";

/**
 * POST /api/admin/models/ai-generate
 *
 * Takes unstructured raw text describing a model/creator and uses an LLM to
 * accurately extract and structure all text fields across the 4 tabs:
 *   1. General Info (name, slug, country, category, bio, aboutContent, tags)
 *   2. Main SEO & Tags (metaTitle, metaDescription, metaKeywords, focusKeyphrase, ogTitle, ogDescription)
 *   3. Photos Page SEO (heading, metaTitle, metaDescription, metaKeywords, introText)
 *   4. Videos Page SEO (heading, metaTitle, metaDescription, metaKeywords)
 *
 * NOTE: Images (profileImage, coverImage) and media arrays are explicitly omitted per requirements.
 * Character limits are strictly enforced on the LLM output:
 *   - meta titles / og titles: max 60 chars (without site suffix)
 *   - meta descriptions: max 155 chars
 *   - headings: max 80 chars
 */

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rawText, saveDirectly } = body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide detailed unstructured text (at least 15 characters)" },
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

    // Clean and truncate raw text to 10k chars to keep LLM token load very low
    const inputContent = rawText.trim().slice(0, 10000);

    const systemPrompt = `You are a high-performance data extraction and SEO structuring engine.
Given unstructured text about a model/creator, extract and structure all information into the EXACT JSON schema below.
Follow these rules strictly:
1. "name": Model's canonical stage/real name.
2. "slug": Clean URL slug (e.g. "shilpa-sethi"). Only lowercase letters, numbers, and hyphens.
3. "country": Country or origin if mentioned, else empty string.
4. "category": Primary niche/category (e.g. "Glamour", "Fitness", "OnlyFans Creator", "Bikini Model").
5. "bio": Detailed biographical summary (2-4 paragraphs if information is available).
6. "aboutContent": In-depth editorial article about the model (career highlights, background, fan following).
7. "tags": Array of 5 to 15 relevant tags (lowercase, concise).
8. "metaTitle": SEO title for model page. STRICT LIMIT: MAX 60 CHARACTERS. Do NOT include "| VIXN" or site names.
9. "metaDescription": Engaging SEO summary. STRICT LIMIT: MAX 155 CHARACTERS.
10. "metaKeywords": Array of 5 to 12 main SEO keywords.
11. "focusKeyphrase": Main 2-4 word target keyphrase (e.g. "shilpa sethi hd videos").
12. "ogTitle": Social share title. MAX 60 CHARACTERS.
13. "ogDescription": Social share description. MAX 155 CHARACTERS.
14. "photosSeo":
    - "heading": H1 heading for photos page (e.g. "Shilpa Sethi HD Photos & Exclusive Pictures"). MAX 80 CHARACTERS.
    - "metaTitle": MAX 60 CHARACTERS. Do NOT include site name.
    - "metaDescription": MAX 155 CHARACTERS.
    - "metaKeywords": Array of 4 to 8 photo-specific keywords.
    - "introText": 1-2 descriptive paragraphs introducing the photo collection.
15. "videosSeo":
    - "heading": H1 heading for videos page (e.g. "Shilpa Sethi 4K Videos & Stream Clips"). MAX 80 CHARACTERS.
    - "metaTitle": MAX 60 CHARACTERS. Do NOT include site name.
    - "metaDescription": MAX 155 CHARACTERS.
    - "metaKeywords": Array of 4 to 8 video-specific keywords.

CRITICAL: Return ONLY a valid JSON object matching the schema. No markdown formatting, no code fences.`;

    const candidateModels = [
      process.env.GROQ_MODEL,
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
    ].filter(Boolean) as string[];

    let structuredData: any = null;
    let lastError = "";

    for (const modelName of candidateModels) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Unstructured Content:\n${inputContent}` },
            ],
            temperature: 0.1,
            max_tokens: 4096,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`Groq model ${modelName} error (${res.status}):`, errText);
          lastError = `Groq HTTP ${res.status}`;
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

        structuredData = JSON.parse(cleanJson);
        if (structuredData && (structuredData.name || structuredData.slug)) {
          break;
        }
      } catch (err: any) {
        lastError = err?.message || "LLM request failed";
        console.warn(`Groq model ${modelName} fetch exception:`, err);
      }
    }

    if (!structuredData || !structuredData.name) {
      return NextResponse.json(
        { error: `AI could not extract model data: ${lastError || "unknown error"}` },
        { status: 502 }
      );
    }

    // Backend Sanitization & Hard Limits Enforcer
    const stripSuffix = (t: string) =>
      (t || "")
        .replace(
          /(?:\s*(?:[|\-–—:]|\bon\b)\s*(?:vixn(?:\.fun)?|VIXN(?:\.FUN)?))+\s*$/i,
          ""
        )
        .trim();

    const name = (structuredData.name || "Unnamed Model").trim();
    const rawSlug = structuredData.slug ? slugify(structuredData.slug) : slugify(name);
    const slug = rawSlug || `model-${Date.now()}`;

    const metaTitle = stripSuffix(structuredData.metaTitle || `${name} - Photos & Videos`).slice(0, 60);
    const metaDescription = (
      structuredData.metaDescription ||
      `Explore ${name}'s exclusive photo gallery and video collection on VIXN.`
    )
      .trim()
      .slice(0, 155);

    const ogTitle = stripSuffix(structuredData.ogTitle || metaTitle).slice(0, 60);
    const ogDescription = (structuredData.ogDescription || metaDescription).trim().slice(0, 155);

    const tags = Array.isArray(structuredData.tags)
      ? structuredData.tags.map((t: string) => String(t).trim()).filter(Boolean)
      : [];

    const metaKeywords = Array.isArray(structuredData.metaKeywords)
      ? structuredData.metaKeywords.map((k: string) => String(k).trim()).filter(Boolean)
      : [];

    // Sub-pages SEO
    const photosHeading = (structuredData.photosSeo?.heading || `${name} Photo Sets & HD Gallery`).trim().slice(0, 80);
    const photosMetaTitle = stripSuffix(structuredData.photosSeo?.metaTitle || `${name} Photos, HD Galleries`).slice(0, 60);
    const photosMetaDescription = (
      structuredData.photosSeo?.metaDescription ||
      `Browse all exclusive high-definition photoshoot pictures of ${name}.`
    )
      .trim()
      .slice(0, 155);
    const photosMetaKeywords = Array.isArray(structuredData.photosSeo?.metaKeywords)
      ? structuredData.photosSeo.metaKeywords.map((k: string) => String(k).trim()).filter(Boolean)
      : [];
    const photosIntroText = (structuredData.photosSeo?.introText || "").trim();

    const videosHeading = (structuredData.videosSeo?.heading || `${name} Video Showcase & 4K Clips`).trim().slice(0, 80);
    const videosMetaTitle = stripSuffix(structuredData.videosSeo?.metaTitle || `${name} Videos, HD Clips & Streams`).slice(0, 60);
    const videosMetaDescription = (
      structuredData.videosSeo?.metaDescription ||
      `Watch high-definition streaming video clips and reels of ${name}.`
    )
      .trim()
      .slice(0, 155);
    const videosMetaKeywords = Array.isArray(structuredData.videosSeo?.metaKeywords)
      ? structuredData.videosSeo.metaKeywords.map((k: string) => String(k).trim()).filter(Boolean)
      : [];

    const finalStructuredPayload = {
      name,
      slug,
      country: (structuredData.country || "").trim(),
      category: (structuredData.category || "Adult Model").trim(),
      bio: (structuredData.bio || "").trim(),
      aboutContent: (structuredData.aboutContent || "").trim(),
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      focusKeyphrase: (structuredData.focusKeyphrase || `${name.toLowerCase()} photos`).trim(),
      canonicalUrl: "",
      robotsDirective: "index, follow",
      ogTitle,
      ogDescription,
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      photosSeo: {
        heading: photosHeading,
        metaTitle: photosMetaTitle,
        metaDescription: photosMetaDescription,
        metaKeywords: photosMetaKeywords,
        introText: photosIntroText,
      },
      videosSeo: {
        heading: videosHeading,
        metaTitle: videosMetaTitle,
        metaDescription: videosMetaDescription,
        metaKeywords: videosMetaKeywords,
      },
      status: "draft" as const,
      cornerstone: false,
    };

    // If requested to save directly into database and create the model route:
    if (saveDirectly) {
      await connectDB();

      // Ensure unique slug
      let finalSlug = slug;
      let counter = 1;
      while (await Model.findOne({ slug: finalSlug })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      finalStructuredPayload.slug = finalSlug;

      const created = await Model.create({
        ...finalStructuredPayload,
        media: [],
        profileImage: "",
        coverImage: "",
      });

      return NextResponse.json(
        {
          success: true,
          created: true,
          model: created,
        },
        { status: 201 }
      );
    }

    // Otherwise return structured data for preview/review before creation
    return NextResponse.json({
      success: true,
      created: false,
      data: finalStructuredPayload,
    });
  } catch (error: any) {
    console.error("POST /api/admin/models/ai-generate error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during AI generation" },
      { status: 500 }
    );
  }
}
