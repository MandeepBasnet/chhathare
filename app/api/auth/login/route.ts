import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { SESSION_COOKIE_NAME } from "@/lib/appwrite/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "ईमेल र पासवर्ड चाहिन्छ" }, { status: 400 });
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
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { response?: { message?: string }; message?: string };
    const msg = err?.response?.message || err?.message || "लग इन असफल";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
