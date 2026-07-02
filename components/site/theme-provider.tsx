"use client";
import * as React from "react";

type Mode = "light" | "dark" | "system";
const STORAGE_KEY = "sahitya-theme";
const ThemeContext = React.createContext<{
  mode: Mode;
  resolved: "light" | "dark";
  setMode: (m: Mode) => void;
} | null>(null);

function applyResolved(mode: Mode): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<Mode>("system");
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Mode | null) || "system";
    setModeState(stored);
    setResolved(applyResolved(stored));
    if (stored === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setResolved(applyResolved("system"));
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  const setMode = React.useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    setResolved(applyResolved(m));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// Inline script injected before hydration to avoid FOUC.
export const themeInitScript = `
(function(){try{
  var k='${STORAGE_KEY}';
  var m=localStorage.getItem(k)||'system';
  var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  if(dark)document.documentElement.classList.add('dark');
}catch(e){}})();
`.trim();
