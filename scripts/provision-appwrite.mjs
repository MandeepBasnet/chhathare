#!/usr/bin/env node
// Provisions the Chhathare Limbu Sahitya database, collections, indexes, and the
// books PDF bucket inside the SHARED Appwrite project. Idempotent — safe to re-run.
// Mirrors the Khajum Chongbang provisioning pattern.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { Client, Databases, Storage, Teams, Permission, Role, DatabasesIndexType as IndexType, Query } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chhathare-sahitya";
const BOOKS_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BOOKS || "sahitya-books";

// Reuse the existing shared admin team from the Khajum Chongbang project.
const ADMIN_TEAM_ID = "admin";

if (!ENDPOINT || !PROJECT || !API_KEY) {
  console.error("Missing env: NEXT_PUBLIC_APPWRITE_ENDPOINT / NEXT_PUBLIC_APPWRITE_PROJECT_ID / APPWRITE_API_KEY");
  process.exit(1);
}

const _origWarn = console.warn.bind(console);
console.warn = (...args) => {
  const msg = args[0] && String(args[0]);
  if (msg && msg.includes("SDK is built for Appwrite")) return;
  _origWarn(...args);
};
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
const db = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

async function ensure(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    const msg = e?.response?.message || e?.message || String(e);
    if (/already exists/i.test(msg)) {
      console.log(`= ${name} (exists)`);
    } else {
      console.error(`✗ ${name}: ${msg}`);
      throw e;
    }
  }
}

async function ensureDb() {
  await ensure(`database ${DB_ID}`, () => db.create(DB_ID, "Chhathare Limbu Sahitya"));
}

async function ensureTeam() {
  // Reuses the shared admin team; "exists" is the expected happy path.
  await ensure(`team ${ADMIN_TEAM_ID}`, () => teams.create(ADMIN_TEAM_ID, "Site Admins"));
}

function createAttr(collection, a) {
  switch (a.type) {
    case "string":
      return db.createStringAttribute(DB_ID, collection, a.key, a.size, a.required, a.default ?? null, a.array ?? false);
    case "integer":
      return db.createIntegerAttribute(DB_ID, collection, a.key, a.required, a.min ?? null, a.max ?? null, a.default ?? null, a.array ?? false);
    case "boolean":
      return db.createBooleanAttribute(DB_ID, collection, a.key, a.required, a.default ?? null, a.array ?? false);
    case "enum":
      return db.createEnumAttribute(DB_ID, collection, a.key, a.elements, a.required, a.default ?? null, a.array ?? false);
    case "longtext":
      return db.createStringAttribute(DB_ID, collection, a.key, 1_000_000, a.required, a.default ?? null, a.array ?? false);
    default:
      throw new Error("Unknown attr type " + a.type);
  }
}

async function waitForAttrs(collection, keys, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await db.listAttributes(DB_ID, collection, [Query.limit(500)]);
    const byKey = new Map(res.attributes.map((a) => [a.key, a.status]));
    if (keys.every((k) => byKey.get(k) === "available")) return;
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error("Timeout waiting for attributes in " + collection);
}

async function ensureCollection(id, name, attrs, indexes, opts = {}) {
  // Public content is world-readable; sensitive collections (e.g. access_logs)
  // pass { adminReadOnly: true } so only the admin team can read them.
  const readRole = opts.adminReadOnly ? Role.team(ADMIN_TEAM_ID) : Role.any();
  await ensure(`collection ${id}`, () =>
    db.createCollection(DB_ID, id, name, [
      Permission.read(readRole),
      Permission.create(Role.team(ADMIN_TEAM_ID)),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
      Permission.delete(Role.team(ADMIN_TEAM_ID)),
    ], false, true),
  );
  for (const a of attrs) await ensure(`  attr ${id}.${a.key}`, () => createAttr(id, a));
  await waitForAttrs(id, attrs.map((a) => a.key));
  for (const idx of indexes) {
    await ensure(`  index ${id}.${idx.key}`, () =>
      db.createIndex(DB_ID, id, idx.key, idx.type, idx.attributes, idx.orders || []),
    );
  }
}

async function ensureBucket(id, name, opts = {}) {
  const extensions = opts.extensions || ["jpg", "jpeg", "png", "webp", "gif", "svg"];
  const maxSize = opts.maxSize || 30_000_000;
  // Private buckets drop the public `Role.any()` read so files are only
  // reachable via the server (admin API key), never a shareable direct URL.
  const readRole = opts.private ? Role.team(ADMIN_TEAM_ID) : Role.any();
  const perms = [
    Permission.read(readRole),
    Permission.create(Role.team(ADMIN_TEAM_ID)),
    Permission.update(Role.team(ADMIN_TEAM_ID)),
    Permission.delete(Role.team(ADMIN_TEAM_ID)),
  ];
  await ensure(`bucket ${id}`, () =>
    storage.createBucket(id, name, perms, true, undefined, maxSize, extensions, undefined, true, true),
  );
  // Enforce permissions on re-run too (createBucket is skipped once it exists).
  await ensure(`bucket ${id} perms`, () =>
    storage.updateBucket(id, name, perms, true, undefined, maxSize, extensions, undefined, true, true),
  );
}

// ─── Schema ────────────────────────────────────────────────────────────────

// सर्जक (creators / authors)
const authorsAttrs = [
  { key: "slug", type: "string", size: 120, required: true },
  { key: "name", type: "string", size: 200, required: true },      // Nepali (primary)
  { key: "nameLimbu", type: "string", size: 200, required: false },
  { key: "nameEn", type: "string", size: 200, required: false },
  { key: "bio", type: "longtext", required: false },
  { key: "photoId", type: "string", size: 64, required: false },
  { key: "searchIndex", type: "string", size: 400, required: false },
];
const authorsIndexes = [
  { key: "slug_unique", type: IndexType.Unique, attributes: ["slug"] },
  { key: "fulltext", type: IndexType.Fulltext, attributes: ["searchIndex"] },
];

// पुस्तक / रचना (books / works) — language + genre + author + PDF
const booksAttrs = [
  { key: "slug", type: "string", size: 120, required: true },
  { key: "title", type: "string", size: 300, required: true },       // primary title
  { key: "titleLimbu", type: "string", size: 300, required: false },
  { key: "titleEn", type: "string", size: 300, required: false },
  { key: "language", type: "enum", elements: ["yakthung", "nepali"], required: true },
  // genre keys live in lib/genres.ts (poetry/story/novel/song/ghazal/haiku…)
  { key: "genre", type: "string", size: 60, required: false },
  { key: "authorId", type: "string", size: 64, required: false },
  { key: "authorName", type: "string", size: 200, required: false }, // denormalized for lists/search
  { key: "coverImageId", type: "string", size: 64, required: false },
  { key: "coverBucket", type: "string", size: 20, required: false },
  { key: "fileId", type: "string", size: 64, required: false },      // downloadable/readable PDF
  { key: "fileBucket", type: "string", size: 20, required: false },
  { key: "fileSizeBytes", type: "integer", required: false },
  { key: "description", type: "longtext", required: false },
  { key: "publishedYear", type: "string", size: 16, required: false },
  { key: "priority", type: "integer", required: false, default: 0 },
  { key: "searchIndex", type: "string", size: 500, required: false }, // title + author → search bar
];
const booksIndexes = [
  { key: "slug_unique", type: IndexType.Unique, attributes: ["slug"] },
  { key: "language_idx", type: IndexType.Key, attributes: ["language"] },
  { key: "genre_idx", type: IndexType.Key, attributes: ["genre"] },
  { key: "author_idx", type: IndexType.Key, attributes: ["authorId"] },
  { key: "lang_genre_idx", type: IndexType.Key, attributes: ["language", "genre"] },
  { key: "fulltext", type: IndexType.Fulltext, attributes: ["searchIndex"] },
];

const galleriesAttrs = [
  { key: "title", type: "string", size: 200, required: true },
  { key: "slug", type: "string", size: 200, required: true },
  { key: "description", type: "string", size: 4000, required: false },
  { key: "coverImageId", type: "string", size: 64, required: false },
];
const galleriesIndexes = [{ key: "slug_unique", type: IndexType.Unique, attributes: ["slug"] }];

const galleryImagesAttrs = [
  { key: "galleryId", type: "string", size: 64, required: true },
  { key: "imageId", type: "string", size: 64, required: true },
  { key: "caption", type: "string", size: 400, required: false },
  { key: "order", type: "integer", required: false, default: 0 },
];
const galleryImagesIndexes = [{ key: "gallery_idx", type: IndexType.Key, attributes: ["galleryId", "order"] }];

// Static content + settings (e.g. Sabayelhang URL once known)
const pagesAttrs = [
  { key: "slug", type: "string", size: 200, required: true },
  { key: "title", type: "string", size: 300, required: true },
  { key: "content", type: "longtext", required: false },
];
const pagesIndexes = [{ key: "slug_unique", type: IndexType.Unique, attributes: ["slug"] }];

// पहुँच अभिलेख (access logs) — who viewed which protected content, for copyright
// attribution + admin research. Written server-side; readable by admins only.
const accessLogsAttrs = [
  { key: "userId", type: "string", size: 64, required: true },
  { key: "userEmail", type: "string", size: 320, required: true },
  { key: "userName", type: "string", size: 200, required: false },
  { key: "bookId", type: "string", size: 64, required: true },
  { key: "bookTitle", type: "string", size: 300, required: false },
  { key: "action", type: "enum", elements: ["view", "download"], required: true },
  { key: "ip", type: "string", size: 64, required: false },
  { key: "userAgent", type: "string", size: 512, required: false },
];
const accessLogsIndexes = [
  { key: "user_idx", type: IndexType.Key, attributes: ["userId"] },
  { key: "book_idx", type: IndexType.Key, attributes: ["bookId"] },
];

async function main() {
  console.log(`Provisioning on ${ENDPOINT}, project ${PROJECT}, db ${DB_ID}`);
  await ensureDb();
  await ensureTeam();

  await ensureCollection("authors", "Authors (Sarjak)", authorsAttrs, authorsIndexes);
  await ensureCollection("books", "Books / Works", booksAttrs, booksIndexes);
  await ensureCollection("galleries", "Galleries", galleriesAttrs, galleriesIndexes);
  await ensureCollection("gallery_images", "Gallery Images", galleryImagesAttrs, galleryImagesIndexes);
  await ensureCollection("pages", "Pages", pagesAttrs, pagesIndexes);
  await ensureCollection("access_logs", "Access Logs", accessLogsAttrs, accessLogsIndexes, {
    adminReadOnly: true,
  });

  await ensureBucket(BOOKS_BUCKET, "Sahitya Books (PDF)", {
    extensions: ["pdf"],
    maxSize: 30_000_000, // 30 MB server cap on this Appwrite instance
    private: true, // no public URLs — PDFs are streamed via /api/read/[id] only
  });

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
