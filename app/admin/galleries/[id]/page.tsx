import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getGalleryById, listGalleryImages } from "@/lib/appwrite/data";
import { toPlain } from "@/lib/utils";
import { GalleryForm } from "@/components/admin/gallery-form";
import { GalleryImages } from "@/components/admin/gallery-images";

export const metadata = { title: "ग्यालरी सम्पादन" };

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gallery = await getGalleryById(id);
  if (!gallery) notFound();
  const images = await listGalleryImages(id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/galleries" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> ग्यालरीहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">ग्यालरी सम्पादन</h1>

      <GalleryForm gallery={toPlain(gallery)} />

      <div className="mt-10 border-t border-[var(--border)] pt-8">
        <GalleryImages galleryId={id} images={toPlain(images)} />
      </div>
    </div>
  );
}
