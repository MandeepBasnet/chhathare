import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { slugify } from "@/lib/utils";
import { isLanguage } from "@/lib/taxonomy";
import { normalizeStatus, publishBlockedReason } from "@/lib/book-rules";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.books;

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 1;
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

function searchIndexOf(b: {
  title?: string | null;
  titleLimbu?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
}): string {
  return [b.title, b.titleLimbu, b.titleEn, b.authorName]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
}

export async function POST(req: Request) {
  await requireAdmin();
  const b = await req.json();
  const primary = b.title || b.titleLimbu || b.titleEn;
  if (!primary) return NextResponse.json({ error: "शीर्षक चाहिन्छ" }, { status: 400 });
  if (!isLanguage(b.language)) {
    return NextResponse.json({ error: "भाषा अमान्य" }, { status: 400 });
  }
  const status = normalizeStatus(b.status);
  const blocked = publishBlockedReason(status, b.publishedYear);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });
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
        authorId: b.authorId || null,
        authorName: b.authorName || null,
        coverImageId: b.coverImageId || null,
        coverBucket: b.coverBucket || null,
        fileId: b.fileId || null,
        fileBucket: b.fileBucket || null,
        fileSizeBytes: b.fileSizeBytes ?? null,
        description: b.description || null,
        publishedYear: b.publishedYear || null,
        priority: Number.isFinite(b.priority) ? b.priority : 0,
        status,
        searchIndex: searchIndexOf(b),
      },
    });
    return NextResponse.json({ ok: true, id: res.$id, slug });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
