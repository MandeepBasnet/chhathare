// Keeps public/pdf.worker.min.mjs in sync with the installed pdfjs-dist version.
// Runs on postinstall so the worker never drifts from the API build (a version
// mismatch makes pdf.js refuse to render). Defensive: warns, never fails install.
import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const src = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
const dest = "public/pdf.worker.min.mjs";

try {
  if (!existsSync(src)) {
    console.warn("[copy-pdf-worker] pdfjs-dist worker not found — skipping");
    process.exit(0);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log("[copy-pdf-worker] synced public/pdf.worker.min.mjs");
} catch (e) {
  console.warn("[copy-pdf-worker] failed:", e?.message || e);
}
