"use client";
import * as React from "react";
import { Maximize2 } from "lucide-react";

// In-browser, view-only PDF reader. Streams the gated /api/read/[id] route in an
// <iframe>. No open-in-new-tab (that would expose the raw stream) and the native
// PDF toolbar is hidden (#toolbar=0) to discourage the built-in download/print.
// Screenshots can't be blocked on the web — every served page is watermarked with
// the reader's identity instead, so leaks are traceable.
export function PdfViewer({ url, title }: { url: string; title: string }) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const src = `${url}#toolbar=0&navpanes=0&statusbar=0&view=FitH`;

  function fullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <span className="truncate text-sm font-medium">{title}</span>
        <button
          type="button"
          onClick={fullscreen}
          title="पूर्ण स्क्रिन"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-mountain-50 hover:text-mountain-700"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <iframe src={src} title={title} className="h-[75vh] w-full bg-white" />
    </div>
  );
}
