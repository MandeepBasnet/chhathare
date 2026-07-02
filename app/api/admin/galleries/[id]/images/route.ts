import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const IMG = appwriteConfig.collections.galleryImages;

// Add an already-uploaded image (fileId in the gallery bucket) to a gallery.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await req.json();
  if (!body.imageId) return NextResponse.json({ error: "imageId चाहिन्छ" }, { status: 400 });
  try {
    const existing = await adminApi.databases().listDocuments({
      databaseId: DB,
      collectionId: IMG,
      queries: [Query.equal("galleryId", id), Query.limit(1)],
    });
    const res = await adminApi.databases().createDocument({
      databaseId: DB,
      collectionId: IMG,
      documentId: ID.unique(),
      data: {
        galleryId: id,
        imageId: body.imageId,
        caption: body.caption ? String(body.caption).slice(0, 400) : null,
        order: existing.total,
      },
    });
    return NextResponse.json({ ok: true, id: res.$id });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}

// Remove a single image doc (?imageDocId=…) and its storage file.
export async function DELETE(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const imageDocId = url.searchParams.get("imageDocId");
  if (!imageDocId) return NextResponse.json({ error: "imageDocId चाहिन्छ" }, { status: 400 });
  try {
    const doc = await adminApi.databases().getDocument({ databaseId: DB, collectionId: IMG, documentId: imageDocId });
    const imageId = (doc as unknown as { imageId?: string }).imageId;
    if (imageId) {
      await adminApi.storage().deleteFile({ bucketId: appwriteConfig.buckets.gallery, fileId: imageId }).catch(() => {});
    }
    await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: IMG, documentId: imageDocId });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
