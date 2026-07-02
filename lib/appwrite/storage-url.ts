import { appwriteConfig, type BucketKey } from "./config";

// Preview URL (transformed image) — for covers, author photos, gallery images.
export function photoUrl(
  fileId: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number; bucket?: BucketKey } = {},
): string | null {
  if (!fileId) return null;
  const bucket = appwriteConfig.buckets[opts.bucket || "gallery"];
  const params = new URLSearchParams();
  params.set("project", appwriteConfig.projectId);
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.quality) params.set("quality", String(opts.quality));
  return `${appwriteConfig.endpoint}/storage/buckets/${bucket}/files/${fileId}/preview?${params.toString()}`;
}

// Raw file view URL — used to render/stream PDFs in-browser.
export function fileViewUrl(
  fileId: string | null | undefined,
  bucket: BucketKey = "books",
): string | null {
  if (!fileId) return null;
  const b = appwriteConfig.buckets[bucket];
  return `${appwriteConfig.endpoint}/storage/buckets/${b}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

// Forced-download URL — used by the "Download PDF" button.
export function fileDownloadUrl(
  fileId: string | null | undefined,
  bucket: BucketKey = "books",
): string | null {
  if (!fileId) return null;
  const b = appwriteConfig.buckets[bucket];
  return `${appwriteConfig.endpoint}/storage/buckets/${b}/files/${fileId}/download?project=${appwriteConfig.projectId}`;
}
