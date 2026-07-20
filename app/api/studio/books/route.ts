import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { slugify } from "@/lib/utils";
import { isLanguage } from "@/lib/taxonomy";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.books;

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await adminApi.databases().listDocuments({
      databaseId: DB,
      collectionId: COL,
      queries: [Query.equal("slug", slug), Query.limit(1)],
    });
    if (res.documents.length === 0) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Author-created books: authorId/authorName are locked to the logged-in author,
// and everything starts as a draft pending admin approval.
export async function POST(req: Request) {
  const { author } = await requireAuthor();
  const b = await req.json();
  const primary = b.title || b.titleLimbu || b.titleEn;
  if (!primary) return NextResponse.json({ error: "शीर्षक चाहिन्छ" }, { status: 400 });
  if (!isLanguage(b.language)) {
    return NextResponse.json({ error: "भाषा अमान्य" }, { status: 400 });
  }
  try {
    const slug = await uniqueSlug(slugify(primary));
    const res = await adminApi.databases().createDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: ID.unique(),
      data: {
        slug,
        title: String(b.title || primary).slice(0, 300),
        titleLimbu: b.titleLimbu || null,
        titleEn: b.titleEn || null,
        language: b.language,
        genre: b.genre || null,
        authorId: author.$id,
        authorName: author.name,
        coverImageId: b.coverImageId || null,
        coverBucket: b.coverImageId ? "general" : null,
        fileId: b.fileId || null,
        fileBucket: b.fileId ? "books" : null,
        fileSizeBytes: b.fileId ? b.fileSizeBytes ?? null : null,
        description: b.description || null,
        publishedYear: b.publishedYear || null,
        priority: 0,
        status: "draft",
        searchIndex: [b.title, b.titleLimbu, b.titleEn, author.name].filter(Boolean).join(" ").slice(0, 500),
      },
    });
    return NextResponse.json({ ok: true, id: res.$id, slug });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
