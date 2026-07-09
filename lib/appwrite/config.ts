export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  buckets: {
    // PDF bucket for downloadable/readable books.
    books: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BOOKS!,
    // Reused image buckets from the shared project.
    gallery: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_GALLERY!,
    general: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_GENERAL!,
  },
  collections: {
    authors: "authors",
    books: "books",
    galleries: "galleries",
    galleryImages: "gallery_images",
    pages: "pages",
    accessLogs: "access_logs",
  },
  teams: {
    admin: "admin",
  },
} as const;

export type BucketKey = keyof typeof appwriteConfig.buckets;

export const ADMIN_LABEL = "admin";
