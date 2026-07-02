import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Download, ChevronRight, User } from "lucide-react";
import { getBookBySlug, getAuthorById } from "@/lib/appwrite/data";
import { fileViewUrl, fileDownloadUrl, photoUrl } from "@/lib/appwrite/storage-url";
import type { BucketKey } from "@/lib/appwrite/config";
import { PdfViewer } from "@/components/site/pdf-viewer";
import { LANGUAGE_LABELS, genreLabel, isLimbuScript } from "@/lib/taxonomy";
import { toNepaliDigits, formatBytes } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "रचना भेटिएन" };
  return { title: book.title, description: book.description || undefined };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const limbu = isLimbuScript(book.language);
  const title = limbu ? book.titleLimbu || book.title : book.title;
  const author = book.authorId ? await getAuthorById(book.authorId) : null;
  const cover = photoUrl(book.coverImageId, {
    width: 500,
    height: 700,
    quality: 80,
    bucket: (book.coverBucket as BucketKey) || "general",
  });
  const viewUrl = fileViewUrl(book.fileId, (book.fileBucket as BucketKey) || "books");
  const downloadUrl = fileDownloadUrl(book.fileId, (book.fileBucket as BucketKey) || "books");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-muted)]">
        <Link href={`/${book.language}`} className={limbu ? "font-limbu hover:text-mountain-700" : "hover:text-mountain-700"}>
          {LANGUAGE_LABELS[book.language].ne}
        </Link>
        {book.genre && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${book.language}/${book.genre}`} className="hover:text-mountain-700">
              {genreLabel(book.language, book.genre)}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,260px)_1fr]">
        {/* Cover + meta */}
        <div>
          <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-[var(--border)] bg-mountain-50">
            {cover ? (
              <Image src={cover} alt={title} fill className="object-cover" sizes="260px" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-mountain-200">
                <BookOpen className="h-16 w-16" />
              </div>
            )}
          </div>

          {downloadUrl && (
            <a
              href={downloadUrl}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mountain-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-mountain-700"
            >
              <Download className="h-4 w-4" /> PDF डाउनलोड गर्नुहोस्
              {book.fileSizeBytes ? (
                <span className="opacity-80">({formatBytes(book.fileSizeBytes)})</span>
              ) : null}
            </a>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className={"text-3xl font-bold leading-tight " + (limbu ? "font-limbu" : "")}>{title}</h1>
          {limbu && book.title && book.title !== title && (
            <p className="mt-1 text-lg text-[var(--color-muted)]">{book.title}</p>
          )}
          {book.titleEn && <p className="mt-1 text-sm text-[var(--color-muted)]">{book.titleEn}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {author ? (
              <Link
                href={`/authors/${author.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 hover:border-mountain-400"
              >
                <User className="h-3.5 w-3.5" /> {author.name}
              </Link>
            ) : book.authorName ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
                <User className="h-3.5 w-3.5" /> {book.authorName}
              </span>
            ) : null}
            {book.genre && (
              <span className="rounded-full bg-mountain-50 px-3 py-1 text-mountain-700">
                {genreLabel(book.language, book.genre)}
              </span>
            )}
            {book.publishedYear && (
              <span className="text-[var(--color-muted)]">प्रकाशन: {toNepaliDigits(book.publishedYear)}</span>
            )}
          </div>

          {book.description && (
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-[var(--foreground)]/90">
              {book.description}
            </p>
          )}

          {/* PDF reader */}
          <div className="mt-8">
            {viewUrl ? (
              <PdfViewer url={viewUrl} title={title} />
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
                यस रचनाको PDF अहिले उपलब्ध छैन।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
