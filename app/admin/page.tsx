import Link from "next/link";
import { BookOpen, Users, Images, Plus } from "lucide-react";
import { listBooks, listAuthors, listGalleries, countBooksByLanguage } from "@/lib/appwrite/data";
import { toNepaliDigits } from "@/lib/utils";

export default async function AdminDashboard() {
  const [all, yak, nep, eng, authors, galleries] = await Promise.all([
    listBooks({ limit: 1 }),
    countBooksByLanguage("yakthung"),
    countBooksByLanguage("nepali"),
    countBooksByLanguage("english"),
    listAuthors(500),
    listGalleries(),
  ]);

  const stats = [
    { label: "कुल रचना", value: all.total, href: "/admin/books" },
    { label: "याक्थुङ", value: yak, href: "/admin/books?language=yakthung" },
    { label: "नेपाली", value: nep, href: "/admin/books?language=nepali" },
    { label: "अङ्ग्रेजी", value: eng, href: "/admin/books?language=english" },
    { label: "सर्जक", value: authors.length, href: "/admin/authors" },
    { label: "ग्यालरी", value: galleries.length, href: "/admin/galleries" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">ड्यासबोर्ड</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-mountain-400"
          >
            <div className="text-3xl font-bold text-mountain-700">{toNepaliDigits(s.value)}</div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <QuickAction href="/admin/books/new" icon={<BookOpen className="h-5 w-5" />} label="नयाँ रचना थप्नुहोस्" />
        <QuickAction href="/admin/authors/new" icon={<Users className="h-5 w-5" />} label="नयाँ सर्जक थप्नुहोस्" />
        <QuickAction href="/admin/galleries/new" icon={<Images className="h-5 w-5" />} label="नयाँ ग्यालरी थप्नुहोस्" />
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 text-mountain-700 hover:border-mountain-400 hover:bg-mountain-50"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mountain-100">{icon}</span>
      <span className="font-medium">{label}</span>
      <Plus className="ml-auto h-4 w-4" />
    </Link>
  );
}
