import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { SESSION_COOKIE_NAME } from "@/lib/appwrite/server";
import { peek, hit, reset } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Brute-force guard: max failed attempts per key within the window.
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: "धेरै पटक प्रयास भयो — केही बेरपछि फेरि प्रयास गर्नुहोस्।" },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "ईमेल र पासवर्ड चाहिन्छ" }, { status: 400 });
  }

  // Throttle by IP and by email so neither a single host nor a single targeted
  // account can be brute-forced. Reject before touching Appwrite if already over.
  const ipKey = `login:ip:${clientIp(req)}`;
  const emailKey = `login:email:${String(email).trim().toLowerCase()}`;
  const ipState = peek(ipKey, MAX_ATTEMPTS);
  const emailState = peek(emailKey, MAX_ATTEMPTS);
  if (ipState.blocked || emailState.blocked) {
    return tooMany(Math.max(ipState.retryAfterSec, emailState.retryAfterSec));
  }

  const apiKey = (process.env.APPWRITE_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "सर्भरमा APPWRITE_API_KEY सेट गरिएको छैन।" },
      { status: 500 },
    );
  }

  try {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(apiKey);
    const account = new Account(client);
    const session = await account.createEmailPasswordSession({ email, password });
    if (!session.secret) {
      return NextResponse.json(
        { error: "सेसन सिर्जना गर्न सकिएन — API key को scopes जाँच्नुहोस्।" },
        { status: 500 },
      );
    }
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expire),
    });
    // Successful login clears the throttle so earlier typos don't linger.
    reset(ipKey);
    reset(emailKey);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // Count the failure against both keys. Once either trips, block with 429.
    const ipHit = hit(ipKey, MAX_ATTEMPTS, WINDOW_MS);
    const emailHit = hit(emailKey, MAX_ATTEMPTS, WINDOW_MS);
    if (ipHit.blocked || emailHit.blocked) {
      return tooMany(Math.max(ipHit.retryAfterSec, emailHit.retryAfterSec));
    }
    const err = e as { response?: { message?: string }; message?: string };
    const msg = err?.response?.message || err?.message || "लग इन असफल";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
