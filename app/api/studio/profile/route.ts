import { NextResponse } from "next/server";
import { adminApi } from "@/lib/appwrite/server";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.authors;

// An author edits their own profile (not slug or userId).
export async function PATCH(req: Request) {
  const { author } = await requireAuthor();
  const a = await req.json();
  if (!a.name) return NextResponse.json({ error: "नाम चाहिन्छ" }, { status: 400 });
  try {
    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: author.$id,
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
