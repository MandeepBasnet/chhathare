import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { toPlain } from "@/lib/utils";
import { BookForm } from "@/components/admin/book-form";

export const metadata = { title: "नयाँ रचना" };

export default async function StudioNewBook() {
  const { author } = await requireAuthor();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/studio" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> मेरा रचनाहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">नयाँ रचना</h1>
      <BookForm mode="author" fixedAuthor={toPlain(author)} />
    </div>
  );
}
