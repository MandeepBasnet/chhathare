import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata = { title: "नयाँ ग्यालरी" };

export default function NewGalleryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/galleries" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-mountain-700">
        <ChevronLeft className="h-4 w-4" /> ग्यालरीहरू
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:text-3xl">नयाँ ग्यालरी</h1>
      <GalleryForm />
    </div>
  );
}
