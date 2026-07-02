"use client";
import * as React from "react";
import Link from "next/link";
import { User, LogIn, LogOut, LayoutDashboard } from "lucide-react";

export function UserMenu({ email }: { email: string | null }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } finally {
      setPending(false);
    }
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:border-mountain-400"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">लग इन</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm hover:border-mountain-400"
      >
        <User className="h-4 w-4" />
        <span className="hidden max-w-[140px] truncate sm:inline">{email}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[180px] rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-md">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm hover:bg-mountain-50"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" /> ड्यासबोर्ड
          </Link>
          <div className="my-1 h-px bg-[var(--border)]" />
          <button
            type="button"
            disabled={pending}
            onClick={logout}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm text-red-700 hover:bg-mountain-50"
          >
            <LogOut className="h-4 w-4" /> लग आउट
          </button>
        </div>
      )}
    </div>
  );
}
