import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuthorForm } from "@/components/admin/author-form";

export const metadata = { title: "नयाँ सर्जक" };

export default function NewAuthorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/authors" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> सर्जकहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">नयाँ सर्जक</h1>
      <AuthorForm />
    </div>
  );
}
