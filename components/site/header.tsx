import Link from "next/link";
import { getSessionAccount } from "@/lib/appwrite/server";
import { SiteLinksBar } from "./site-links-bar";
import { MainNav } from "./main-nav";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const account = await getSessionAccount();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--background)]/90 backdrop-blur-md">
      <SiteLinksBar />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 md:h-20 md:gap-7 lg:px-8">
        <Link href="/" className="flex shrink-0 flex-col leading-tight">
          <span className="text-lg font-bold text-mountain-700 md:text-xl">छथरे लिम्बु साहित्य</span>
        </Link>
        <div className="flex-1" />
        <MainNav />
        <ThemeToggle />
        <UserMenu email={account?.email ?? null} />
      </div>
    </header>
  );
}
