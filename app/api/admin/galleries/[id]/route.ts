import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.galleries;
const IMG = appwriteConfig.collections.galleryImages;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const g = await req.json();
  if (!g.title) return NextResponse.json({ error: "शीर्षक चाहिन्छ" }, { status: 400 });
  try {
    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: id,
      data: {
        title: String(g.title).slice(0, 200),
        description: g.description ? String(g.description).slice(0, 4000) : null,
        coverImageId: g.coverImageId || null,
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
    // Remove all image docs + their storage files, then the gallery.
    let more = true;
    while (more) {
      const imgs = await adminApi.databases().listDocuments({
        databaseId: DB,
        collectionId: IMG,
        queries: [Query.equal("galleryId", id), Query.limit(100)],
      });
      if (imgs.documents.length === 0) {
        more = false;
        break;
      }
      for (const doc of imgs.documents) {
        const imageId = (doc as unknown as { imageId?: string }).imageId;
        if (imageId) {
          await adminApi
            .storage()
            .deleteFile({ bucketId: appwriteConfig.buckets.gallery, fileId: imageId })
            .catch(() => {});
        }
        await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: IMG, documentId: doc.$id });
      }
    }
    await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: COL, documentId: id });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
