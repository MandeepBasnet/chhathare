import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import { photoUrl } from "@/lib/appwrite/storage-url";
import type { BucketKey } from "@/lib/appwrite/config";
import { genreLabel, isLimbuScript } from "@/lib/taxonomy";

export function BookCard({ book }: { book: Book }) {
  const limbu = isLimbuScript(book.language);
  const title = limbu ? book.titleLimbu || book.title : book.title;
  const cover = photoUrl(book.coverImageId, {
    width: 400,
    height: 560,
    quality: 75,
    bucket: (book.coverBucket as BucketKey) || "general",
  });
  return (
    <Link
      href={`/book/${book.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-mountain-400 hover:shadow-md"
    >
      <div className="relative aspect-[5/7] bg-mountain-50">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-mountain-200">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className={"line-clamp-2 font-semibold leading-snug " + (limbu ? "font-limbu" : "")}>
          {title}
        </h3>
        {book.authorName && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{book.authorName}</p>
        )}
        <div className="mt-auto pt-2">
          {book.genre && (
            <span className="inline-block rounded-full bg-mountain-50 px-2 py-0.5 text-[11px] text-mountain-700">
              {genreLabel(book.language, book.genre)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
