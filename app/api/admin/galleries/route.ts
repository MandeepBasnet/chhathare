import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.galleries;

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

export async function POST(req: Request) {
  await requireAdmin();
  const g = await req.json();
  if (!g.title) return NextResponse.json({ error: "शीर्षक चाहिन्छ" }, { status: 400 });
  try {
    const slug = await uniqueSlug(slugify(g.title));
    const res = await adminApi.databases().createDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: ID.unique(),
      data: {
        title: String(g.title).slice(0, 200),
        slug,
        description: g.description ? String(g.description).slice(0, 4000) : null,
        coverImageId: g.coverImageId || null,
      },
    });
    return NextResponse.json({ ok: true, id: res.$id, slug });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
