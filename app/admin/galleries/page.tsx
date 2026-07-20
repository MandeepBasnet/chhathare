import Link from "next/link";
import Image from "next/image";
import { Plus, Images, Pencil, AlertTriangle } from "lucide-react";
import { listGalleries, galleryImageCounts } from "@/lib/appwrite/data";
import { photoUrl } from "@/lib/appwrite/storage-url";
import { DeleteButton } from "@/components/admin/delete-button";
import { toNepaliDigits } from "@/lib/utils";

export default async function AdminGalleriesList() {
  const [galleries, counts] = await Promise.all([listGalleries(), galleryImageCounts()]);
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
          {galleries.map((g) => {
            const cover = photoUrl(g.coverImageId, { width: 160, height: 120, quality: 70, bucket: "gallery" });
            const imageCount = counts.get(g.$id) ?? 0;
            return (
            <li key={g.$id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <Link href={`/admin/galleries/${g.$id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-mountain-50">
                  {cover ? (
                    <Image src={cover} alt={g.title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-mountain-200">
                      <Images className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold hover:text-mountain-700">{g.title}</div>
                  {g.description && <div className="truncate text-sm text-[var(--color-muted)]">{g.description}</div>}
                  {imageCount === 0 ? (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> तस्वीर थपिएको छैन
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-[var(--color-muted)]">
                      {toNepaliDigits(imageCount)} तस्वीर
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/admin/galleries/${g.$id}`} aria-label="सम्पादन" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] hover:border-mountain-400">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton endpoint={`/api/admin/galleries/${g.$id}`} confirmText={`"${g.title}" र यसका सबै तस्वीर मेटाउने?`} />
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
