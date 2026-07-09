import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
const DB = appwriteConfig.databaseId;
const COL = appwriteConfig.collections.authors;

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
  const a = await req.json();
  if (!a.name) return NextResponse.json({ error: "नाम चाहिन्छ" }, { status: 400 });

  // Optional login provisioning: if an email is supplied, a password (≥8) must be too.
  const email = a.email ? String(a.email).trim() : "";
  const password = a.password ? String(a.password) : "";
  if (email || password) {
    if (!email || !password) {
      return NextResponse.json({ error: "लगइनका लागि ईमेल र पासवर्ड दुवै चाहिन्छ" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "पासवर्ड कम्तिमा ८ अक्षर" }, { status: 400 });
    }
  }

  try {
    const slug = await uniqueSlug(slugify(a.nameEn || a.name));
    const res = await adminApi.databases().createDocument({
      databaseId: DB,
      collectionId: COL,
      documentId: ID.unique(),
      data: {
        slug,
        name: String(a.name).slice(0, 200),
        nameLimbu: a.nameLimbu || null,
        nameEn: a.nameEn || null,
        bio: a.bio || null,
        photoId: a.photoId || null,
        searchIndex: [a.name, a.nameLimbu, a.nameEn].filter(Boolean).join(" ").slice(0, 400),
      },
    });

    // Provision + link the login account, if requested. On failure the author
    // record still exists — surface the error so the admin can retry from the edit page.
    if (email && password) {
      try {
        const user = await adminApi.users().create({
          userId: ID.unique(),
          email,
          password,
          name: String(a.name).slice(0, 200),
        });
        await adminApi.databases().updateDocument({
          databaseId: DB,
          collectionId: COL,
          documentId: res.$id,
          data: { userId: user.$id },
        });
      } catch (e: unknown) {
        const err = e as { response?: { message?: string }; message?: string };
        return NextResponse.json(
          {
            ok: true,
            id: res.$id,
            slug,
            warning: `सर्जक बनाइयो तर लगइन बनाउन सकिएन: ${err?.response?.message || err?.message || "त्रुटि"}`,
          },
          { status: 207 },
        );
      }
    }

    return NextResponse.json({ ok: true, id: res.$id, slug });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
