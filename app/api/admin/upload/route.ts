import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { adminApi } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { appwriteConfig, type BucketKey } from "@/lib/appwrite/config";

export const runtime = "nodejs";

const MAX_SIZE = 30 * 1024 * 1024; // 30 MB — matches the Appwrite bucket cap.
const ALLOWED: BucketKey[] = ["books", "gallery", "general"];

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();
  const file = fd.get("file");
  const bucketKey = (fd.get("bucket") as string) || "general";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "फाइल छैन" }, { status: 400 });
  }
  if (!ALLOWED.includes(bucketKey as BucketKey)) {
    return NextResponse.json({ error: "अमान्य bucket" }, { status: 400 });
  }
  if (bucketKey === "books" && file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "पुस्तकको लागि PDF मात्र" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "फाइल ठूलो छ (३० MB सम्म)" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inputFile = InputFile.fromBuffer(bytes, file.name || "upload.bin");
  try {
    const res = await adminApi.storage().createFile({
      bucketId: appwriteConfig.buckets[bucketKey as BucketKey],
      fileId: ID.unique(),
      file: inputFile,
    });
    return NextResponse.json({ ok: true, fileId: res.$id, size: file.size, bucket: bucketKey });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    return NextResponse.json({ error: err?.response?.message || err?.message || "त्रुटि" }, { status: 500 });
  }
}
