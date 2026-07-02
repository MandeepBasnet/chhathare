"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export const NAV_LINKS = [
  { href: "/", label: "मुख्य", limbu: false },
  { href: "/yakthung", label: "याक्थुङ", limbu: false },
  { href: "/nepali", label: "नेपाली", limbu: false },
  { href: "/english", label: "अङ्ग्रेजी", limbu: false },
  { href: "/authors", label: "सर्जक", limbu: false },
  { href: "/gallery", label: "ग्यालरी", limbu: false },
  { href: "/search", label: "खोज", limbu: false },
];

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || (pathname?.startsWith(href + "/") ?? false);
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 text-base font-medium md:flex">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              "transition-colors " +
              (isActive(pathname, l.href)
                ? "text-mountain-700"
                : "text-[var(--foreground)] hover:text-mountain-600")
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        aria-label="मेनु"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] hover:border-mountain-400 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[80vw] max-w-sm flex-col border-l border-[var(--border)] bg-[var(--background)] shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                मेनु
              </span>
              <button
                aria-label="बन्द गर्नुहोस्"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-mountain-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={
                      "block rounded-md px-3 py-2.5 text-base font-medium " +
                      (isActive(pathname, l.href)
                        ? "bg-mountain-50 text-mountain-700"
                        : "hover:bg-mountain-50")
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
