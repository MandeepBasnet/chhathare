import "server-only";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

// Stamp every page with the viewer's identity so any leaked copy/screenshot is
// traceable back to the account that opened it. `label` should be latin-only
// (email + timestamp) — the standard Helvetica font has no Devanagari/Limbu glyphs.
export async function watermarkPdf(input: Uint8Array, label: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    // Faint diagonal watermark across the middle of the page.
    const diagSize = Math.max(12, Math.min(width, height) * 0.028);
    page.drawText(label, {
      x: width * 0.06,
      y: height * 0.42,
      size: diagSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.16,
      rotate: degrees(30),
    });

    // Small attribution strip along the footer.
    page.drawText(label, {
      x: 20,
      y: 14,
      size: 8,
      font,
      color: rgb(0.35, 0.35, 0.35),
      opacity: 0.55,
    });
  }

  return pdf.save();
}
