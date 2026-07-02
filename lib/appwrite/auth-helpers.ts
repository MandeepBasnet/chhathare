import "server-only";
import { redirect } from "next/navigation";
import { adminApi, getSessionAccount } from "./server";
import { getAuthorByUserId } from "./data";
import { appwriteConfig } from "./config";
import type { Author } from "@/lib/types";

export async function requireUser() {
  const account = await getSessionAccount();
  if (!account) redirect("/login");
  return account;
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const memberships = await adminApi.users().listMemberships({ userId });
    return memberships.memberships.some(
      (m) => m.teamId === appwriteConfig.teams.admin && m.confirm,
    );
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const account = await requireUser();
  const admin = await isAdmin(account.$id);
  if (!admin) redirect("/?error=forbidden");
  return account;
}

export type Role = "admin" | "author" | "none";

// Resolve a logged-in account to its role + linked author record (if any).
export async function resolveRole(userId: string): Promise<{ role: Role; author: Author | null }> {
  if (await isAdmin(userId)) return { role: "admin", author: null };
  const author = await getAuthorByUserId(userId);
  if (author) return { role: "author", author };
  return { role: "none", author: null };
}

// Gate the author studio. Returns the account + the author record it manages.
export async function requireAuthor(): Promise<{ account: Awaited<ReturnType<typeof requireUser>>; author: Author }> {
  const account = await requireUser();
  const author = await getAuthorByUserId(account.$id);
  if (!author) redirect("/?error=forbidden");
  return { account, author };
}
