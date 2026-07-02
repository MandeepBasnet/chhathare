import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Account } from "node-appwrite";
import { sessionClient, SESSION_COOKIE_NAME } from "@/lib/appwrite/server";

export const runtime = "nodejs";

export async function POST() {
  const c = await sessionClient();
  if (c) {
    try {
      await new Account(c).deleteSession({ sessionId: "current" });
    } catch {}
  }
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
