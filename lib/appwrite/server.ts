import "server-only";
import { Client, Databases, Storage, Users, Account, Teams } from "node-appwrite";
import { cookies } from "next/headers";
import { appwriteConfig } from "./config";

// Silence Appwrite SDK version-mismatch warnings — the endpoints we use are compatible.
if (!(globalThis as { __awSilenced?: boolean }).__awSilenced) {
  (globalThis as { __awSilenced?: boolean }).__awSilenced = true;
  const _w = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    const m = first ? String(first) : "";
    if (m.includes("SDK is built for Appwrite")) return;
    _w(...args);
  };
}

const SESSION_COOKIE = "sahitya-session";

function adminClient() {
  const c = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
  if (process.env.APPWRITE_API_KEY) c.setKey(process.env.APPWRITE_API_KEY);
  return c;
}

export const adminApi = {
  get client() {
    return adminClient();
  },
  databases() {
    return new Databases(this.client);
  },
  storage() {
    return new Storage(this.client);
  },
  users() {
    return new Users(this.client);
  },
  teams() {
    return new Teams(this.client);
  },
};

export async function sessionClient() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  const c = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
  c.setSession(session);
  return c;
}

export async function getSessionAccount() {
  const c = await sessionClient();
  if (!c) return null;
  try {
    return await new Account(c).get();
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
