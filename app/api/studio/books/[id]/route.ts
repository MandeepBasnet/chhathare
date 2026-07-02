import { NextResponse } from "next/server";
import { adminApi } from "@/lib/appwrite/server";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.books;

// Ownership guard: an author may only touch their own books.
async function ownedBook(id: string, authorId: string) {
  try {
    const doc = await adminApi.databases().getDocument({ databaseId: DB, collectionId: COL, documentId: id });
    return (doc as unknown as { authorId?: string }).authorId === authorId ? doc : null;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { author } = await requireAuthor();
  const { id } = await ctx.params;
  const owned = await ownedBook(id, author.$id);
  if (!owned) return NextResponse.json({ error: "अनुमति छैन" }, { status: 403 });

  const b = await req.json();
  const primary = b.title || b.titleLimbu || b.titleEn;
  if (!primary) return NextResponse.json({ error: "शीर्षक चाहिन्छ" }, { status: 400 });
  try {
    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: id,
      data: {
        title: String(b.title || primary).slice(0, 300),
        titleLimbu: b.titleLimbu || null,
        titleEn: b.titleEn || null,
        language: b.language,
        genre: b.genre || null,
        coverImageId: b.coverImageId || null,
        coverBucket: b.coverImageId ? "general" : null,
        fileId: b.fileId || null,
        fileBucket: b.fileId ? "books" : null,
        fileSizeBytes: b.fileId ? b.fileSizeBytes ?? null : null,
        description: b.description || null,
        publishedYear: b.publishedYear || null,
        // Any author edit re-enters the review queue.
        status: "draft",
        searchIndex: [b.title, b.titleLimbu, b.titleEn, author.name].filter(Boolean).join(" ").slice(0, 500),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { author } = await requireAuthor();
  const { id } = await ctx.params;
  const owned = await ownedBook(id, author.$id);
  if (!owned) return NextResponse.json({ error: "अनुमति छैन" }, { status: 403 });
  try {
    const fileId = (owned as unknown as { fileId?: string }).fileId;
    if (fileId) {
      await adminApi.storage().deleteFile({ bucketId: appwriteConfig.buckets.books, fileId }).catch(() => {});
    }
    await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: COL, documentId: id });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
