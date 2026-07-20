"use client";
import * as React from "react";

type Mode = "light" | "dark" | "system";
type Resolved = "light" | "dark";
const STORAGE_KEY = "sahitya-theme";

const ThemeContext = React.createContext<{
  mode: Mode;
  resolved: Resolved;
  setMode: (m: Mode) => void;
} | null>(null);

// localStorage and the OS colour-scheme query are external stores, so the theme
// is read through useSyncExternalStore rather than copied into state by an
// effect. That kept the first render honest instead of rendering "light" and
// then correcting it, and it gives React a real server snapshot to hydrate on.

// The storage event only fires in *other* tabs, so setMode notifies this one.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readMode(): Mode {
  try {
    const m = localStorage.getItem(STORAGE_KEY);
    return m === "light" || m === "dark" || m === "system" ? m : "system";
  } catch {
    return "system"; // storage can throw under strict privacy settings
  }
}

function resolveMode(mode: Mode): Resolved {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// useSyncExternalStore compares snapshots by identity, so a fresh object every
// call would re-render forever. Only swap it when something actually changed.
const SERVER_SNAPSHOT: { mode: Mode; resolved: Resolved } = { mode: "system", resolved: "light" };
let cached = SERVER_SNAPSHOT;

function getSnapshot() {
  const mode = readMode();
  const resolved = resolveMode(mode);
  if (mode !== cached.mode || resolved !== cached.resolved) cached = { mode, resolved };
  return cached;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, resolved } = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Push the resolved theme onto the document. themeInitScript already set the
  // class pre-paint, so this only matters once the user changes the theme.
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setMode = React.useCallback((m: Mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // Ignore — the in-memory notify below still switches the theme this session.
    }
    for (const l of listeners) l();
  }, []);

  const value = React.useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
