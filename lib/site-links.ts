// Requirement #3 — the three sister sites link to each other.
// Sabayelhang URL is unknown for now; falls back to "#" until the env is set.

export const SITE_LINKS = [
  {
    key: "khajum",
    label: "खजुम चोक्बाङ",
    labelEn: "Khajum Chokbang",
    href: process.env.NEXT_PUBLIC_LINK_KHAJUM || "https://khajumchongbang.org",
  },
  {
    key: "sabayelhang",
    label: "साबायेल्हाङ नेटवर्क",
    labelEn: "Sabayelhang Network",
    href: process.env.NEXT_PUBLIC_LINK_SABAYELHANG || "#", // TODO: set when live
  },
  {
    key: "sahitya",
    label: "छथरे लिम्बु साहित्य",
    labelEn: "Chhathare Limbu Sahitya",
    href: process.env.NEXT_PUBLIC_SITE_URL || "/",
    current: true,
  },
] as const;
