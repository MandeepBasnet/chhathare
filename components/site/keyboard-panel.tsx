"use client";
import * as React from "react";
import { Delete, X } from "lucide-react";
import { DOTTED, type K } from "@/lib/limbu-keymap";

// Presentational on-screen keyboard shared by the Limbu and Nepali keyboards.
// It renders a QWERTY-shaped grid of keycaps and emits raw key values through
// `onKey` — the owning field decides what to do (insert a glyph, or feed a roman
// letter into the phonetic buffer). All buttons preventDefault on mousedown so
// the target input keeps focus and selection.
export function KeyboardPanel({
  rows,
  shift,
  onKey,
  onBackspace,
  onSpace,
  onToggleShift,
  onClose,
  combining,
  glyphClassName,
  title,
  hint,
  modeToggle,
}: {
  rows: K[][];
  shift: boolean;
  onKey: (value: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onToggleShift: () => void;
  onClose?: () => void;
  combining?: (ch: string) => boolean;
  glyphClassName?: string;
  title: string;
  hint?: string;
  modeToggle?: { label: string; onClick: () => void };
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--background)]/60 px-3 py-2">
        <span className="text-xs font-medium text-[var(--foreground)]">
          {title}
          {hint && (
            <span className="ml-2 hidden text-[10px] font-normal text-[var(--color-muted)] sm:inline">
              {hint}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          {modeToggle && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={modeToggle.onClick}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] font-medium hover:border-mountain-400 hover:bg-mountain-50"
            >
              {modeToggle.label}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClose}
              aria-label="बन्द गर्नुहोस्"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-mountain-50 hover:text-mountain-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto p-2.5">
        <div className="min-w-max space-y-1">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1" style={{ paddingLeft: `${ri * 0.9}rem` }}>
              {row.map((key) => {
                const value = shift && key.shift ? key.shift : key.base;
                const glyph = combining?.(value) ? DOTTED + value : value;
                return (
                  <button
                    key={key.k}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onKey(value)}
                    className="relative h-10 w-10 shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-mountain-400 hover:bg-mountain-50 active:bg-mountain-100"
                  >
                    <span className="absolute left-1 top-0.5 text-[9px] leading-none text-[var(--color-muted)]">
                      {key.k}
                    </span>
                    <span className={"text-lg leading-none " + (glyphClassName ?? "")}>{glyph}</span>
                  </button>
                );
              })}
              {ri === 0 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onBackspace}
                  title="मेटाउनुहोस्"
                  className="ml-auto inline-flex h-10 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs hover:border-mountain-400 hover:bg-mountain-50"
                >
                  <Delete className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-1 pt-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onToggleShift}
              aria-pressed={shift}
              className={
                "inline-flex h-10 items-center rounded-md border px-3 text-xs font-medium transition " +
                (shift
                  ? "border-mountain-500 bg-mountain-600 text-white"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-mountain-400 hover:bg-mountain-50")
              }
            >
              ⇧ Shift
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onSpace}
              className="h-10 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] text-xs hover:border-mountain-400 hover:bg-mountain-50"
            >
              स्पेस
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
