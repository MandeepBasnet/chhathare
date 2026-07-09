"use client";
import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Check, Loader2, FileText, ImageIcon, X } from "lucide-react";
import type { BucketKey } from "@/lib/appwrite/config";
import { photoUrl } from "@/lib/appwrite/storage-url";
import { formatBytes } from "@/lib/utils";

// Uploads a single file to the given Appwrite bucket via /api/admin/upload and
// reports the resulting fileId (+ size) to the parent. Used for book covers,
// author photos, gallery images, and book PDFs.
export function FileUpload({
  bucket,
  accept,
  kind,
  currentId,
  onUploaded,
  label,
  endpoint = "/api/admin/upload",
}: {
  bucket: BucketKey;
  accept: string;
  kind: "image" | "pdf";
  currentId?: string | null;
  onUploaded: (fileId: string | null, size: number | null) => void;
  label: string;
  endpoint?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [fileId, setFileId] = React.useState<string | null>(currentId ?? null);
  const [size, setSize] = React.useState<number | null>(null);
  const [name, setName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "अपलोड असफल");
        return;
      }
      setFileId(data.fileId);
      setSize(data.size);
      setName(file.name);
      onUploaded(data.fileId, data.size);
      toast.success("अपलोड भयो");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setFileId(null);
    setSize(null);
    setName(null);
    onUploaded(null, null);
  }

  // Live thumbnail of the current/just-uploaded image so the picture is always visible.
  const preview =
    kind === "image" && fileId
      ? photoUrl(fileId, { width: 240, height: 240, quality: 75, bucket })
      : null;

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {preview && (
        <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-lg border border-[var(--border)] bg-mountain-50">
          <Image src={preview} alt={label} fill className="object-cover" sizes="112px" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-mountain-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {fileId ? "बदल्नुहोस्" : "अपलोड गर्नुहोस्"}
        </button>
        {fileId && (
          <span className="inline-flex items-center gap-2 rounded-md bg-mountain-50 px-3 py-1.5 text-sm text-mountain-700">
            {kind === "pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            <Check className="h-3.5 w-3.5" />
            <span className="max-w-[160px] truncate">{name || fileId}</span>
            {size ? <span className="text-xs opacity-70">{formatBytes(size)}</span> : null}
            <button type="button" onClick={clear} aria-label="हटाउनुहोस्" className="hover:text-red-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={onPick} className="hidden" />
    </div>
  );
}
