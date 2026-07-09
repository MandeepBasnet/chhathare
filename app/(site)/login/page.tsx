import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAccount } from "@/lib/appwrite/server";
import { LoginForm } from "./form";

export const metadata = { title: "लग इन" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const account = await getSessionAccount();
  // /dashboard routes each account to the right place by role (admin/author/reader).
  if (account) redirect(sp.next || "/dashboard");
  const registerHref = `/register${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">लग इन</h1>
      <p className="mt-1 text-[var(--color-muted)]">आफ्नो खातामा प्रवेश गर्नुहोस्।</p>
      <LoginForm next={sp.next} />
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        खाता छैन?{" "}
        <Link href={registerHref} className="font-medium text-mountain-700 hover:underline">
          खाता बनाउनुहोस्
        </Link>
      </p>
    </div>
  );
}
