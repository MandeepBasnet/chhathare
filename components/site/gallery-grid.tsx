"use client";
import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function GalleryGrid({
  images,
}: {
  images: { id: string; url: string; caption?: string | null }[];
}) {
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
      if (active === null) return;
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-mountain-50"
          >
            <Image
              src={img.url}
              alt={img.caption || ""}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width:640px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="बन्द"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active].url}
              alt={images[active].caption || ""}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {images[active].caption && (
              <p className="mt-2 text-center text-sm text-white/80">{images[active].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
