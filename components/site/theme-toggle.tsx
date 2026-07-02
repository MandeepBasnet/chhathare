"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { resolved, setMode } = useTheme();
  return (
    <button
      type="button"
      aria-label="थिम बदल्नुहोस्"
      onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--color-muted)] hover:border-mountain-400 hover:text-mountain-700"
    >
      {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
