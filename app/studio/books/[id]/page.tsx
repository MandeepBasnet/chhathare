import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { getBookById } from "@/lib/appwrite/data";
import { toPlain } from "@/lib/utils";
import { BookForm } from "@/components/admin/book-form";

export const metadata = { title: "रचना सम्पादन" };

export default async function StudioEditBook({ params }: { params: Promise<{ id: string }> }) {
  const { author } = await requireAuthor();
  const { id } = await params;
  const book = await getBookById(id);
  // Authors may only edit their own works.
  if (!book || book.authorId !== author.$id) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/studio" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> मेरा रचनाहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">रचना सम्पादन</h1>
      <BookForm mode="author" fixedAuthor={toPlain(author)} book={toPlain(book)} />
    </div>
  );
}
