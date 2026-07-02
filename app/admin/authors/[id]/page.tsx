import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAuthorById } from "@/lib/appwrite/data";
import { adminApi } from "@/lib/appwrite/server";
import { toPlain } from "@/lib/utils";
import { AuthorForm } from "@/components/admin/author-form";
import { AuthorAccount } from "@/components/admin/author-account";

export const metadata = { title: "सर्जक सम्पादन" };

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) notFound();

  // Resolve the linked login's email (if any) for display.
  let linkedEmail: string | null = null;
  if (author.userId) {
    try {
      const u = await adminApi.users().get({ userId: author.userId });
      linkedEmail = u.email || null;
    } catch {
      linkedEmail = null;
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/authors" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> सर्जकहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">सर्जक सम्पादन</h1>
      <AuthorForm author={toPlain(author)} />
      <div className="mt-8 max-w-2xl border-t border-[var(--border)] pt-6">
        <AuthorAccount authorId={author.$id} linkedEmail={linkedEmail} />
      </div>
    </div>
  );
}
