import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, Images, Home } from "lucide-react";
import { requireAdmin } from "@/lib/appwrite/auth-helpers";
import { AdminSidebarLink } from "@/components/admin/sidebar-link";

export const metadata = { title: "एडमिन" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--border)] bg-[var(--card)] lg:border-b-0 lg:border-r">
        <div className="border-b border-[var(--border)] p-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-mountain-700">
            <Home className="h-4 w-4" /> साइटमा फर्कनुहोस्
          </Link>
          <div className="mt-2 text-lg font-bold">एडमिन</div>
        </div>
        <nav className="space-y-1 p-3 text-sm">
          <AdminSidebarLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
            ड्यासबोर्ड
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/books" icon={<BookOpen className="h-4 w-4" />}>
            रचनाहरू
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/authors" icon={<Users className="h-4 w-4" />}>
            सर्जकहरू
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/galleries" icon={<Images className="h-4 w-4" />}>
            ग्यालरीहरू
          </AdminSidebarLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="flex-1 lg:overflow-auto">{children}</div>
      </div>
    </div>
  );
}
