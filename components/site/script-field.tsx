"use client";
import * as React from "react";
import { Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  KEYMAP as LIMBU_KEYMAP,
  ROWS as LIMBU_ROWS,
  isCombiningLimbu,
} from "@/lib/limbu-keymap";
import {
  KEYMAP as NEPALI_KEYMAP,
  ROWS as NEPALI_ROWS,
  ROMAN_ROWS,
  isCombiningDevanagari,
  romanToDevanagari,
} from "@/lib/nepali-keymap";
import { KeyboardPanel } from "./keyboard-panel";

type Script = "limbu" | "nepali";
type Mode = "glyph" | "roman";

// A self-contained text field with an integrated on-screen keyboard.
//  • script="limbu"  → Sirijonga keyboard (real Unicode Limbu), glyph-per-key.
//  • script="nepali" → Devanagari, with a Traditional (fixed keys) mode AND a
//    Romanized (phonetic) mode, switchable like HamroKeyboard. Romanized keeps a
//    per-word roman buffer transliterated live at the end of the value.
// Physical typing is remapped too. The field owns its value; read it via the
// `name` (form submit) or the `onValueChange` callback.
export function ScriptField({
  script,
  name,
  defaultValue,
  onValueChange,
  placeholder,
  id,
  className,
  ariaLabel,
  autoFocus,
  onEnter,
}: {
  script: Script;
  name?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
}) {
  const isNepali = script === "nepali";
  const [mode, setMode] = React.useState<Mode>(isNepali ? "roman" : "glyph");
  const [base, setBase] = React.useState(defaultValue ?? "");
  const [token, setToken] = React.useState(""); // pending roman letters (roman mode)
  const [open, setOpen] = React.useState(false);
  const [shift, setShift] = React.useState(false);
  const ref = React.useRef<HTMLInputElement | null>(null);
  const caret = React.useRef<number | null>(null);

  const romanActive = isNepali && mode === "roman";
  const display = base + (romanActive ? romanToDevanagari(token) : "");

  React.useEffect(() => {
    onValueChange?.(display);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display]);

  // Restore caret after a glyph insert/backspace changed `base`.
  React.useEffect(() => {
    if (caret.current != null && ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [base]);

  // ── glyph mode helpers (insert at caret) ──
  function insertGlyph(ch: string) {
    const el = ref.current;
    const start = el?.selectionStart ?? base.length;
    const end = el?.selectionEnd ?? base.length;
    caret.current = start + ch.length;
    setBase(base.slice(0, start) + ch + base.slice(end));
  }
  function glyphBackspace() {
    const el = ref.current;
    const start = el?.selectionStart ?? base.length;
    const end = el?.selectionEnd ?? base.length;
    if (start !== end) {
      caret.current = start;
      setBase(base.slice(0, start) + base.slice(end));
    } else if (start > 0) {
      caret.current = start - 1;
      setBase(base.slice(0, start - 1) + base.slice(start));
    }
  }

  // ── roman mode helpers (compose at end) ──
  function commitToken() {
    if (token) {
      setBase((b) => b + romanToDevanagari(token));
      setToken("");
    }
  }
  function romanBackspace() {
    if (token) setToken((t) => t.slice(0, -1));
    else setBase((b) => b.slice(0, -1));
  }

  function switchMode(next: Mode) {
    commitToken();
    setShift(false);
    setMode(next);
  }

  // On-screen key handlers.
  function onScreenKey(value: string) {
    if (romanActive) setToken((t) => t + value);
    else insertGlyph(value);
    if (shift) setShift(false);
  }
  function onScreenSpace() {
    if (romanActive) {
      commitToken();
      setBase((b) => b + " ");
    } else {
      insertGlyph(" ");
    }
  }
  function onScreenBackspace() {
    if (romanActive) romanBackspace();
    else glyphBackspace();
  }

  // Physical keyboard.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") {
      commitToken();
      onEnter?.();
      return;
    }
    if (romanActive) {
      if (e.key.length === 1 && /[a-zA-Z0-9~^]/.test(e.key)) {
        e.preventDefault();
        setToken((t) => t + e.key);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        commitToken();
        setBase((b) => b + " ");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        romanBackspace();
        return;
      }
      return;
    }
    // glyph mode — remap mapped keys, let the rest behave normally.
    const map = isNepali ? NEPALI_KEYMAP : LIMBU_KEYMAP;
    const key = map[e.key.toLowerCase()];
    if (!key) return;
    e.preventDefault();
    insertGlyph(e.shiftKey && key.shift ? key.shift : key.base);
  }

  // Unhandled input (paste, delete, etc.) — sync `base`, drop composition.
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setToken("");
    setBase(e.target.value);
  }

  const fontClass = script === "limbu" || !isNepali ? "font-limbu" : "";
  const panelRows = romanActive ? ROMAN_ROWS : isNepali ? NEPALI_ROWS : LIMBU_ROWS;
  const combining = romanActive
    ? undefined
    : isNepali
      ? isCombiningDevanagari
      : isCombiningLimbu;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        <Input
          ref={ref}
          id={id}
          name={name}
          value={display}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={commitToken}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          lang={script === "limbu" ? "lim" : "ne"}
          className={script === "limbu" ? "font-limbu" : ""}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-pressed={open}
          aria-label="किबोर्ड"
          title="अन-स्क्रिन किबोर्ड"
          className={
            "shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md border transition " +
            (open
              ? "border-mountain-400 bg-mountain-50 text-mountain-700"
              : "border-[var(--border)] text-[var(--color-muted)] hover:border-mountain-400")
          }
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="mt-2 w-full max-w-xl">
          <KeyboardPanel
            rows={panelRows}
            shift={shift}
            onKey={onScreenKey}
            onBackspace={onScreenBackspace}
            onSpace={onScreenSpace}
            onToggleShift={() => setShift((s) => !s)}
            onClose={() => setOpen(false)}
            combining={combining}
            glyphClassName={script === "limbu" ? "font-limbu" : ""}
            title={
              script === "limbu"
                ? "सिरिजङ्गा (लिम्बू) किबोर्ड"
                : romanActive
                  ? "नेपाली किबोर्ड — रोमनाइज्ड"
                  : "नेपाली किबोर्ड — परम्परागत"
            }
            hint="कुञ्जीपाटीबाट पनि टाइप गर्न सकिन्छ"
            modeToggle={
              isNepali
                ? {
                    label: romanActive ? "→ परम्परागत" : "→ रोमनाइज्ड",
                    onClick: () => switchMode(romanActive ? "glyph" : "roman"),
                  }
                : undefined
            }
          />
          {romanActive && (
            <p className="mt-1 px-1 text-[11px] text-[var(--color-muted)]">
              उच्चारण अनुसार टाइप गर्नुहोस् — जस्तै <code>namaste</code> → नमस्ते
            </p>
          )}
        </div>
      )}
    </div>
  );
}
