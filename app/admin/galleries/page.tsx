import Link from "next/link";
import { Plus, Images, Pencil } from "lucide-react";
import { listGalleries } from "@/lib/appwrite/data";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminGalleriesList() {
  const galleries = await listGalleries();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">ग्यालरीहरू</h1>
        <Link href="/admin/galleries/new" className="inline-flex items-center gap-2 rounded-md bg-mountain-700 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> नयाँ ग्यालरी
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          <Images className="mx-auto h-10 w-10" />
          <p className="mt-2">अहिले कुनै ग्यालरी छैन।</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <li key={g.$id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <Link href={`/admin/galleries/${g.$id}`} className="min-w-0">
                <div className="truncate font-semibold hover:text-mountain-700">{g.title}</div>
                {g.description && <div className="truncate text-sm text-[var(--color-muted)]">{g.description}</div>}
              </Link>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/admin/galleries/${g.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton endpoint={`/api/admin/galleries/${g.$id}`} confirmText={`"${g.title}" र यसका सबै तस्वीर मेटाउने?`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
