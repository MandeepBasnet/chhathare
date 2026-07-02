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
import type { Author, Book, BookStatus } from "@/lib/types";

// Shared by the admin panel and the author studio.
//  • mode="admin"  → pick any author, control publish status.
//  • mode="author" → author is locked to `fixedAuthor`; saves as a draft for review.
export function BookForm({
  book,
  mode = "admin",
  authors = [],
  fixedAuthor,
}: {
  book?: Book;
  mode?: "admin" | "author";
  authors?: Author[];
  fixedAuthor?: Author;
}) {
  const router = useRouter();
  const isAuthor = mode === "author";
  const uploadEndpoint = isAuthor ? "/api/studio/upload" : "/api/admin/upload";
  const listUrl = isAuthor ? "/studio" : "/admin/books";

  const [pending, setPending] = React.useState(false);
  const [language, setLanguage] = React.useState<Language>(book?.language ?? "yakthung");
  const [genre, setGenre] = React.useState(book?.genre ?? "");
  const [title, setTitle] = React.useState(book?.title ?? "");
  const [titleLimbu, setTitleLimbu] = React.useState(book?.titleLimbu ?? "");
  const [authorId, setAuthorId] = React.useState(book?.authorId ?? "");
  const [status, setStatus] = React.useState<BookStatus>((book?.status as BookStatus) ?? "published");
  const [coverImageId, setCoverImageId] = React.useState<string | null>(book?.coverImageId ?? null);
  const [fileId, setFileId] = React.useState<string | null>(book?.fileId ?? null);
  const [fileSizeBytes, setFileSizeBytes] = React.useState<number | null>(book?.fileSizeBytes ?? null);

  const genres = GENRES_BY_LANGUAGE[language];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const selectedAuthor = authors.find((a) => a.$id === authorId);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      titleLimbu: titleLimbu.trim() || null,
      titleEn: (fd.get("titleEn") as string)?.trim() || null,
      language,
      genre: genre || null,
      coverImageId,
      coverBucket: coverImageId ? "general" : null,
      fileId,
      fileBucket: fileId ? "books" : null,
      fileSizeBytes: fileId ? fileSizeBytes : null,
      description: (fd.get("description") as string)?.trim() || null,
      publishedYear: (fd.get("publishedYear") as string)?.trim() || null,
    };

    if (isAuthor) {
      // author + status are enforced server-side; nothing to send.
    } else {
      payload.authorId = authorId || null;
      payload.authorName = selectedAuthor?.name || (fd.get("authorName") as string)?.trim() || null;
      payload.priority = Number(fd.get("priority") || 0);
      payload.status = status;
    }

    if (!payload.title && !payload.titleLimbu) {
      toast.error("शीर्षक चाहिन्छ");
      return;
    }

    setPending(true);
    try {
      const base = isAuthor ? "/api/studio/books" : "/api/admin/books";
      const url = book ? `${base}/${book.$id}` : base;
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
      toast.success(
        isAuthor
          ? "पेश गरियो — एडमिनको स्वीकृतिपछि साइटमा देखिनेछ"
          : book
            ? "अद्यावधिक भयो"
            : "रचना थपियो",
      );
      router.push(listUrl);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
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

      {/* Titles — primary input matches the language; others are optional. */}
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
          <Input id="titleEnMain" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" placeholder="Book title" />
        </div>
      )}

      {language !== "english" && (
        <div>
          <Label htmlFor="titleEn">Title (English) — optional</Label>
          <Input id="titleEn" name="titleEn" defaultValue={book?.titleEn ?? ""} className="mt-1" placeholder="Optional" />
        </div>
      )}

      {/* Author — admin picks; author is locked to themselves. */}
      {isAuthor ? (
        <div>
          <Label>सर्जक</Label>
          <div className="mt-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--color-muted)]">
            {fixedAuthor?.name} <span className="text-xs">(तपाईं)</span>
          </div>
        </div>
      ) : (
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
      )}

      {/* Meta */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="publishedYear">प्रकाशन वर्ष</Label>
          <Input id="publishedYear" name="publishedYear" defaultValue={book?.publishedYear ?? ""} className="mt-1" placeholder="२०८०" />
        </div>
        {!isAuthor && (
          <div>
            <Label htmlFor="priority">प्राथमिकता (क्रम)</Label>
            <Input id="priority" name="priority" type="number" defaultValue={book?.priority ?? 0} className="mt-1" />
          </div>
        )}
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
          endpoint={uploadEndpoint}
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
          endpoint={uploadEndpoint}
        />
      </div>

      {/* Publish control */}
      {isAuthor ? (
        <p className="rounded-md bg-mountain-50 px-3 py-2 text-sm text-mountain-700">
          पेश गरेपछि रचना एडमिनको समीक्षामा जान्छ; स्वीकृत भएपछि मात्र साइटमा देखिन्छ।
        </p>
      ) : (
        <div>
          <Label>स्थिति</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)} className="mt-1 max-w-xs">
            <option value="published">प्रकाशित (साइटमा देखिने)</option>
            <option value="draft">ड्राफ्ट (लुकेको)</option>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "..." : isAuthor ? (book ? "पुनः पेश गर्नुहोस्" : "पेश गर्नुहोस्") : book ? "अद्यावधिक गर्नुहोस्" : "थप्नुहोस्"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          रद्द गर्नुहोस्
        </Button>
      </div>
    </form>
  );
}
