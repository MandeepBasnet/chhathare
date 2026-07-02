import { NextResponse } from "next/server";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.books;

// Quick approve/unpublish toggle for the admin review queue.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const { status } = await req.json();
  if (status !== "draft" && status !== "published") {
    return NextResponse.json({ error: "अमान्य स्थिति" }, { status: 400 });
  }
  try {
    await adminApi.databases().updateDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: id,
      data: { status },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
