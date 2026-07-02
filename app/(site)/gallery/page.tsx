import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";
import { listGalleries } from "@/lib/appwrite/data";
import { photoUrl } from "@/lib/appwrite/storage-url";

export const metadata = { title: "ग्यालरी" };

export default async function GalleryIndex() {
  const galleries = await listGalleries();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">ग्यालरी</h1>
      <p className="mt-1 text-[var(--color-muted)]">कार्यक्रम, विमोचन र साहित्यिक क्षणहरूको संग्रह।</p>

      {galleries.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--color-muted)]">
          <Images className="mx-auto h-10 w-10" />
          <p className="mt-2">हाल कुनै ग्यालरी उपलब्ध छैन।</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => {
            const cover = photoUrl(g.coverImageId, { width: 600, height: 400, quality: 75, bucket: "gallery" });
            return (
              <Link
                key={g.$id}
                href={`/gallery/${g.slug}`}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-mountain-400"
              >
                <div className="relative aspect-[3/2] bg-mountain-50">
                  {cover ? (
                    <Image src={cover} alt={g.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-mountain-200">
                      <Images className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold">{g.title}</div>
                  {g.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{g.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
