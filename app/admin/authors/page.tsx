import Link from "next/link";
import { Plus, Users, Pencil } from "lucide-react";
import { listAuthors } from "@/lib/appwrite/data";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminAuthorsList() {
  const authors = await listAuthors(500);
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">सर्जकहरू</h1>
        <Link href="/admin/authors/new" className="inline-flex items-center gap-2 rounded-md bg-mountain-700 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> नयाँ सर्जक
        </Link>
      </div>

      {authors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          <Users className="mx-auto h-10 w-10" />
          <p className="mt-2">अहिले कुनै सर्जक छैन।</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a) => (
            <li key={a.$id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <Link href={`/admin/authors/${a.$id}`} className="min-w-0">
                <div className="truncate font-semibold hover:text-mountain-700">{a.name}</div>
                {a.nameLimbu && <div className="font-limbu truncate text-sm text-[var(--color-muted)]">{a.nameLimbu}</div>}
              </Link>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/admin/authors/${a.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton endpoint={`/api/admin/authors/${a.$id}`} confirmText={`"${a.name}" मेटाउने?`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
