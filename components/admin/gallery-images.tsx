"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { photoUrl } from "@/lib/appwrite/storage-url";
import type { GalleryImage } from "@/lib/types";

export function GalleryImages({
  galleryId,
  images,
}: {
  galleryId: string;
  images: GalleryImage[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("bucket", "gallery");
        const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) {
          toast.error(upData.error || "अपलोड असफल");
          continue;
        }
        const add = await fetch(`/api/admin/galleries/${galleryId}/images`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageId: upData.fileId }),
        });
        if (!add.ok) {
          const err = await add.json().catch(() => ({}));
          toast.error(err.error || "थप्न असफल");
        }
      }
      toast.success("तस्वीर थपियो");
      router.refresh();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(imageDocId: string) {
    if (!confirm("यो तस्वीर हटाउने?")) return;
    const res = await fetch(`/api/admin/galleries/${galleryId}/images?imageDocId=${imageDocId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("हटाइयो");
      router.refresh();
    } else {
      toast.error("हटाउन असफल");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">तस्वीरहरू ({images.length})</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-mountain-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          तस्वीर थप्नुहोस्
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          अहिले तस्वीर छैन। माथिको बटनबाट थप्नुहोस्।
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => {
            const url = photoUrl(img.imageId, { width: 300, height: 300, quality: 70, bucket: "gallery" });
            return (
              <div key={img.$id} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-mountain-50">
                {url && <Image src={url} alt={img.caption || ""} fill className="object-cover" sizes="200px" />}
                <button
                  type="button"
                  onClick={() => remove(img.$id)}
                  aria-label="हटाउनुहोस्"
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
