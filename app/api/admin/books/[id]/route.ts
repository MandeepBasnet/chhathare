import { NextResponse } from "next/server";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { isLanguage } from "@/lib/taxonomy";
import { normalizeStatus, publishBlockedReason } from "@/lib/book-rules";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.books;

function searchIndexOf(b: {
  title?: string | null;
  titleLimbu?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
}): string {
  return [b.title, b.titleLimbu, b.titleEn, b.authorName].filter(Boolean).join(" ").slice(0, 500);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
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
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  try {
    // Best-effort: remove the attached PDF from storage too.
    try {
      const doc = await adminApi.databases().getDocument({ databaseId: DB, collectionId: COL, documentId: id });
      const fileId = (doc as unknown as { fileId?: string }).fileId;
      if (fileId) {
        await adminApi.storage().deleteFile({ bucketId: appwriteConfig.buckets.books, fileId }).catch(() => {});
      }
    } catch {}
    await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: COL, documentId: id });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
