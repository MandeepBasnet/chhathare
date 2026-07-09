import Link from "next/link";
import Image from "next/image";
import { Plus, Users, Pencil, User } from "lucide-react";
import { listAuthors } from "@/lib/appwrite/data";
import { photoUrl } from "@/lib/appwrite/storage-url";
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
          {authors.map((a) => {
            const photo = photoUrl(a.photoId, { width: 96, height: 96, quality: 70, bucket: "general" });
            return (
            <li key={a.$id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <Link href={`/admin/authors/${a.$id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-mountain-50">
                  {photo ? (
                    <Image src={photo} alt={a.name} fill className="object-cover" sizes="44px" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-mountain-300">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold hover:text-mountain-700">{a.name}</div>
                  {a.nameLimbu && <div className="font-limbu truncate text-sm text-[var(--color-muted)]">{a.nameLimbu}</div>}
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/admin/authors/${a.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton endpoint={`/api/admin/authors/${a.$id}`} confirmText={`"${a.name}" मेटाउने?`} />
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
