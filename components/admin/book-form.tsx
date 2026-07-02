"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScriptField } from "@/components/site/script-field";
import { FileUpload } from "./file-upload";
import { GENRES_BY_LANGUAGE, type Language } from "@/lib/taxonomy";
import type { Author, Book } from "@/lib/types";

export function BookForm({ authors, book }: { authors: Author[]; book?: Book }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const [language, setLanguage] = React.useState<Language>(book?.language ?? "yakthung");
  const [genre, setGenre] = React.useState(book?.genre ?? "");
  const [title, setTitle] = React.useState(book?.title ?? "");
  const [titleLimbu, setTitleLimbu] = React.useState(book?.titleLimbu ?? "");
  const [authorId, setAuthorId] = React.useState(book?.authorId ?? "");

  const [coverImageId, setCoverImageId] = React.useState<string | null>(book?.coverImageId ?? null);
  const [fileId, setFileId] = React.useState<string | null>(book?.fileId ?? null);
  const [fileSizeBytes, setFileSizeBytes] = React.useState<number | null>(book?.fileSizeBytes ?? null);

  const genres = GENRES_BY_LANGUAGE[language];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const selectedAuthor = authors.find((a) => a.$id === authorId);
    const payload = {
      title: title.trim(),
      titleLimbu: titleLimbu.trim() || null,
      titleEn: (fd.get("titleEn") as string)?.trim() || null,
      language,
      genre: genre || null,
      authorId: authorId || null,
      authorName: selectedAuthor?.name || (fd.get("authorName") as string)?.trim() || null,
      coverImageId,
      coverBucket: coverImageId ? "general" : null,
      fileId,
      fileBucket: fileId ? "books" : null,
      fileSizeBytes: fileId ? fileSizeBytes : null,
      description: (fd.get("description") as string)?.trim() || null,
      publishedYear: (fd.get("publishedYear") as string)?.trim() || null,
      priority: Number(fd.get("priority") || 0),
    };

    if (!payload.title && !payload.titleLimbu) {
      toast.error("शीर्षक चाहिन्छ");
      return;
    }

    setPending(true);
    try {
      const url = book ? `/api/admin/books/${book.$id}` : "/api/admin/books";
      const res = await fetch(url, {
        method: book ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "सुरक्षित गर्न असफल");
        return;
      }
      toast.success(book ? "अद्यावधिक भयो" : "रचना थपियो");
      router.push("/admin/books");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      {/* Language + genre */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>भाषा / शाखा</Label>
          <Select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value as Language);
              setGenre("");
            }}
            className="mt-1"
          >
            <option value="yakthung">याक्थुङ (Yakthung)</option>
            <option value="nepali">नेपाली (Nepali)</option>
            <option value="english">अङ्ग्रेजी (English)</option>
          </Select>
        </div>
        <div>
          <Label>विधा</Label>
          <Select value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1">
            <option value="">— छान्नुहोस् —</option>
            {genres.map((g) => (
              <option key={g.key} value={g.key}>
                {g.ne} ({g.en})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Titles — the primary input matches the selected language, with the
          others available as optional alternates. */}
      {language === "yakthung" && (
        <div>
          <Label>शीर्षक (याक्थुङ / लिम्बू लिपि)</Label>
          <div className="mt-1">
            <ScriptField key="yak-title" script="limbu" defaultValue={titleLimbu} onValueChange={setTitleLimbu} placeholder="ᤛᤡᤖᤡᤈᤣᤅ᤺ᤠ" />
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">याक्थुङ रचनाहरूमा यही शीर्षक देखिन्छ।</p>
        </div>
      )}

      {(language === "nepali" || language === "yakthung") && (
        <div>
          <Label>शीर्षक (नेपाली/देवनागरी){language === "yakthung" ? " — वैकल्पिक" : ""}</Label>
          <div className="mt-1">
            <ScriptField key="nep-title" script="nepali" defaultValue={title} onValueChange={setTitle} placeholder="रचनाको शीर्षक" />
          </div>
        </div>
      )}

      {language === "english" && (
        <div>
          <Label htmlFor="titleEnMain">Title (English)</Label>
          <Input
            id="titleEnMain"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            placeholder="Book title"
          />
        </div>
      )}

      {language !== "english" && (
        <div>
          <Label htmlFor="titleEn">Title (English) — optional</Label>
          <Input id="titleEn" name="titleEn" defaultValue={book?.titleEn ?? ""} className="mt-1" placeholder="Optional" />
        </div>
      )}

      {/* Author */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>सर्जक</Label>
          <Select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="mt-1">
            <option value="">— सर्जक रेकर्डबाट छान्नुहोस् —</option>
            {authors.map((a) => (
              <option key={a.$id} value={a.$id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="authorName">वा सर्जकको नाम (टाइप गर्नुहोस्)</Label>
          <Input
            id="authorName"
            name="authorName"
            defaultValue={authorId ? "" : book?.authorName ?? ""}
            className="mt-1"
            placeholder="रेकर्ड नभए मात्र"
            disabled={!!authorId}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="publishedYear">प्रकाशन वर्ष</Label>
          <Input id="publishedYear" name="publishedYear" defaultValue={book?.publishedYear ?? ""} className="mt-1" placeholder="२०८०" />
        </div>
        <div>
          <Label htmlFor="priority">प्राथमिकता (क्रम)</Label>
          <Input id="priority" name="priority" type="number" defaultValue={book?.priority ?? 0} className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="description">विवरण</Label>
        <Textarea id="description" name="description" defaultValue={book?.description ?? ""} className="mt-1 min-h-32" placeholder="रचनाको छोटो परिचय…" />
      </div>

      {/* Uploads */}
      <div className="grid gap-5 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-2">
        <FileUpload
          bucket="general"
          accept="image/*"
          kind="image"
          currentId={book?.coverImageId}
          onUploaded={(id) => setCoverImageId(id)}
          label="आवरण चित्र (Cover)"
        />
        <FileUpload
          bucket="books"
          accept="application/pdf,.pdf"
          kind="pdf"
          currentId={book?.fileId}
          onUploaded={(id, size) => {
            setFileId(id);
            setFileSizeBytes(size);
          }}
          label="पुस्तक PDF"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "..." : book ? "अद्यावधिक गर्नुहोस्" : "थप्नुहोस्"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          रद्द गर्नुहोस्
        </Button>
      </div>
    </form>
  );
}
