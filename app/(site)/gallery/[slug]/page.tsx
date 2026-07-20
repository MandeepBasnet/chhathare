import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getGalleryBySlug } from "@/lib/appwrite/data";
import { fileViewUrl } from "@/lib/appwrite/storage-url";
import { GalleryGrid } from "@/components/site/gallery-grid";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getGalleryBySlug(slug);
  return { title: data ? data.gallery.title : "ग्यालरी" };
}

export default async function GalleryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getGalleryBySlug(slug);
  if (!data) notFound();
  const { gallery, images } = data;

  const items = images
    .map((im) => ({
      id: im.$id,
      url: fileViewUrl(im.imageId, "gallery") || "",
      caption: im.caption,
    }))
    .filter((i) => i.url);

  // A gallery that only ever got a cover still shows a thumbnail everywhere
  // it's listed, so arriving here to "no images" reads as a broken page. Fall
  // back to the cover — it's a real image belonging to this gallery, and it
  // makes the page thin rather than dead until the rest are uploaded.
  const coverUrl = items.length === 0 ? fileViewUrl(gallery.coverImageId, "gallery") : null;
  const display = coverUrl ? [{ id: "cover", url: coverUrl, caption: null }] : items;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/gallery" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> ग्यालरीहरू
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{gallery.title}</h1>
      {gallery.description && <p className="mt-1 text-[var(--color-muted)]">{gallery.description}</p>}

      <div className="mt-8">
        {display.length === 0 ? (
          <p className="text-[var(--color-muted)]">यस ग्यालरीमा अहिले तस्वीर छैन।</p>
        ) : (
          <GalleryGrid images={display} />
        )}
      </div>
    </div>
  );
}
