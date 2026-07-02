import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { isLanguage, GENRES_BY_LANGUAGE, LANGUAGE_LABELS, isLimbuScript } from "@/lib/taxonomy";
import { listBooks, genresInLanguage } from "@/lib/appwrite/data";
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
  const [{ items, total }, usage] = await Promise.all([
    listBooks({ language, limit: 12 }),
    genresInLanguage(language),
  ]);

  const usageMap = new Map(usage.map((u) => [u.key, u.count]));
  const staticKeys = new Set(genres.map((g) => g.key));
  // Custom ("Others") categories authors/admins created, shown as extra filters.
  const customGenres = usage.filter((u) => !staticKeys.has(u.key));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-baseline gap-3">
        <h1 className={"text-3xl font-bold " + (limbu ? "font-limbu" : "")}>
          {LANGUAGE_LABELS[language].ne}
        </h1>
        <span className="text-sm text-[var(--color-muted)]">{toNepaliDigits(total)} रचना</span>
      </div>
      <p className="mt-1 text-[var(--color-muted)]">विधा अनुसार साहित्य हेर्नुहोस्।</p>

      {/* Genre grid — predefined categories + any custom "Others" categories. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map((g) => (
          <Link
            key={g.key}
            href={`/${language}/${encodeURIComponent(g.key)}`}
            className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-mountain-400 hover:shadow-md"
          >
            <div>
              <div className={"text-lg font-semibold " + (limbu ? "font-limbu" : "")}>{g.ne}</div>
              <div className="text-xs text-[var(--color-muted)]">{g.en}</div>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <span className="rounded-full bg-mountain-50 px-2 py-0.5 text-xs text-mountain-700">
                {toNepaliDigits(usageMap.get(g.key) ?? 0)}
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
        {customGenres.map((c) => (
          <Link
            key={c.key}
            href={`/${language}/${encodeURIComponent(c.key)}`}
            className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-mountain-400 hover:shadow-md"
          >
            <div>
              <div className={"text-lg font-semibold " + (limbu ? "font-limbu" : "")}>{c.key}</div>
              <div className="text-xs text-[var(--color-muted)]">Others</div>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <span className="rounded-full bg-mountain-50 px-2 py-0.5 text-xs text-mountain-700">
                {toNepaliDigits(c.count)}
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
