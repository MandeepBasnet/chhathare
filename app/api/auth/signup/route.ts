import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, ID } from "node-appwrite";
import { adminApi, SESSION_COOKIE_NAME } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/appwrite/config";
import { peek, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Cap account creation per IP to slow abuse/bot signups.
const MAX_SIGNUPS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "ईमेल र पासवर्ड चाहिन्छ" }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "पासवर्ड कम्तिमा ८ अक्षर" }, { status: 400 });
  }

  const ipKey = `signup:ip:${clientIp(req)}`;
  if (peek(ipKey, MAX_SIGNUPS).blocked) {
    return NextResponse.json(
      { error: "धेरै पटक दर्ता प्रयास भयो — केही बेरपछि प्रयास गर्नुहोस्।" },
      { status: 429 },
    );
  }

  const apiKey = (process.env.APPWRITE_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "सर्भरमा APPWRITE_API_KEY सेट गरिएको छैन।" }, { status: 500 });
  }

  try {
    // Create the reader account (Appwrite hashes the password with Argon2).
    await adminApi.users().create({
      userId: ID.unique(),
      email: String(email).trim(),
      password: String(password),
      name: name ? String(name).trim().slice(0, 200) : undefined,
    });
  } catch (e: unknown) {
    hit(ipKey, MAX_SIGNUPS, WINDOW_MS);
    const err = e as { response?: { message?: string }; message?: string; type?: string };
    const msg = err?.response?.message || err?.message || "";
    if (/already exists/i.test(msg) || err?.type === "user_already_exists") {
      return NextResponse.json({ error: "यो ईमेल पहिले नै दर्ता छ — लग इन गर्नुहोस्।" }, { status: 409 });
    }
    return NextResponse.json({ error: msg || "दर्ता असफल" }, { status: 500 });
  }

  // Immediately sign the new reader in (same SSR pattern as /api/auth/login).
  try {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(apiKey);
    const session = await new Account(client).createEmailPasswordSession({
      email: String(email).trim(),
      password: String(password),
    });
    if (!session.secret) {
      return NextResponse.json({ ok: true, session: false });
    }
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expire),
    });
    return NextResponse.json({ ok: true, session: true });
  } catch {
    // Account exists but auto-login failed — let them log in manually.
    return NextResponse.json({ ok: true, session: false });
  }
}
