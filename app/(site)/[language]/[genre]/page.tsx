import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import {
  isLanguage,
  getGenre,
  GENRES_BY_LANGUAGE,
  LANGUAGE_LABELS,
  isLimbuScript,
} from "@/lib/taxonomy";
import { listBooks } from "@/lib/appwrite/data";
import { BookCard } from "@/components/site/book-card";
import { toNepaliDigits } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string; genre: string }>;
}) {
  const { language, genre } = await params;
  if (!isLanguage(language)) return {};
  const g = getGenre(language, genre);
  return { title: g ? g.ne : "विधा" };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ language: string; genre: string }>;
}) {
  const { language, genre } = await params;
  if (!isLanguage(language)) notFound();
  const g = getGenre(language, genre);
  if (!g) notFound();

  const limbu = isLimbuScript(language);
  const { items, total } = await listBooks({ language, genre, limit: 60 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
        <Link href={`/${language}`} className={limbu ? "font-limbu hover:text-mountain-700" : "hover:text-mountain-700"}>
          {LANGUAGE_LABELS[language].ne}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className={limbu ? "font-limbu" : ""}>{g.ne}</span>
      </nav>

      <div className="mt-2 flex items-baseline gap-3">
        <h1 className={"text-3xl font-bold " + (limbu ? "font-limbu" : "")}>{g.ne}</h1>
        <span className="text-sm text-[var(--color-muted)]">{toNepaliDigits(total)} रचना</span>
      </div>

      {/* Sibling genres */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GENRES_BY_LANGUAGE[language].map((sg) => (
          <Link
            key={sg.key}
            href={`/${language}/${sg.key}`}
            className={
              "rounded-full border px-3 py-1 text-sm transition " +
              (sg.key === genre
                ? "border-mountain-500 bg-mountain-600 text-white"
                : "border-[var(--border)] text-[var(--color-muted)] hover:border-mountain-400") +
              (limbu ? " font-limbu" : "")
            }
          >
            {sg.ne}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--color-muted)]">
          <BookOpen className="mx-auto h-10 w-10" />
          <p className="mt-2">यस विधामा अहिले कुनै रचना छैन।</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((b) => (
            <BookCard key={b.$id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
