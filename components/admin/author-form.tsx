"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScriptField } from "@/components/site/script-field";
import { FileUpload } from "./file-upload";
import type { Author } from "@/lib/types";

export function AuthorForm({ author }: { author?: Author }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(author?.name ?? "");
  const [nameLimbu, setNameLimbu] = React.useState(author?.nameLimbu ?? "");
  const [photoId, setPhotoId] = React.useState<string | null>(author?.photoId ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: name.trim(),
      nameLimbu: nameLimbu.trim() || null,
      nameEn: (fd.get("nameEn") as string)?.trim() || null,
      bio: (fd.get("bio") as string)?.trim() || null,
      photoId,
    };
    if (!payload.name) {
      toast.error("नाम चाहिन्छ");
      return;
    }
    setPending(true);
    try {
      const url = author ? `/api/admin/authors/${author.$id}` : "/api/admin/authors";
      const res = await fetch(url, {
        method: author ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "सुरक्षित गर्न असफल");
        return;
      }
      toast.success(author ? "अद्यावधिक भयो" : "सर्जक थपियो");
      router.push("/admin/authors");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <Label>नाम (नेपाली)</Label>
        <div className="mt-1">
          <ScriptField script="nepali" defaultValue={name} onValueChange={setName} placeholder="सर्जकको नाम" />
        </div>
      </div>
      <div>
        <Label>नाम (याक्थुङ / लिम्बू)</Label>
        <div className="mt-1">
          <ScriptField script="limbu" defaultValue={nameLimbu} onValueChange={setNameLimbu} placeholder="ᤛᤡᤖᤡᤈᤣᤅ᤺ᤠ" />
        </div>
      </div>
      <div>
        <Label htmlFor="nameEn">Name (English)</Label>
        <Input id="nameEn" name="nameEn" defaultValue={author?.nameEn ?? ""} className="mt-1" placeholder="Optional" />
      </div>
      <div>
        <Label htmlFor="bio">परिचय</Label>
        <Textarea id="bio" name="bio" defaultValue={author?.bio ?? ""} className="mt-1 min-h-32" placeholder="सर्जकको छोटो परिचय…" />
      </div>
      <div className="rounded-xl border border-[var(--border)] p-4">
        <FileUpload
          bucket="general"
          accept="image/*"
          kind="image"
          currentId={author?.photoId}
          onUploaded={(id) => setPhotoId(id)}
          label="तस्वीर"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "..." : author ? "अद्यावधिक गर्नुहोस्" : "थप्नुहोस्"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          रद्द गर्नुहोस्
        </Button>
      </div>
    </form>
  );
}
