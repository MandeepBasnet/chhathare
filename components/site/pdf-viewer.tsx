"use client";
import * as React from "react";
import { Maximize2, Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Canvas-based, view-only PDF reader (pdf.js). Rendering each page to a <canvas>
// means there is NO selectable text layer (can't copy text) and NO native
// download/print toolbar. Combined with the per-reader watermark baked in by
// /api/read/[id], this removes the easy copy vectors. Screenshots still can't be
// blocked on the web — the watermark is what makes any leak traceable.
export function PdfViewer({ url, title }: { url: string; title: string }) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = React.useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let task: { promise: Promise<PDFDocumentProxy>; destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Worker is copied into /public by scripts/copy-pdf-worker.mjs (postinstall).
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.arrayBuffer();
        if (cancelled) return;
        task = pdfjs.getDocument({ data });
        const loaded = await task.promise;
        if (cancelled) return;
        setDoc(loaded);
        setNumPages(loaded.numPages);
      } catch {
        if (!cancelled) setError("PDF लोड गर्न सकिएन।");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [url]);

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

      <div
        className="h-[75vh] w-full select-none overflow-y-auto bg-mountain-100 px-2 py-3"
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="flex h-full items-center justify-center text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">{error}</div>
        )}
        {doc && (
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage key={i} doc={doc} pageNumber={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// One page, rendered to a canvas only once it scrolls near the viewport.
function PdfPage({ doc, pageNumber }: { doc: PDFDocumentProxy; pageNumber: number }) {
  const holderRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [aspect, setAspect] = React.useState(1.414); // A4 fallback until measured

  // Measure page aspect ratio up front so the placeholder reserves correct height.
  React.useEffect(() => {
    let cancelled = false;
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const vp = page.getViewport({ scale: 1 });
      setAspect(vp.height / vp.width);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);

  // Lazy-load: only render when the placeholder nears the viewport.
  React.useEffect(() => {
    const el = holderRef.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  React.useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null;
    (async () => {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const holder = holderRef.current;
      if (!canvas || !holder || cancelled) return;
      const cssWidth = holder.clientWidth || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      task = page.render({ canvas, canvasContext: ctx, viewport });
      try {
        await task.promise;
      } catch {
        /* render cancelled on unmount — ignore */
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [visible, doc, pageNumber]);

  return (
    <div
      ref={holderRef}
      style={{ aspectRatio: `1 / ${aspect}` }}
      className="w-full overflow-hidden rounded bg-white shadow-sm"
    >
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
