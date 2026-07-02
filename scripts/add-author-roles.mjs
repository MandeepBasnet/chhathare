// Adds author self-service support (idempotent):
//   • authors.userId   — links an author record to an Appwrite login account
//   • books.status      — draft | published (public site shows only published)
// Run once after pulling this change.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { Client, Databases, DatabasesIndexType as IndexType, Query } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chhathare-sahitya";

const _w = console.warn.bind(console);
console.warn = (...a) => (String(a[0] || "").includes("SDK is built for Appwrite") ? undefined : _w(...a));

const db = new Databases(new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY));

async function ensure(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    const msg = e?.response?.message || e?.message || String(e);
    if (/already exists/i.test(msg)) console.log(`= ${name} (exists)`);
    else throw e;
  }
}

async function waitFor(collection, keys) {
  const start = Date.now();
  while (Date.now() - start < 60000) {
    const res = await db.listAttributes(DB, collection, [Query.limit(500)]);
    const byKey = new Map(res.attributes.map((a) => [a.key, a.status]));
    if (keys.every((k) => byKey.get(k) === "available")) return;
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error("timeout waiting for " + keys.join(","));
}

async function main() {
  await ensure("attr authors.userId", () =>
    db.createStringAttribute(DB, "authors", "userId", 64, false, null, false),
  );
  await ensure("attr books.status", () =>
    db.createEnumAttribute(DB, "books", "status", ["draft", "published"], false, "published", false),
  );
  await waitFor("authors", ["userId"]);
  await waitFor("books", ["status"]);

  await ensure("index authors.userId_idx", () =>
    db.createIndex(DB, "authors", "userId_idx", IndexType.Key, ["userId"], []),
  );
  await ensure("index books.status_idx", () =>
    db.createIndex(DB, "books", "status_idx", IndexType.Key, ["status"], []),
  );
  await ensure("index books.lang_status_idx", () =>
    db.createIndex(DB, "books", "lang_status_idx", IndexType.Key, ["language", "status"], []),
  );

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("✗", e?.response?.message || e?.message || e);
  process.exit(1);
});
