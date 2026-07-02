import Image from "next/image";
import { notFound } from "next/navigation";
import { User, BookOpen } from "lucide-react";
import { getAuthorBySlug, listBooks } from "@/lib/appwrite/data";
import { photoUrl } from "@/lib/appwrite/storage-url";
import { BookCard } from "@/components/site/book-card";
import { toNepaliDigits } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  return { title: author ? author.name : "सर्जक" };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const { items, total } = await listBooks({ authorId: author.$id, limit: 60 });
  const photo = photoUrl(author.photoId, { width: 240, height: 240, quality: 80, bucket: "general" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-mountain-50">
          {photo ? (
            <Image src={photo} alt={author.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-mountain-300">
              <User className="h-10 w-10" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{author.name}</h1>
          {author.nameLimbu && <p className="font-limbu text-lg text-mountain-600">{author.nameLimbu}</p>}
          {author.nameEn && <p className="text-sm text-[var(--color-muted)]">{author.nameEn}</p>}
          {author.bio && (
            <p className="mt-3 max-w-2xl whitespace-pre-wrap leading-relaxed text-[var(--foreground)]/90">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold">रचनाहरू <span className="text-sm font-normal text-[var(--color-muted)]">({toNepaliDigits(total)})</span></h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
            <BookOpen className="mx-auto h-10 w-10" />
            <p className="mt-2">यस सर्जकका रचना अहिले उपलब्ध छैनन्।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((b) => (
              <BookCard key={b.$id} book={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
