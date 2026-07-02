import Link from "next/link";
import { Plus, BookOpen, FileText, Pencil, Clock, CheckCircle2 } from "lucide-react";
import { listBooks } from "@/lib/appwrite/data";
import { isLanguage, genreLabel, LANGUAGE_LABELS, isLimbuScript, type Language } from "@/lib/taxonomy";
import type { BookStatus } from "@/lib/types";
import { DeleteButton } from "@/components/admin/delete-button";
import { PublishButton } from "@/components/admin/publish-button";

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={"rounded-full border px-3 py-1 " + (active ? "border-mountain-500 bg-mountain-600 text-white" : "border-[var(--border)]")}
    >
      {children}
    </Link>
  );
}

export default async function AdminBooksList({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const language = sp.language && isLanguage(sp.language) ? (sp.language as Language) : undefined;
  const status: BookStatus | "all" = sp.status === "draft" ? "draft" : sp.status === "published" ? "published" : "all";
  const { items } = await listBooks({ language, status, limit: 200 });
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (language) p.set("language", language);
    if (status !== "all") p.set("status", status);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return s ? `/admin/books?${s}` : "/admin/books";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">रचनाहरू</h1>
        <Link href="/admin/books/new" className="inline-flex items-center gap-2 rounded-md bg-mountain-700 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> नयाँ रचना
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <Chip href={qs({ language: undefined })} active={!language}>सबै भाषा</Chip>
        <Chip href={qs({ language: "yakthung" })} active={language === "yakthung"}>याक्थुङ</Chip>
        <Chip href={qs({ language: "nepali" })} active={language === "nepali"}>नेपाली</Chip>
        <Chip href={qs({ language: "english" })} active={language === "english"}>अङ्ग्रेजी</Chip>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Chip href={qs({ status: undefined })} active={status === "all"}>सबै स्थिति</Chip>
        <Chip href={qs({ status: "draft" })} active={status === "draft"}>समीक्षामा</Chip>
        <Chip href={qs({ status: "published" })} active={status === "published"}>प्रकाशित</Chip>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          <BookOpen className="mx-auto h-10 w-10" />
          <p className="mt-2">कुनै रचना छैन।</p>
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
                        <PublishButton bookId={b.$id} status={b.status ?? "published"} />
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
