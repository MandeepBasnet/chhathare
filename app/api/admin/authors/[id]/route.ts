import { NextResponse } from "next/server";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.authors;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const a = await req.json();
  if (!a.name) return NextResponse.json({ error: "नाम चाहिन्छ" }, { status: 400 });
  try {
    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: id,
      data: {
        name: String(a.name).slice(0, 200),
        nameLimbu: a.nameLimbu || null,
        nameEn: a.nameEn || null,
        bio: a.bio || null,
        photoId: a.photoId || null,
        searchIndex: [a.name, a.nameLimbu, a.nameEn].filter(Boolean).join(" ").slice(0, 400),
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
    await adminApi.databases().deleteDocument({ databaseId: DB, collectionId: COL, documentId: id });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
