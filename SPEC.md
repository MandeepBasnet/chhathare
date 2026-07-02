# छथरे लिम्बु साहित्य (Chhathare Limbu Sahitya) — Build Spec

A Limbu/Nepali literature library. New repo, but reuses the **same Appwrite
project** as Khajum Chongbang (only a new database + a books PDF bucket are added).

## Stack (match Khajum Chongbang)
- Next.js 16 + React 19, Tailwind v4, `node-appwrite` (server) + `appwrite` (client)
- Fonts: **Mukta** (Devanagari/Nepali) + **Noto Sans Limbu** (Yakthung), set as
  `--font-mukta` / `--font-noto-limbu` in the root layout.

## Requirements → implementation

| # | Requirement (from the diagram) | Implementation |
|---|---|---|
| Tree | साहित्य → **याक्थुङ** (by genre: साम्मिला/खेदा/निसाम्भे) & **नेपाली** (कथा, कविता, उपन्यास, गीत, गजल, हाइकु) | `books.language` enum + `books.genre`; taxonomy in `lib/taxonomy.ts` |
| 1 | ~10 books, scalable | `books` collection, no cap |
| 2 | Yakthung font in Yakthung section, Nepali font in Nepali section + **Nepali keyboard like the Yakthung one** | Noto Sans Limbu + Mukta; on-screen keyboards (Limbu = copy; **Nepali = build**) |
| 3 | Cross-links: Khajum Chokbang, Sabayelhang Network, this site | `lib/site-links.ts` (Sabayelhang URL TBD) |
| 4 | Gallery + search by work title **or** author name | `galleries`/`gallery_images`; `books.searchIndex` fulltext holds `title + authorName` |
| PDF | Books are downloadable + readable | `books.fileId` → `sahitya-books` PDF bucket; render with a PDF viewer |

## Appwrite (shared project)
- Endpoint `https://appwrite.itsoch.com/v1`, project `6a192900003bfd6eab99`, team `admin` — all reused.
- **New** database `chhathare-sahitya`; **new** bucket `sahitya-books` (pdf, 30 MB).
- Provision: `node scripts/provision-appwrite.mjs` (idempotent). Needs `.env` with the API key.

### Collections
- **authors** — slug, name, nameLimbu, nameEn, bio, photoId, searchIndex(fulltext)
- **books** — slug, title/titleLimbu/titleEn, language(enum), genre, authorId, authorName,
  coverImageId/coverBucket, fileId/fileBucket/fileSizeBytes, description, publishedYear,
  priority, searchIndex(fulltext)
- **galleries**, **gallery_images**, **pages** — same shapes as Khajum Chongbang

## Copy these files from the Khajum Chongbang repo (`web/`)
- `app/fonts/NotoSansLimbu-Regular.ttf`
- `lib/limbu-keymap.ts`, `components/admin/limbu-keyboard.tsx`, `components/admin/limbu-input.tsx`
- Font wiring from `app/layout.tsx` (Mukta + local Noto Limbu)
- `lib/appwrite/*` (config/server/client/storage-url) — swap `collections` to the ones above

## Net-new work
1. **Nepali (Devanagari) on-screen keyboard** — mirror the 3 Limbu keyboard files with a
   Devanagari keymap (start from `lib/nepali-keymap.ts` in this kit — REVIEW the mapping).
2. **Book PDF upload (admin) + in-browser reader + download** (bucket `sahitya-books`).
3. **Search bar** querying `books.searchIndex` (title + author) via `Query.search`.
4. **Gallery** pages, **two-branch browse** (Yakthung / Nepali → genre → books), **3-site link bar**.

## Files in this starter kit
- `.env.example` — copy to `.env`, add the API key (already known; keep out of git)
- `scripts/provision-appwrite.mjs` — creates the DB, collections, indexes, PDF bucket
- `lib/taxonomy.ts` — language + genre lists from the diagram
- `lib/site-links.ts` — the 3 cross-site links
- `lib/nepali-keymap.ts` — starter Devanagari keymap (review before shipping)
