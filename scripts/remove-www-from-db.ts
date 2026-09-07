import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let value = trimmed.substring(eqIdx + 1).trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

function cleanString(val: string): { changed: boolean; result: string } {
  if (typeof val !== "string") return { changed: false, result: val };
  let result = val;
  let changed = false;

  // Replace https://www.vixn.fun with https://vixn.fun
  if (result.includes("https://www.vixn.fun")) {
    result = result.replaceAll("https://www.vixn.fun", "https://vixn.fun");
    changed = true;
  }
  // Replace http://www.vixn.fun with https://vixn.fun
  if (result.includes("http://www.vixn.fun")) {
    result = result.replaceAll("http://www.vixn.fun", "https://vixn.fun");
    changed = true;
  }
  // Replace www.vixn.fun with vixn.fun
  if (result.includes("www.vixn.fun")) {
    result = result.replaceAll("www.vixn.fun", "vixn.fun");
    changed = true;
  }

  return { changed, result };
}

function cleanObject(obj: any): { changed: boolean; result: any } {
  if (obj === null || obj === undefined) return { changed: false, result: obj };

  if (typeof obj === "string") {
    return cleanString(obj);
  }

  if (Array.isArray(obj)) {
    let arrayChanged = false;
    const newArr = obj.map((item) => {
      const { changed, result } = cleanObject(item);
      if (changed) arrayChanged = true;
      return result;
    });
    return { changed: arrayChanged, result: newArr };
  }

  if (typeof obj === "object" && !(obj instanceof mongoose.Types.ObjectId) && !(obj instanceof Date)) {
    let objChanged = false;
    const newObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const { changed, result } = cleanObject(obj[key]);
      if (changed) objChanged = true;
      newObj[key] = result;
    }
    return { changed: objChanged, result: newObj };
  }

  return { changed: false, result: obj };
}

async function run() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not found in env.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.\n");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("No db handle.");
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections:`, collections.map((c) => c.name).join(", "), "\n");

  let totalUpdatedDocs = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith("system.")) continue;

    const collection = db.collection(colName);
    const docs = await collection.find({}).toArray();

    let colUpdated = 0;
    for (const doc of docs) {
      const { _id, ...rest } = doc;
      const { changed, result } = cleanObject(rest);

      if (changed) {
        await collection.replaceOne({ _id }, { _id, ...result });
        colUpdated++;
        totalUpdatedDocs++;
      }
    }

    if (colUpdated > 0) {
      console.log(`[${colName}] Updated ${colUpdated} documents containing www.vixn.fun.`);
    } else {
      console.log(`[${colName}] Clean — 0 documents needed updates (${docs.length} scanned).`);
    }
  }

  console.log(`\nMigration completed! Total documents updated across database: ${totalUpdatedDocs}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
