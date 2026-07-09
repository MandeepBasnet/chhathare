import { redirect } from "next/navigation";
import { getSessionAccount } from "@/lib/appwrite/server";
import { resolveRole } from "@/lib/appwrite/auth-helpers";

// Post-login router: sends each account to the right place by role.
export default async function DashboardRouter() {
  const account = await getSessionAccount();
  if (!account) redirect("/login");
  const { role } = await resolveRole(account.$id);
  if (role === "admin") redirect("/admin");
  if (role === "author") redirect("/studio");
  // Readers (no admin/author role) have no dashboard — send them to the site.
  redirect("/");
}
