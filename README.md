# छथरे लिम्बु साहित्य · Chhathare Limbu Sahitya

A digital literature library for the Chhathare Limbu community — **Yakthung (याक्थुङ)**,
**Nepali (नेपाली)** and **English (अङ्ग्रेजी)** works, each readable and downloadable as PDF.

## Features

- **Two-branch content tree** from the client's diagram — याक्थुङ (साम्मिला/खेदा/निसाम्भे,
  rendered in Noto Sans Limbu) and नेपाली (कथा, कविता, उपन्यास, गीत, गजल, हाइकु, in Mukta),
  plus an English branch.
- **PDF per work** — in-browser reader + download, uploaded through the admin/author panel.
- **Search** by work title (रचना) or author name (सर्जक) via an Appwrite fulltext index.
- **On-screen keyboards** — a Sirijonga (Limbu) keyboard and a Nepali (Devanagari) keyboard
  with both **Traditional** and **Romanized (phonetic)** modes, HamroKeyboard-style.
- **Gallery**, and a **cross-site link bar** to the three sister sites.
- **Admin dashboard** (team-gated) for authors, works, galleries, and PDF uploads.
- **Author studio** — admin-provisioned author logins can add/edit their own works
  (submitted as drafts for admin approval).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Appwrite
(`node-appwrite` server + `appwrite` client) · Mukta + Noto Sans Limbu fonts.

## Setup

```bash
npm install
cp .env.example .env        # then fill in APPWRITE_API_KEY (never commit .env)
node scripts/provision-appwrite.mjs   # creates DB, collections, indexes, PDF bucket
node scripts/add-english-language.mjs # adds English to the language enum
node scripts/add-author-roles.mjs     # adds author logins + draft/publish status
npm run dev
```

## Appwrite

Shares the existing project (`6a192900003bfd6eab99`, team `admin`) with a **new**
database `chhathare-sahitya` and a PDF bucket `sahitya-books`. Collections:
`authors`, `books`, `galleries`, `gallery_images`, `pages`.

## Environment

See `.env.example`. `.env` holds the server API key and is git-ignored.
