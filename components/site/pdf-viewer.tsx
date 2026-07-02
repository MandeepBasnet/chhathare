"use client";
import * as React from "react";
import { Maximize2, ExternalLink } from "lucide-react";

// In-browser PDF reader. Streams the Appwrite file `view` URL in an <iframe>
// (browsers render PDFs inline). Provides open-in-new-tab + fullscreen controls;
// the download button lives on the book page next to it.
export function PdfViewer({ url, title }: { url: string; title: string }) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  function fullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <span className="truncate text-sm font-medium">{title}</span>
        <div className="flex items-center gap-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="नयाँ ट्याबमा खोल्नुहोस्"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-mountain-50 hover:text-mountain-700"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={fullscreen}
            title="पूर्ण स्क्रिन"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-mountain-50 hover:text-mountain-700"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <iframe
        src={url}
        title={title}
        className="h-[75vh] w-full bg-white"
      />
    </div>
  );
}
