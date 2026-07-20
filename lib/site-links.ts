// Requirement #3 — the three sister sites link to each other.
// Sawayethang Network currently lives on YouTube; env var can point it elsewhere later.

export const SITE_LINKS = [
  {
    key: "khajum",
    label: "खजुम चोक्बाङ",
    labelEn: "Khajum Chokbang",
    href: process.env.NEXT_PUBLIC_LINK_KHAJUM || "https://khajumchongbang.org",
  },
  {
    key: "sawayethang",
    label: "सावायेथाङ नेटवर्क",
    labelEn: "Sawayethang Network",
    href:
      process.env.NEXT_PUBLIC_LINK_SAWAYETHANG ||
      "https://www.youtube.com/@sawayethangnetwork3692",
  },
  {
    key: "sahitya",
    label: "छथरे लिम्बु साहित्य",
    labelEn: "Chhathare Limbu Sahitya",
    href: process.env.NEXT_PUBLIC_SITE_URL || "/",
    current: true,
  },
] as const;
