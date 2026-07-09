import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAccount } from "@/lib/appwrite/server";
import { RegisterForm } from "./form";

export const metadata = { title: "खाता बनाउनुहोस्" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const account = await getSessionAccount();
  if (account) redirect(sp.next || "/");
  const loginHref = `/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">खाता बनाउनुहोस्</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        रचनाहरू पढ्न निःशुल्क खाता बनाउनुहोस्।
      </p>
      <RegisterForm next={sp.next} />
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        पहिले नै खाता छ?{" "}
        <Link href={loginHref} className="font-medium text-mountain-700 hover:underline">
          लग इन गर्नुहोस्
        </Link>
      </p>
    </div>
  );
}
