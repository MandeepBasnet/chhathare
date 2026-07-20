import "server-only";
import { Query } from "node-appwrite";
import { adminApi } from "./server";
import { appwriteConfig } from "./config";
import type { AccessLog, Author, Book, BookStatus, Gallery, GalleryImage, SitePage } from "@/lib/types";
import type { Language } from "@/lib/taxonomy";

const DB = appwriteConfig.databaseId;
const C = appwriteConfig.collections;

function asBook(d: Record<string, unknown>): Book {
  return d as unknown as Book;
}
function asAuthor(d: Record<string, unknown>): Author {
  return d as unknown as Author;
}

// ─── Books ───────────────────────────────────────────────────────────────

export async function listBooks(opts: {
  language?: Language;
  genre?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  // Public callers default to "published"; admin/author views pass "all" or "draft".
  status?: BookStatus | "all";
} = {}): Promise<{ items: Book[]; total: number }> {
  const status = opts.status ?? "published";
  const queries: string[] = [Query.limit(opts.limit ?? 60)];
  if (opts.offset) queries.push(Query.offset(opts.offset));
  if (opts.language) queries.push(Query.equal("language", opts.language));
  if (opts.genre) queries.push(Query.equal("genre", opts.genre));
  if (opts.authorId) queries.push(Query.equal("authorId", opts.authorId));
  if (opts.search) queries.push(Query.search("searchIndex", opts.search));
  if (status !== "all") queries.push(Query.equal("status", status));
  queries.push(Query.orderDesc("priority"));
  queries.push(Query.orderDesc("$createdAt"));
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries,
  });
  return { items: res.documents.map(asBook), total: res.total };
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries: [Query.equal("slug", decodeURIComponent(slug)), Query.limit(1)],
  });
  return res.documents[0] ? asBook(res.documents[0]) : null;
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const res = await adminApi.databases().getDocument({
      databaseId: DB,
      collectionId: C.books,
      documentId: id,
    });
    return asBook(res);
  } catch {
    return null;
  }
}

export async function countBooksByLanguage(language: Language): Promise<number> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries: [Query.equal("language", language), Query.equal("status", "published"), Query.limit(1)],
  });
  return res.total;
}

export async function searchBooks(term: string, limit = 40): Promise<Book[]> {
  const q = term.trim();
  if (!q) return [];
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries: [Query.search("searchIndex", q), Query.equal("status", "published"), Query.limit(limit)],
  });
  return res.documents.map(asBook);
}

export async function recentBooks(limit = 8): Promise<Book[]> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries: [Query.equal("status", "published"), Query.orderDesc("$createdAt"), Query.limit(limit)],
  });
  return res.documents.map(asBook);
}

// Distinct genres actually present in published books for a language, with
// counts. Used to surface custom ("Others") categories as filters alongside the
// predefined ones. Scans in pages of 100 (fine for up to a few hundred books).
export async function genresInLanguage(
  language: Language,
): Promise<{ key: string; count: number }[]> {
  const counts = new Map<string, number>();
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const queries = [
      Query.equal("language", language),
      Query.equal("status", "published"),
      Query.orderAsc("$id"),
      Query.limit(100),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await adminApi.databases().listDocuments({ databaseId: DB, collectionId: C.books, queries });
    for (const d of res.documents) {
      const g = (d as unknown as Book).genre;
      if (g) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}

// Count books pending admin review (author drafts).
export async function countPendingBooks(): Promise<number> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.books,
    queries: [Query.equal("status", "draft"), Query.limit(1)],
  });
  return res.total;
}

// ─── Authors ───────────────────────────────────────────────────────────────

export async function listAuthors(limit = 200): Promise<Author[]> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.authors,
    queries: [Query.orderAsc("name"), Query.limit(limit)],
  });
  return res.documents.map(asAuthor);
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.authors,
    queries: [Query.equal("slug", decodeURIComponent(slug)), Query.limit(1)],
  });
  return res.documents[0] ? asAuthor(res.documents[0]) : null;
}

export async function getAuthorByUserId(userId: string): Promise<Author | null> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.authors,
    queries: [Query.equal("userId", userId), Query.limit(1)],
  });
  return res.documents[0] ? asAuthor(res.documents[0]) : null;
}

export async function getAuthorById(id: string): Promise<Author | null> {
  try {
    const res = await adminApi.databases().getDocument({
      databaseId: DB,
      collectionId: C.authors,
      documentId: id,
    });
    return asAuthor(res);
  } catch {
    return null;
  }
}

// ─── Galleries ───────────────────────────────────────────────────────────────

export async function listGalleries(): Promise<Gallery[]> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.galleries,
    queries: [Query.orderDesc("$createdAt"), Query.limit(60)],
  });
  const galleries = res.documents as unknown as Gallery[];
  // Galleries don't store an explicit cover — fall back to their first image so
  // both the admin list and the public index can show a thumbnail.
  const missing = galleries.filter((g) => !g.coverImageId);
  await Promise.all(
    missing.map(async (g) => {
      const imgs = await adminApi.databases().listDocuments({
        databaseId: DB,
        collectionId: C.galleryImages,
        queries: [Query.equal("galleryId", g.$id), Query.orderAsc("order"), Query.limit(1)],
      });
      const first = imgs.documents[0] as unknown as GalleryImage | undefined;
      if (first) g.coverImageId = first.imageId;
    }),
  );
  return galleries;
}

export async function getGalleryBySlug(
  slug: string,
): Promise<{ gallery: Gallery; images: GalleryImage[] } | null> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.galleries,
    queries: [Query.equal("slug", decodeURIComponent(slug)), Query.limit(1)],
  });
  if (!res.documents[0]) return null;
  const gallery = res.documents[0] as unknown as Gallery;
  const imgs = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.galleryImages,
    queries: [Query.equal("galleryId", gallery.$id), Query.orderAsc("order"), Query.limit(300)],
  });
  return { gallery, images: imgs.documents as unknown as GalleryImage[] };
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  try {
    const doc = await adminApi.databases().getDocument({
      databaseId: DB,
      collectionId: C.galleries,
      documentId: id,
    });
    return doc as unknown as Gallery;
  } catch {
    return null;
  }
}

// How many images each gallery actually holds, keyed by galleryId. A gallery's
// thumbnail can come from its cover alone, so a cover-only gallery looks
// populated in every listing while its detail page is empty — the admin list
// uses this to surface that. One paged scan beats a query per gallery.
export async function galleryImageCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const queries = [Query.orderAsc("$id"), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await adminApi.databases().listDocuments({
      databaseId: DB,
      collectionId: C.galleryImages,
      queries,
    });
    for (const d of res.documents) {
      const gid = (d as unknown as GalleryImage).galleryId;
      if (gid) counts.set(gid, (counts.get(gid) ?? 0) + 1);
    }
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return counts;
}

export async function listGalleryImages(galleryId: string): Promise<GalleryImage[]> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.galleryImages,
    queries: [Query.equal("galleryId", galleryId), Query.orderAsc("order"), Query.limit(300)],
  });
  return res.documents as unknown as GalleryImage[];
}

// ─── Pages / settings ──────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<SitePage | null> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.pages,
    queries: [Query.equal("slug", slug), Query.limit(1)],
  });
  return (res.documents[0] as unknown as SitePage) || null;
}

// ─── Access logs (admin research) ───────────────────────────────────────────

export async function listAccessLogs(limit = 200): Promise<AccessLog[]> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.accessLogs,
    queries: [Query.orderDesc("$createdAt"), Query.limit(limit)],
  });
  return res.documents as unknown as AccessLog[];
}

export async function countAccessLogs(): Promise<number> {
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.accessLogs,
    queries: [Query.limit(1)],
  });
  return res.total;
}

// Access logs scoped to a specific set of books — used by the author studio so
// an author only sees readership for their own works.
export async function listAccessLogsForBooks(bookIds: string[], limit = 200): Promise<AccessLog[]> {
  if (bookIds.length === 0) return [];
  const res = await adminApi.databases().listDocuments({
    databaseId: DB,
    collectionId: C.accessLogs,
    queries: [Query.equal("bookId", bookIds), Query.orderDesc("$createdAt"), Query.limit(limit)],
  });
  return res.documents as unknown as AccessLog[];
}
