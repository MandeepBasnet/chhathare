"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ScriptField } from "./script-field";

// Search by work title (रचना) or author name (सर्जक). Lets the reader type in
// either Yakthung (Limbu) or Nepali using the matching on-screen keyboard, then
// routes to /search?q=… which queries books.searchIndex (title + author).
export function SearchBox({
  autoFocus,
  defaultValue = "",
}: {
  autoFocus?: boolean;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [script, setScript] = React.useState<"nepali" | "limbu">("nepali");
  const value = React.useRef(defaultValue);

  function submit() {
    const q = value.current.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="w-full">
      <div className="mb-2 inline-flex rounded-full border border-[var(--border)] p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setScript("nepali")}
          className={
            "rounded-full px-3 py-1 transition " +
            (script === "nepali" ? "bg-mountain-600 text-white" : "text-[var(--color-muted)]")
          }
        >
          नेपाली
        </button>
        <button
          type="button"
          onClick={() => setScript("limbu")}
          className={
            "rounded-full px-3 py-1 font-limbu transition " +
            (script === "limbu" ? "bg-mountain-600 text-white" : "text-[var(--color-muted)]")
          }
        >
          ᤛᤡᤖᤡᤈᤣᤅ᤺ᤠ
        </button>
      </div>

      <div className="flex items-start gap-2">
        <div className="flex-1">
          {/* Remount on script switch so the field resets to the right mode. */}
          <ScriptField
            key={script}
            script={script}
            defaultValue={value.current}
            onValueChange={(v) => (value.current = v)}
            onEnter={submit}
            autoFocus={autoFocus}
            placeholder={script === "limbu" ? "रचना वा सर्जक खोज्नुहोस्…" : "रचना वा सर्जकको नाम खोज्नुहोस्…"}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-mountain-600 px-4 text-sm font-medium text-white hover:bg-mountain-700"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">खोज्नुहोस्</span>
        </button>
      </div>
    </div>
  );
}
