// Language + genre taxonomy from the site requirement diagram (साहित्य tree).
// Yakthung genres use their Limbu/Yakthung names; Nepali genres use Nepali names.

export type Language = "yakthung" | "nepali" | "english";

export interface Genre {
  key: string;   // stored in books.genre
  ne: string;    // Nepali label
  en: string;    // English label
}

// याक्थुङ — विधागत रूपमा: साम्मिला (कविता), खेदा (कथा), निसाम्भे (उपन्यास) इत्यादी
export const YAKTHUNG_GENRES: Genre[] = [
  { key: "sammila", ne: "साम्मिला (कविता)", en: "Poetry" },
  { key: "kheda", ne: "खेदा (कथा)", en: "Story" },
  { key: "nisambhe", ne: "निसाम्भे (उपन्यास)", en: "Novel" },
  { key: "others", ne: "अन्य", en: "Others" },
];

// नेपाली: कथा, कविता, उपन्यास, गीत, गजल, हाइकु इत्यादी
export const NEPALI_GENRES: Genre[] = [
  { key: "katha", ne: "कथा", en: "Story" },
  { key: "kavita", ne: "कविता", en: "Poetry" },
  { key: "upanyas", ne: "उपन्यास", en: "Novel" },
  { key: "geet", ne: "गीत", en: "Song" },
  { key: "ghazal", ne: "गजल", en: "Ghazal" },
  { key: "haiku", ne: "हाइकु", en: "Haiku" },
  { key: "others", ne: "अन्य", en: "Others" },
];

// English works: standard literary genres.
export const ENGLISH_GENRES: Genre[] = [
  { key: "poetry", ne: "कविता", en: "Poetry" },
  { key: "story", ne: "कथा", en: "Story" },
  { key: "novel", ne: "उपन्यास", en: "Novel" },
  { key: "essay", ne: "निबन्ध", en: "Essay" },
  { key: "others", ne: "अन्य", en: "Others" },
];

export const GENRES_BY_LANGUAGE: Record<Language, Genre[]> = {
  yakthung: YAKTHUNG_GENRES,
  nepali: NEPALI_GENRES,
  english: ENGLISH_GENRES,
};

export const LANGUAGE_LABELS: Record<Language, { ne: string; en: string; fontVar: string }> = {
  // Yakthung renders in Noto Sans Limbu; Nepali in Mukta; English in the Latin sans.
  yakthung: { ne: "याक्थुङ", en: "Yakthung", fontVar: "var(--font-noto-limbu)" },
  nepali: { ne: "नेपाली", en: "Nepali", fontVar: "var(--font-mukta)" },
  english: { ne: "अङ्ग्रेजी", en: "English", fontVar: "var(--font-mukta)" },
};

export const LANGUAGES: Language[] = ["yakthung", "nepali", "english"];

export function isLanguage(v: string): v is Language {
  return v === "yakthung" || v === "nepali" || v === "english";
}

// The Yakthung branch renders in the Limbu font; Nepali in the Devanagari font.
export function isLimbuScript(language: Language): boolean {
  return language === "yakthung";
}

export function genreLabel(language: Language, key: string | null | undefined): string {
  if (!key) return "";
  const g = GENRES_BY_LANGUAGE[language].find((x) => x.key === key);
  return g ? g.ne : key;
}

export function getGenre(language: Language, key: string): Genre | undefined {
  return GENRES_BY_LANGUAGE[language].find((x) => x.key === key);
}
