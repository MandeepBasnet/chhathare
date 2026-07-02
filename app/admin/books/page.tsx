import Link from "next/link";
import { Plus, BookOpen, FileText, Pencil } from "lucide-react";
import { listBooks } from "@/lib/appwrite/data";
import { isLanguage, genreLabel, LANGUAGE_LABELS, isLimbuScript, type Language } from "@/lib/taxonomy";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminBooksList({
  searchParams,
}: {
  searchParams: Promise<{ language?: string }>;
}) {
  const sp = await searchParams;
  const language = sp.language && isLanguage(sp.language) ? (sp.language as Language) : undefined;
  const { items } = await listBooks({ language, limit: 200 });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">रचनाहरू</h1>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-2 rounded-md bg-mountain-700 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> नयाँ रचना
        </Link>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <Link href="/admin/books" className={"rounded-full border px-3 py-1 " + (!language ? "border-mountain-500 bg-mountain-600 text-white" : "border-[var(--border)]")}>
          सबै
        </Link>
        <Link href="/admin/books?language=yakthung" className={"rounded-full border px-3 py-1 " + (language === "yakthung" ? "border-mountain-500 bg-mountain-600 text-white" : "border-[var(--border)]")}>
          याक्थुङ
        </Link>
        <Link href="/admin/books?language=nepali" className={"rounded-full border px-3 py-1 " + (language === "nepali" ? "border-mountain-500 bg-mountain-600 text-white" : "border-[var(--border)]")}>
          नेपाली
        </Link>
        <Link href="/admin/books?language=english" className={"rounded-full border px-3 py-1 " + (language === "english" ? "border-mountain-500 bg-mountain-600 text-white" : "border-[var(--border)]")}>
          अङ्ग्रेजी
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          <BookOpen className="mx-auto h-10 w-10" />
          <p className="mt-2">अहिले कुनै रचना छैन।</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card)] text-left text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-2.5 font-medium">शीर्षक</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">सर्जक</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">शाखा / विधा</th>
                <th className="px-4 py-2.5 font-medium">PDF</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.map((b) => {
                const limbu = isLimbuScript(b.language);
                const title = limbu ? b.titleLimbu || b.title : b.title;
                return (
                  <tr key={b.$id} className="bg-[var(--background)] hover:bg-[var(--card)]">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/books/${b.$id}`} className={"font-medium hover:text-mountain-700 " + (limbu ? "font-limbu" : "")}>
                        {title}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-2.5 text-[var(--color-muted)] sm:table-cell">{b.authorName || "—"}</td>
                    <td className="hidden px-4 py-2.5 text-[var(--color-muted)] md:table-cell">
                      {LANGUAGE_LABELS[b.language].ne}
                      {b.genre ? ` · ${genreLabel(b.language, b.genre)}` : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      {b.fileId ? <FileText className="h-4 w-4 text-mountain-600" /> : <span className="text-[var(--color-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/books/${b.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton endpoint={`/api/admin/books/${b.$id}`} confirmText={`"${title}" मेटाउने?`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
