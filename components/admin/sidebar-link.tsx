"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors " +
        // Use the theme-aware --accent surface so hover/active stay legible in
        // both light and dark mode (the old fixed light bg hid text in dark).
        (active
          ? "bg-[var(--accent)] font-semibold text-mountain-700 dark:text-mountain-200"
          : "text-[var(--foreground)] hover:bg-[var(--accent)]")
      }
    >
      {icon}
      {children}
    </Link>
  );
}
