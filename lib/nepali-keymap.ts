// Nepali (Devanagari) input support. Two layouts, HamroKeyboard-style, switchable
// at runtime:
//   1. TRADITIONAL  — fixed physical-key → Devanagari glyph mapping (Remington-based).
//      Mirrors the Limbu keymap so the same keycap component can render it.
//   2. ROMANIZED    — phonetic transliteration (type "namaste" → नमस्ते) via
//      `romanToDevanagari()`. Keys show roman letters; a per-word buffer is
//      transliterated live by the input component.
//
// Reviewed against the starter kit: the starter's `e` key had identical base and
// shift (both े); its shift is corrected to ै (the ऐ-matra) below.

export const DOTTED = "◌"; // base for displaying combining marks (matras) on a key

export type K = { k: string; base: string; shift?: string };

// ─── Traditional layout (fixed keys) ────────────────────────────────────────
export const ROWS: K[][] = [
  [
    { k: "1", base: "१" }, { k: "2", base: "२" }, { k: "3", base: "३" },
    { k: "4", base: "४" }, { k: "5", base: "५" }, { k: "6", base: "६" },
    { k: "7", base: "७" }, { k: "8", base: "८" }, { k: "9", base: "९" },
    { k: "0", base: "०" },
  ],
  [
    { k: "q", base: "त्र", shift: "त्त" }, { k: "w", base: "ौ", shift: "औ" },
    { k: "e", base: "े", shift: "ै" }, { k: "r", base: "र", shift: "ऱ" },
    { k: "t", base: "त", shift: "थ" }, { k: "y", base: "य", shift: "इ" },
    { k: "u", base: "ु", shift: "ू" }, { k: "i", base: "ि", shift: "ी" },
    { k: "o", base: "ो", shift: "ओ" }, { k: "p", base: "प", shift: "फ" },
  ],
  [
    { k: "a", base: "ा", shift: "आ" }, { k: "s", base: "स", shift: "श" },
    { k: "d", base: "द", shift: "ध" }, { k: "f", base: "ङ", shift: "ञ" },
    { k: "g", base: "ग", shift: "घ" }, { k: "h", base: "ह", shift: "ः" },
    { k: "j", base: "ज", shift: "झ" }, { k: "k", base: "क", shift: "ख" },
    { k: "l", base: "ल", shift: "ळ" },
  ],
  [
    { k: "z", base: "ष", shift: "क्ष" }, { k: "x", base: "अ", shift: "ं" },
    { k: "c", base: "च", shift: "छ" }, { k: "v", base: "व", shift: "ऋ" },
    { k: "b", base: "ब", shift: "भ" }, { k: "n", base: "न", shift: "ण" },
    { k: "m", base: "म", shift: "ँ" },
  ],
];

export const KEYMAP: Record<string, K> = Object.fromEntries(
  ROWS.flat().map((key) => [key.k, key]),
);

// Devanagari combining vowel signs (matras) + anusvara/chandrabindu/virama range.
export function isCombiningDevanagari(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  // matras U+093E–U+094D, plus anusvara/candrabindu/visarga U+0900–U+0903
  return (cp >= 0x093e && cp <= 0x094d) || (cp >= 0x0900 && cp <= 0x0903);
}

// ─── Romanized (phonetic) layout ─────────────────────────────────────────────
// On-screen keycaps for the phonetic keyboard. base = roman char inserted into
// the composition buffer; shift = the uppercase variant (retroflex / long vowels).
export const ROMAN_ROWS: K[][] = [
  [
    { k: "1", base: "1" }, { k: "2", base: "2" }, { k: "3", base: "3" },
    { k: "4", base: "4" }, { k: "5", base: "5" }, { k: "6", base: "6" },
    { k: "7", base: "7" }, { k: "8", base: "8" }, { k: "9", base: "9" },
    { k: "0", base: "0" },
  ],
  [
    { k: "q", base: "q", shift: "Q" }, { k: "w", base: "w", shift: "W" },
    { k: "e", base: "e", shift: "E" }, { k: "r", base: "r", shift: "R" },
    { k: "t", base: "t", shift: "T" }, { k: "y", base: "y", shift: "Y" },
    { k: "u", base: "u", shift: "U" }, { k: "i", base: "i", shift: "I" },
    { k: "o", base: "o", shift: "O" }, { k: "p", base: "p", shift: "P" },
  ],
  [
    { k: "a", base: "a", shift: "A" }, { k: "s", base: "s", shift: "S" },
    { k: "d", base: "d", shift: "D" }, { k: "f", base: "f", shift: "F" },
    { k: "g", base: "g", shift: "G" }, { k: "h", base: "h", shift: "H" },
    { k: "j", base: "j", shift: "J" }, { k: "k", base: "k", shift: "K" },
    { k: "l", base: "l", shift: "L" },
  ],
  [
    { k: "z", base: "z", shift: "Z" }, { k: "x", base: "x", shift: "X" },
    { k: "c", base: "c", shift: "C" }, { k: "v", base: "v", shift: "V" },
    { k: "b", base: "b", shift: "B" }, { k: "n", base: "n", shift: "N" },
    { k: "m", base: "m", shift: "M" },
  ],
];

// Consonants (roman → base Devanagari consonant). Longest matches win.
const CONSONANTS: Record<string, string> = {
  ksh: "क्ष", kSh: "क्ष", x: "क्ष", gy: "ज्ञ", gny: "ज्ञ", shr: "श्र",
  kh: "ख", gh: "घ", ng: "ङ", chh: "छ", Ch: "छ", ch: "च", jh: "झ",
  Th: "ठ", Dh: "ढ", th: "थ", dh: "ध", ph: "फ", bh: "भ", sh: "श",
  Sh: "ष", ny: "ञ",
  k: "क", g: "ग", c: "च", j: "ज", T: "ट", D: "ड", N: "ण",
  t: "त", d: "द", n: "न", p: "प", f: "फ", b: "ब", m: "म",
  y: "य", r: "र", l: "ल", w: "व", v: "व", s: "स", h: "ह",
};

// Vowels: independent form (word-initial / after vowel) + matra (after consonant).
interface Vowel { indep: string; matra: string }
const VOWELS: Record<string, Vowel> = {
  aa: { indep: "आ", matra: "ा" }, A: { indep: "आ", matra: "ा" },
  ai: { indep: "ऐ", matra: "ै" }, au: { indep: "औ", matra: "ौ" },
  ee: { indep: "ई", matra: "ी" }, ii: { indep: "ई", matra: "ी" }, I: { indep: "ई", matra: "ी" },
  oo: { indep: "ऊ", matra: "ू" }, uu: { indep: "ऊ", matra: "ू" }, U: { indep: "ऊ", matra: "ू" },
  Ri: { indep: "ऋ", matra: "ृ" },
  a: { indep: "अ", matra: "" }, // inherent — no matra
  i: { indep: "इ", matra: "ि" }, u: { indep: "उ", matra: "ु" },
  e: { indep: "ए", matra: "े" }, o: { indep: "ओ", matra: "ो" },
};

// Standalone signs.
const SIGNS: Record<string, string> = {
  M: "ं", H: "ः", "~": "ँ", "^": "ँ",
};

const DIGITS: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

const VIRAMA = "्";

// Keys sorted longest-first for greedy matching.
const CONS_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

function matchAt(roman: string, i: number, keys: string[]): string | null {
  for (const key of keys) {
    if (roman.startsWith(key, i)) return key;
  }
  return null;
}

// Transliterate a run of roman text to Devanagari (phonetic scheme).
// Consonant clusters get an implicit virama; a trailing bare consonant keeps its
// inherent "a" (e.g. "kml" → क्म्ल, "kamala" → कमल).
export function romanToDevanagari(roman: string): string {
  let out = "";
  let i = 0;
  let bareConsonant = false; // a consonant was emitted with no following vowel yet

  while (i < roman.length) {
    const cKey = matchAt(roman, i, CONS_KEYS);
    if (cKey) {
      if (bareConsonant) out += VIRAMA; // join two consonants
      out += CONSONANTS[cKey];
      i += cKey.length;
      bareConsonant = true;
      const vKey = matchAt(roman, i, VOWEL_KEYS);
      if (vKey) {
        out += VOWELS[vKey].matra; // "" for inherent 'a'
        i += vKey.length;
        bareConsonant = false;
      }
      continue;
    }
    const vKey = matchAt(roman, i, VOWEL_KEYS);
    if (vKey) {
      out += VOWELS[vKey].indep;
      i += vKey.length;
      bareConsonant = false;
      continue;
    }
    const ch = roman[i];
    if (SIGNS[ch]) {
      out += SIGNS[ch];
      bareConsonant = false;
    } else if (DIGITS[ch]) {
      out += DIGITS[ch];
      bareConsonant = false;
    } else {
      out += ch; // spaces, punctuation, unknown → literal
      bareConsonant = false;
    }
    i += 1;
  }
  return out;
}
