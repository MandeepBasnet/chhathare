// Adds "english" to the books.language enum (originally yakthung|nepali).
// Idempotent — safe to re-run. Run once after pulling this change.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { Client, Databases } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chhathare-sahitya";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
const db = new Databases(client);

const ELEMENTS = ["yakthung", "nepali", "english"];

async function main() {
  const attr = await db.getAttribute(DB, "books", "language");
  const current = attr.elements || [];
  if (ELEMENTS.every((e) => current.includes(e))) {
    console.log("= language enum already includes english:", current.join(", "));
    return;
  }
  // Positional: (databaseId, collectionId, key, elements, required, default)
  await db.updateEnumAttribute(DB, "books", "language", ELEMENTS, attr.required ?? true, null);
  console.log("✓ updated books.language enum →", ELEMENTS.join(", "));
}

main().catch((e) => {
  console.error("✗", e?.response?.message || e?.message || e);
  process.exit(1);
});
