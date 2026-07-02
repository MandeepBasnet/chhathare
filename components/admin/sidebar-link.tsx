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
        (active ? "bg-mountain-50 font-medium text-mountain-700" : "hover:bg-mountain-50")
      }
    >
      {icon}
      {children}
    </Link>
  );
}
