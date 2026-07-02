// Shared Sirijonga (Yakthung/Limbu) keyboard map. A QWERTY physical layout maps
// to real Unicode Limbu (U+1900–U+194F). Used by the Limbu on-screen keyboard
// and Limbu text fields so there is one source of truth.

export const DOTTED = "◌"; // base for displaying combining marks on a key

export type K = { k: string; base: string; shift?: string };

// Rows mirror a QWERTY board. base = unshifted glyph, shift = shifted glyph.
export const ROWS: K[][] = [
  [
    { k: "1", base: "᥇", shift: "ᤰ" }, { k: "2", base: "᥈", shift: "ᤱ" }, { k: "3", base: "᥉", shift: "ᤲ" },
    { k: "4", base: "᥊", shift: "ᤳ" }, { k: "5", base: "᥋", shift: "ᤴ" }, { k: "6", base: "᥌", shift: "ᤵ" },
    { k: "7", base: "᥍", shift: "ᤶ" }, { k: "8", base: "᥎", shift: "ᤷ" }, { k: "9", base: "᥏", shift: "ᤸ" },
    { k: "0", base: "᥆", shift: "᤹" },
  ],
  [
    { k: "q", base: "ᤝ", shift: "ᤩ" }, { k: "w", base: "ᤘ", shift: "ᤫ" }, { k: "e", base: "ᤧ", shift: "ᤣ" },
    { k: "r", base: "ᤖ", shift: "ᤪ" }, { k: "t", base: "ᤋ", shift: "ᤌ" }, { k: "y", base: "ᤕ", shift: "᤺" },
    { k: "u", base: "ᤢ", shift: "ᤦ" }, { k: "i", base: "ᤡ", shift: "ᤤ" }, { k: "o", base: "ᤨ", shift: "ᤥ" },
    { k: "p", base: "ᤐ", shift: "ᤑ" },
  ],
  [
    { k: "a", base: "ᤠ", shift: "᤻" }, { k: "s", base: "ᤛ", shift: "ᤙ" }, { k: "d", base: "ᤍ", shift: "ᤎ" },
    { k: "f", base: "ᤞ" }, { k: "g", base: "ᤃ", shift: "ᤄ" }, { k: "h", base: "ᤜ" },
    { k: "j", base: "ᤈ", shift: "ᤉ" }, { k: "k", base: "ᤁ", shift: "ᤂ" }, { k: "l", base: "ᤗ" },
  ],
  [
    { k: "z", base: "ᤚ" }, { k: "x", base: "ᤙ" }, { k: "c", base: "ᤆ", shift: "ᤇ" },
    { k: "v", base: "ᤊ" }, { k: "b", base: "ᤒ", shift: "ᤓ" }, { k: "n", base: "ᤏ", shift: "ᤅ" },
    { k: "m", base: "ᤔ" },
  ],
];

export const KEYMAP: Record<string, K> = Object.fromEntries(
  ROWS.flat().map((key) => [key.k, key]),
);

export function isCombiningLimbu(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return cp >= 0x1920 && cp <= 0x193b; // Limbu vowel signs, subjoined, finals, signs
}
