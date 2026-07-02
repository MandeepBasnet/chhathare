// Throwaway end-to-end check: seed an author + 2 books directly via the admin
// key, hit the running dev server to confirm they render + are searchable, then
// delete everything. Proves data.ts queries, the fulltext search, and rendering.
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { Client, Databases, ID } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BASE = "http://localhost:3000";

const db = new Databases(new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY));
const created = { authors: [], books: [] };

async function main() {
  const author = await db.createDocument({
    databaseId: DB,
    collectionId: "authors",
    documentId: ID.unique(),
    data: {
      slug: "verify-bairagi-kainla",
      name: "बैरागी काइँला",
      nameLimbu: "ᤒᤠᤣᤖᤠᤃᤡ",
      nameEn: "Bairagi Kainla",
      searchIndex: "बैरागी काइँला Bairagi Kainla",
    },
  });
  created.authors.push(author.$id);

  const b1 = await db.createDocument({
    databaseId: DB,
    collectionId: "books",
    documentId: ID.unique(),
    data: {
      slug: "verify-yak-poem",
      title: "मुन्धुमी कविता",
      titleLimbu: "ᤔᤢᤴᤙᤢᤶ",
      language: "yakthung",
      genre: "sammila",
      authorId: author.$id,
      authorName: "बैरागी काइँला",
      searchIndex: "मुन्धुमी कविता बैरागी काइँला Bairagi",
      priority: 5,
    },
  });
  created.books.push(b1.$id);

  const b2 = await db.createDocument({
    databaseId: DB,
    collectionId: "books",
    documentId: ID.unique(),
    data: {
      slug: "verify-nep-story",
      title: "पहाडको कथा",
      language: "nepali",
      genre: "katha",
      authorName: "बैरागी काइँला",
      searchIndex: "पहाडको कथा बैरागी काइँला",
      priority: 3,
    },
  });
  created.books.push(b2.$id);

  // Give the fulltext index a moment.
  await new Promise((r) => setTimeout(r, 1500));

  const checks = [
    ["home lists a book", "/", "मुन्धुमी कविता"],
    ["yakthung branch", "/yakthung", "मुन्धुमी"],
    ["nepali genre page", "/nepali/katha", "पहाडको कथा"],
    ["author page + works", "/authors/verify-bairagi-kainla", "पहाडको कथा"],
    ["book detail", "/book/verify-nep-story", "पहाडको कथा"],
    ["search by author name", "/search?q=" + encodeURIComponent("बैरागी"), "पहाडको कथा"],
    ["search by title", "/search?q=" + encodeURIComponent("मुन्धुमी"), "मुन्धुमी कविता"],
  ];
  let pass = 0;
  for (const [label, path, needle] of checks) {
    const html = await fetch(BASE + path).then((r) => r.text());
    const ok = html.includes(needle);
    console.log(`${ok ? "✓" : "✗"} ${label}`);
    if (ok) pass++;
  }
  console.log(`\n${pass}/${checks.length} checks passed`);
}

async function cleanup() {
  for (const id of created.books) await db.deleteDocument({ databaseId: DB, collectionId: "books", documentId: id }).catch(() => {});
  for (const id of created.authors) await db.deleteDocument({ databaseId: DB, collectionId: "authors", documentId: id }).catch(() => {});
  console.log("cleaned up seed docs");
}

main()
  .catch((e) => console.error("ERR", e?.response?.message || e?.message || e))
  .finally(cleanup);
