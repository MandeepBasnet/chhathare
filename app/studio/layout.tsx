import Link from "next/link";
import { BookOpen, User, Home, PenLine, ScrollText } from "lucide-react";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { AdminSidebarLink } from "@/components/admin/sidebar-link";

export const metadata = { title: "सर्जक स्टुडियो" };

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { author } = await requireAuthor();
  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--border)] bg-[var(--card)] lg:border-b-0 lg:border-r">
        <div className="border-b border-[var(--border)] p-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-mountain-700">
            <Home className="h-4 w-4" /> साइटमा फर्कनुहोस्
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-mountain-600" />
            <span className="truncate font-bold">{author.name}</span>
          </div>
          <div className="text-xs text-[var(--color-muted)]">सर्जक स्टुडियो</div>
        </div>
        <nav className="space-y-1 p-3 text-sm">
          <AdminSidebarLink href="/studio" icon={<BookOpen className="h-4 w-4" />}>
            मेरा रचनाहरू
          </AdminSidebarLink>
          <AdminSidebarLink href="/studio/logs" icon={<ScrollText className="h-4 w-4" />}>
            पहुँच अभिलेख
          </AdminSidebarLink>
          <AdminSidebarLink href="/studio/profile" icon={<User className="h-4 w-4" />}>
            मेरो परिचय
          </AdminSidebarLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="flex-1 lg:overflow-auto">{children}</div>
      </div>
    </div>
  );
}
