import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { adminApi, getSessionAccount } from "@/lib/appwrite/server";
import { isAdmin } from "@/lib/appwrite/auth-helpers";
import { getBookById } from "@/lib/appwrite/data";
import { appwriteConfig, type BucketKey } from "@/lib/appwrite/config";
import { watermarkPdf } from "@/lib/pdf-watermark";

export const runtime = "nodejs";

const DB = appwriteConfig.databaseId;
const LOGS = appwriteConfig.collections.accessLogs;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Gated, watermarked PDF stream. The books bucket is private, so this server
// route (admin API key) is the ONLY way to read a book — every access is
// logged and every page is stamped with the viewer's identity.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await getSessionAccount();
  if (!account) {
    return NextResponse.json({ error: "पढ्न लग इन आवश्यक छ" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const book = await getBookById(id);
  if (!book || !book.fileId) {
    return NextResponse.json({ error: "फाइल भेटिएन" }, { status: 404 });
  }
  // Drafts are readable only by admins (the public book page hides them anyway).
  if (book.status === "draft" && !(await isAdmin(account.$id))) {
    return NextResponse.json({ error: "उपलब्ध छैन" }, { status: 404 });
  }

  const bucket = appwriteConfig.buckets[(book.fileBucket as BucketKey) || "books"];

  let out: Uint8Array;
  try {
    const raw = (await adminApi.storage().getFileView({
      bucketId: bucket,
      fileId: book.fileId,
    })) as ArrayBuffer;
    const input = new Uint8Array(raw);
    const stamp = `${account.email} • ${new Date().toISOString()}`;
    try {
      out = await watermarkPdf(input, stamp);
    } catch {
      // Malformed/encrypted PDF that pdf-lib can't stamp — serve the original
      // rather than breaking reading. Access is still logged below.
      out = input;
    }
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json(
      { error: err?.response?.message || err?.message || "फाइल पढ्न सकिएन" },
      { status: 500 },
    );
  }

  // Record the access for admin research (never block reading on a log failure).
  try {
    await adminApi.databases().createDocument({
      databaseId: DB,
      collectionId: LOGS,
      documentId: ID.unique(),
      data: {
        userId: account.$id,
        userEmail: account.email,
        userName: account.name || null,
        bookId: book.$id,
        bookTitle: book.title || book.titleEn || null,
        action: "view",
        ip: clientIp(req),
        userAgent: (req.headers.get("user-agent") || "").slice(0, 512),
      },
    });
  } catch {
    // swallow — logging must not break the reader experience
  }

  return new NextResponse(Buffer.from(out), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${book.slug || "document"}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
