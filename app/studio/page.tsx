import Link from "next/link";
import { Plus, BookOpen, FileText, Pencil, Clock, CheckCircle2 } from "lucide-react";
import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { listBooks } from "@/lib/appwrite/data";
import { genreLabel, LANGUAGE_LABELS, isLimbuScript } from "@/lib/taxonomy";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function StudioHome() {
  const { author } = await requireAuthor();
  const { items } = await listBooks({ authorId: author.$id, status: "all", limit: 200 });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">मेरा रचनाहरू</h1>
          <p className="text-sm text-[var(--color-muted)]">तपाईंले पेश गर्नुभएका रचनाहरू। स्वीकृतिपछि साइटमा देखिन्छन्।</p>
        </div>
        <Link href="/studio/books/new" className="inline-flex items-center gap-2 rounded-md bg-mountain-700 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> नयाँ रचना
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          <BookOpen className="mx-auto h-10 w-10" />
          <p className="mt-2">अहिलेसम्म कुनै रचना छैन। &ldquo;नयाँ रचना&rdquo; बाट सुरु गर्नुहोस्।</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card)] text-left text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-2.5 font-medium">शीर्षक</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">शाखा / विधा</th>
                <th className="px-4 py-2.5 font-medium">PDF</th>
                <th className="px-4 py-2.5 font-medium">स्थिति</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.map((b) => {
                const limbu = isLimbuScript(b.language);
                const title = limbu ? b.titleLimbu || b.title : b.title;
                const published = b.status === "published";
                return (
                  <tr key={b.$id} className="bg-[var(--background)]">
                    <td className="px-4 py-2.5">
                      <Link href={`/studio/books/${b.$id}`} className={"font-medium hover:text-mountain-700 " + (limbu ? "font-limbu" : "")}>
                        {title}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-2.5 text-[var(--color-muted)] md:table-cell">
                      {LANGUAGE_LABELS[b.language].ne}
                      {b.genre ? ` · ${genreLabel(b.language, b.genre)}` : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      {b.fileId ? <FileText className="h-4 w-4 text-mountain-600" /> : <span className="text-[var(--color-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> प्रकाशित
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                          <Clock className="h-3 w-3" /> समीक्षामा
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/studio/books/${b.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton endpoint={`/api/studio/books/${b.$id}`} confirmText={`"${title}" मेटाउने?`} />
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
