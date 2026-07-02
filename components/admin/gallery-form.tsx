"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import type { Gallery } from "@/lib/types";

export function GalleryForm({ gallery }: { gallery?: Gallery }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [coverImageId, setCoverImageId] = React.useState<string | null>(gallery?.coverImageId ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: (fd.get("title") as string)?.trim(),
      description: (fd.get("description") as string)?.trim() || null,
      coverImageId,
    };
    if (!payload.title) {
      toast.error("शीर्षक चाहिन्छ");
      return;
    }
    setPending(true);
    try {
      const url = gallery ? `/api/admin/galleries/${gallery.$id}` : "/api/admin/galleries";
      const res = await fetch(url, {
        method: gallery ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "सुरक्षित गर्न असफल");
        return;
      }
      toast.success(gallery ? "अद्यावधिक भयो" : "ग्यालरी बनाइयो");
      if (gallery) {
        router.refresh();
      } else {
        router.push(`/admin/galleries/${data.id}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <Label htmlFor="title">शीर्षक</Label>
        <Input id="title" name="title" defaultValue={gallery?.title ?? ""} className="mt-1" placeholder="ग्यालरीको शीर्षक" />
      </div>
      <div>
        <Label htmlFor="description">विवरण</Label>
        <Textarea id="description" name="description" defaultValue={gallery?.description ?? ""} className="mt-1" placeholder="वैकल्पिक" />
      </div>
      <div className="rounded-xl border border-[var(--border)] p-4">
        <FileUpload
          bucket="gallery"
          accept="image/*"
          kind="image"
          currentId={gallery?.coverImageId}
          onUploaded={(id) => setCoverImageId(id)}
          label="आवरण चित्र"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "..." : gallery ? "अद्यावधिक गर्नुहोस्" : "बनाउनुहोस् र तस्वीर थप्नुहोस्"}
      </Button>
    </form>
  );
}
