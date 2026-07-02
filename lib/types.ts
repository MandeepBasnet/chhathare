import type { Language } from "./taxonomy";

export interface AppwriteDoc {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Author extends AppwriteDoc {
  slug: string;
  name: string;
  nameLimbu?: string | null;
  nameEn?: string | null;
  bio?: string | null;
  photoId?: string | null;
  searchIndex?: string | null;
  userId?: string | null; // linked Appwrite login account
}

export type BookStatus = "draft" | "published";

export interface Book extends AppwriteDoc {
  slug: string;
  title: string;
  titleLimbu?: string | null;
  titleEn?: string | null;
  language: Language;
  genre?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  coverImageId?: string | null;
  coverBucket?: string | null;
  fileId?: string | null;
  fileBucket?: string | null;
  fileSizeBytes?: number | null;
  description?: string | null;
  publishedYear?: string | null;
  priority?: number | null;
  searchIndex?: string | null;
  status?: BookStatus | null;
}

export interface Gallery extends AppwriteDoc {
  title: string;
  slug: string;
  description?: string | null;
  coverImageId?: string | null;
}

export interface GalleryImage extends AppwriteDoc {
  galleryId: string;
  imageId: string;
  caption?: string | null;
  order?: number | null;
}

export interface SitePage extends AppwriteDoc {
  slug: string;
  title: string;
  content?: string | null;
}
