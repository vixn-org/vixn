/**
 * bulk-backlinks-telegraph.js
 * Generates bulk high-authority (DR 91) parasite articles on Telegraph (telegra.ph)
 * with contextual backlinks pointing to https://vixn.fun root domain and model hubs.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Load .env.local manually without external dependencies
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://akarshrajput01_db_user:cNcbH9btRGynVZF0@cluster0.gggdgbp.mongodb.net/vixn?retryWrites=true&w=majority&appName=Cluster0";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

function requestPromise(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: body });
        }
      });
    });
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// 1. Create an anonymous Telegraph account token
async function createTelegraphAccount() {
  const payload = JSON.stringify({
    short_name: "VIXN_Media",
    author_name: "VIXN Premium Gallery",
    author_url: SITE_URL,
  });

  const res = await requestPromise(
    {
      hostname: "api.telegra.ph",
      path: "/createAccount",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    payload
  );

  if (res.ok) {
    return res.result.access_token;
  }
  throw new Error("Failed to create Telegraph account: " + JSON.stringify(res));
}

// 2. Publish an article with backlinks to vixn.fun
async function publishArticle(token, title, contentNodes) {
  const payload = JSON.stringify({
    access_token: token,
    title: title.slice(0, 250),
    author_name: "VIXN Model Gallery",
    author_url: SITE_URL,
    content: contentNodes,
    return_content: false,
  });

  const res = await requestPromise(
    {
      hostname: "api.telegra.ph",
      path: "/createPage",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    payload
  );

  if (res.ok) {
    return `https://telegra.ph/${res.result.path}`;
  }
  console.error("Publish error:", res.error);
  return null;
}

// 3. Main execution loop
async function run() {
  console.log("====================================================");
  console.log("  VIXN DR 91 BULK BACKLINK GENERATOR (TELEGRAPH)");
  console.log("====================================================");
  console.log("Connecting to database...");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  const Model = mongoose.connection.collection("models");
  const models = await Model.find({ status: "published" })
    .project({ name: 1, slug: 1, tags: 1, country: 1, media: 1, description: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  const outputPath = path.resolve(__dirname, "../vixn_telegraph_backlinks.json");
  let existingBacklinks = [];
  if (fs.existsSync(outputPath)) {
    try {
      existingBacklinks = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    } catch {
      existingBacklinks = [];
    }
  }

  const existingSlugs = new Set(existingBacklinks.map((b) => b.slug));
  const newModels = models.filter((m) => !existingSlugs.has(m.slug));

  console.log(`Found ${models.length} total published models (${existingBacklinks.length} already have backlinks).`);
  console.log(`New models to process: ${newModels.length}`);

  if (newModels.length === 0) {
    console.log("All published models already have live Telegraph backlinks! Nothing new to process.");
    process.exit(0);
  }

  const token = await createTelegraphAccount();
  console.log("Telegraph API Token Acquired successfully.");

  const createdBacklinks = [...existingBacklinks];

  for (let i = 0; i < newModels.length; i++) {
    const model = newModels[i];
    const modelUrl = `${SITE_URL}/model/${model.slug}`;
    const searchUrl = `${SITE_URL}/search?q=${encodeURIComponent(model.name)}`;
    const homeUrl = SITE_URL;

    const tagsText = (model.tags && model.tags.length > 0)
      ? model.tags.slice(0, 6).join(", ")
      : "nude photos, 4K XXX videos, OnlyFans leaks, curvy models";

    // Dynamic, high-intent title for search bots
    const articleTitle = `${model.name} Nude Photos, 4K XXX Videos & Leaks Gallery - VIXN`;

    const content = [
      {
        tag: "p",
        children: [
          `Discover the official exclusive gallery of `,
          { tag: "strong", children: [model.name] },
          `. Watch free HD and 4K streaming adult videos, high-resolution nude photos, and full photo sets without any subscription fees or sign-ups on `,
          { tag: "a", attrs: { href: homeUrl }, children: ["VIXN (vixn.fun)"] },
          `.`,
        ],
      },
      {
        tag: "h3",
        children: [`Watch ${model.name} Full Nude Leaks & 4K Streaming Clips`],
      },
      {
        tag: "p",
        children: [
          `You can stream verified uncensored content, OnlyFans archives, and leaked gallery shoots directly on `,
          {
            tag: "a",
            attrs: { href: modelUrl },
            children: [`${model.name} Official Portfolio on VIXN`],
          },
          `. All galleries are delivered in ultra-fast 60FPS CDN streaming speed.`,
        ],
      },
      {
        tag: "p",
        children: [
          `Explore related trending pornstars, desi Indian creators, and VIP models in 4K resolution at `,
          {
            tag: "a",
            attrs: { href: searchUrl },
            children: [`Search ${model.name} 4K Videos`],
          },
          ` or browse the comprehensive `,
          {
            tag: "a",
            attrs: { href: `${SITE_URL}/models` },
            children: ["All Adult Models Directory"],
          },
          `.`,
        ],
      },
      {
        tag: "h4",
        children: ["About VIXN Free Model Streaming"],
      },
      {
        tag: "p",
        children: [
          `VIXN is a 100% free adult entertainment hub hosting high-definition photo sets and XXX video streaming from top creators. Learn more on the `,
          {
            tag: "a",
            attrs: { href: `${SITE_URL}/about` },
            children: ["About VIXN Platform Hub"],
          },
          ` or check the `,
          {
            tag: "a",
            attrs: { href: `${SITE_URL}/faq` },
            children: ["Frequently Asked Questions"],
          },
          `.`,
        ],
      },
      {
        tag: "p",
        children: [
          `Categories: ${tagsText}`,
        ],
      },
    ];

    const liveUrl = await publishArticle(token, articleTitle, content);
    if (liveUrl) {
      console.log(`[${i + 1}/${models.length}] Backlink created: ${liveUrl}`);
      createdBacklinks.push({
        model: model.name,
        slug: model.slug,
        backlink: liveUrl,
        target: modelUrl,
      });
    }

    // Delay between publishes to prevent API throttling
    await new Promise((r) => setTimeout(r, 1200));
  }

  const outputPath = path.resolve(__dirname, "../vixn_telegraph_backlinks.json");
  fs.writeFileSync(outputPath, JSON.stringify(createdBacklinks, null, 2));

  console.log("\n====================================================");
  console.log(`SUCCESS! Generated ${createdBacklinks.length} live DR 91 backlinks.`);
  console.log(`Saved live URLs to: ${outputPath}`);
  console.log("====================================================");

  process.exit(0);
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
