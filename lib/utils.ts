import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined || input === "") return "";
  return String(input).replace(/[0-9]/g, (d) => NEPALI_DIGITS[Number(d)]);
}

// Strip the Appwrite Document class prototype so the object can cross the
// Server → Client component boundary. React 19 / Next 16 refuse non-plain objects.
export function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// Slug that keeps Devanagari/Limbu letters + combining marks attached.
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "item"
  );
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
