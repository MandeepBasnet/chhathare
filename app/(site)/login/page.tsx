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
  if (account) redirect(sp.next || "/admin");
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">एडमिन लग इन</h1>
      <p className="mt-1 text-[var(--color-muted)]">साहित्य व्यवस्थापन गर्न आफ्नो खातामा प्रवेश गर्नुहोस्।</p>
      <LoginForm next={sp.next} />
    </div>
  );
}
