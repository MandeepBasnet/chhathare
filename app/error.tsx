"use client";
import * as React from "react";
import Link from "next/link";

// Without this boundary any uncaught render error — client or server — falls
// through to Next's bare "This page couldn't load" screen, which loses the site
// chrome and gives no way forward but a browser reload.
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl font-bold text-mountain-300">!</div>
      <h1 className="mt-4 text-2xl font-bold">केही त्रुटि भयो</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        यो पृष्ठ लोड गर्न सकिएन। फेरि प्रयास गर्नुहोस्।
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">{error.digest}</p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-mountain-600 px-4 py-2 text-sm font-semibold text-white hover:bg-mountain-700"
        >
          फेरि प्रयास गर्नुहोस्
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-mountain-400"
        >
          मुख्य पृष्ठ
        </Link>
      </div>
    </div>
  );
}
