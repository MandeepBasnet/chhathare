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

export function AuthorForm({ author, mode = "admin" }: { author?: Author; mode?: "admin" | "author" }) {
  const router = useRouter();
  const isAuthor = mode === "author";
  // Admin creating a brand-new author: offer to provision a login in the same step.
  const canProvisionLogin = !isAuthor && !author;
  const uploadEndpoint = isAuthor ? "/api/studio/upload" : "/api/admin/upload";
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(author?.name ?? "");
  const [nameLimbu, setNameLimbu] = React.useState(author?.nameLimbu ?? "");
  const [photoId, setPhotoId] = React.useState<string | null>(author?.photoId ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
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
    // Optional login: both fields required together if either is filled.
    if (canProvisionLogin) {
      const email = (fd.get("email") as string)?.trim() || "";
      const password = (fd.get("password") as string) || "";
      if (email || password) {
        if (!email || !password) {
          toast.error("लगइनका लागि ईमेल र पासवर्ड दुवै चाहिन्छ");
          return;
        }
        if (password.length < 8) {
          toast.error("पासवर्ड कम्तिमा ८ अक्षर");
          return;
        }
        payload.email = email;
        payload.password = password;
      }
    }
    setPending(true);
    try {
      const url = isAuthor
        ? "/api/studio/profile"
        : author
          ? `/api/admin/authors/${author.$id}`
          : "/api/admin/authors";
      const res = await fetch(url, {
        method: isAuthor || author ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "सुरक्षित गर्न असफल");
        return;
      }
      if (data.warning) {
        // Author saved, but login provisioning failed — keep the admin on the
        // edit page so they can retry the login there.
        toast.warning(data.warning);
        router.push(`/admin/authors/${data.id}`);
      } else {
        toast.success("अद्यावधिक भयो");
        router.push(isAuthor ? "/studio" : "/admin/authors");
      }
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
          endpoint={uploadEndpoint}
        />
      </div>
      {canProvisionLogin && (
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="mb-1 font-medium">लगइन खाता (वैकल्पिक)</div>
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            यो सर्जकलाई आफ्ना रचनाहरू थप्न/सम्पादन गर्न लगइन दिन ईमेल र पासवर्ड राख्नुहोस्। खाली छोड्दा पछि सम्पादन पृष्ठबाट पनि बनाउन सकिन्छ।
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" name="email" type="email" className="mt-1" autoComplete="off" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="password">पासवर्ड (कम्तिमा ८)</Label>
              <Input id="password" name="password" type="text" minLength={8} className="mt-1" autoComplete="off" placeholder="Optional" />
            </div>
          </div>
        </div>
      )}
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
