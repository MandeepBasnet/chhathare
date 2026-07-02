import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { isLanguage, GENRES_BY_LANGUAGE, LANGUAGE_LABELS, isLimbuScript } from "@/lib/taxonomy";
import { listBooks } from "@/lib/appwrite/data";
import { BookCard } from "@/components/site/book-card";
import { toNepaliDigits } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  if (!isLanguage(language)) return {};
  return { title: LANGUAGE_LABELS[language].ne + " साहित्य" };
}

export default async function LanguagePage({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  if (!isLanguage(language)) notFound();

  const limbu = isLimbuScript(language);
  const genres = GENRES_BY_LANGUAGE[language];
  const { items, total } = await listBooks({ language, limit: 12 });

  // Count books per genre in this language (single pass over the fetched list is
  // not enough at scale; query counts per genre).
  const counts = await Promise.all(
    genres.map((g) => listBooks({ language, genre: g.key, limit: 1 }).then((r) => r.total)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-baseline gap-3">
        <h1 className={"text-3xl font-bold " + (limbu ? "font-limbu" : "")}>
          {LANGUAGE_LABELS[language].ne}
        </h1>
        <span className="text-sm text-[var(--color-muted)]">{toNepaliDigits(total)} रचना</span>
      </div>
      <p className="mt-1 text-[var(--color-muted)]">विधा अनुसार साहित्य हेर्नुहोस्।</p>

      {/* Genre grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map((g, i) => (
          <Link
            key={g.key}
            href={`/${language}/${g.key}`}
            className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-mountain-400 hover:shadow-md"
          >
            <div>
              <div className={"text-lg font-semibold " + (limbu ? "font-limbu" : "")}>{g.ne}</div>
              <div className="text-xs text-[var(--color-muted)]">{g.en}</div>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <span className="rounded-full bg-mountain-50 px-2 py-0.5 text-xs text-mountain-700">
                {toNepaliDigits(counts[i])}
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent in this language */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold">भर्खरै थपिएका</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
            <BookOpen className="mx-auto h-10 w-10" />
            <p className="mt-2">अहिले कुनै रचना छैन।</p>
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
