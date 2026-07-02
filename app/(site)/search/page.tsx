import { SearchBox } from "@/components/site/search-box";
import { BookCard } from "@/components/site/book-card";
import { searchBooks } from "@/lib/appwrite/data";
import { SearchX } from "lucide-react";
import { toNepaliDigits } from "@/lib/utils";

export const metadata = { title: "खोज" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q || "").trim();
  const results = term ? await searchBooks(term) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">खोज्नुहोस्</h1>
      <p className="mt-1 text-[var(--color-muted)]">रचनाको शीर्षक वा सर्जकको नामले खोज्नुहोस्।</p>

      <div className="mt-5 max-w-2xl">
        <SearchBox autoFocus defaultValue={term} />
      </div>

      {term && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            &ldquo;{term}&rdquo; का लागि {toNepaliDigits(results.length)} नतिजा
          </p>
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--color-muted)]">
              <SearchX className="mx-auto h-10 w-10" />
              <p className="mt-2">कुनै रचना भेटिएन। अर्को शब्दले प्रयास गर्नुहोस्।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {results.map((b) => (
                <BookCard key={b.$id} book={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
