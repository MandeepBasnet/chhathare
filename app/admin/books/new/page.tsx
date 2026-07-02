import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listAuthors } from "@/lib/appwrite/data";
import { toPlain } from "@/lib/utils";
import { BookForm } from "@/components/admin/book-form";

export const metadata = { title: "नयाँ रचना" };

export default async function NewBookPage() {
  const authors = await listAuthors(500);
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/books" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> रचनाहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">नयाँ रचना</h1>
      <BookForm authors={toPlain(authors)} />
    </div>
  );
}
