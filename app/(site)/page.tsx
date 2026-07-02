import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBox } from "@/components/site/search-box";
import { BookCard } from "@/components/site/book-card";
import { recentBooks, countBooksByLanguage } from "@/lib/appwrite/data";
import { YAKTHUNG_GENRES, NEPALI_GENRES, ENGLISH_GENRES } from "@/lib/taxonomy";
import { toNepaliDigits } from "@/lib/utils";

export default async function HomePage() {
  const [recent, yakCount, nepCount, engCount] = await Promise.all([
    recentBooks(10),
    countBooksByLanguage("yakthung"),
    countBooksByLanguage("nepali"),
    countBooksByLanguage("english"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Hero + search */}
      <section className="py-12 text-center md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">छथरे लिम्बु साहित्य</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)] md:text-lg">
          याक्थुङ र नेपाली साहित्यको डिजिटल पुस्तकालय — रचना वा सर्जकको नाम खोज्नुहोस्, पढ्नुहोस्
          र डाउनलोड गर्नुहोस्।
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left">
          <SearchBox />
        </div>
      </section>

      {/* Language branches */}
      <section className="grid gap-4 md:grid-cols-3">
        <BranchCard
          href="/yakthung"
          title="याक्थुङ"
          limbuTitle="ᤛᤠᤈᤡᤰ"
          count={yakCount}
          genres={YAKTHUNG_GENRES.map((g) => g.ne)}
          limbuFont
        />
        <BranchCard
          href="/nepali"
          title="नेपाली"
          count={nepCount}
          genres={NEPALI_GENRES.map((g) => g.ne)}
        />
        <BranchCard
          href="/english"
          title="अङ्ग्रेजी"
          count={engCount}
          genres={ENGLISH_GENRES.map((g) => g.en)}
        />
      </section>

      {/* Recent additions */}
      {recent.length > 0 && (
        <section className="py-12">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">भर्खरै थपिएका</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recent.map((b) => (
              <BookCard key={b.$id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BranchCard({
  href,
  title,
  limbuTitle,
  count,
  genres,
  limbuFont,
}: {
  href: string;
  title: string;
  limbuTitle?: string;
  count: number;
  genres: string[];
  limbuFont?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:border-mountain-400 hover:shadow-lg md:p-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
          {limbuTitle && <p className="font-limbu mt-1 text-xl text-mountain-600">{limbuTitle}</p>}
        </div>
        <span className="rounded-full bg-mountain-50 px-3 py-1 text-sm text-mountain-700">
          {toNepaliDigits(count)} रचना
        </span>
      </div>
      <div className={"mt-5 flex flex-wrap gap-2 " + (limbuFont ? "" : "")}>
        {genres.map((g) => (
          <span
            key={g}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--color-muted)]"
          >
            {g}
          </span>
        ))}
      </div>
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-mountain-700">
        हेर्नुहोस् <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
