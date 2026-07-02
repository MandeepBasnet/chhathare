import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.authors;

// Admin provisions a login for an author: creates an Appwrite user and links it
// to the author record via authors.userId. The author can then log in and manage
// their own works from /studio.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "ईमेल र पासवर्ड चाहिन्छ" }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "पासवर्ड कम्तिमा ८ अक्षर" }, { status: 400 });
  }

  try {
    const author = await adminApi.databases().getDocument({ databaseId: DB, collectionId: COL, documentId: id });
    if ((author as unknown as { userId?: string }).userId) {
      return NextResponse.json({ error: "यस सर्जकको लगइन पहिले नै छ" }, { status: 400 });
    }
    const name = (author as unknown as { name?: string }).name || email;

    const user = await adminApi.users().create({
      userId: ID.unique(),
      email: String(email).trim(),
      password: String(password),
      name,
    });

    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: id,
      data: { userId: user.$id },
    });

    return NextResponse.json({ ok: true, userId: user.$id, email: user.email });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
