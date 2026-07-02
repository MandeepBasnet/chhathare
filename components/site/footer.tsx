import Link from "next/link";
import { SITE_LINKS } from "@/lib/site-links";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-2 text-base font-semibold">छथरे लिम्बु साहित्य</div>
          <p className="leading-relaxed text-[var(--color-muted)]">
            छथरे लिम्बु समुदायको याक्थुङ र नेपाली साहित्यको डिजिटल पुस्तकालय — कविता, कथा, उपन्यास,
            गीत, गजल र हाइकुको संग्रह।
          </p>
        </div>
        <div>
          <div className="mb-2 font-semibold">अन्वेषण</div>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><Link href="/yakthung" className="hover:text-mountain-700">याक्थुङ साहित्य</Link></li>
            <li><Link href="/nepali" className="hover:text-mountain-700">नेपाली साहित्य</Link></li>
            <li><Link href="/english" className="hover:text-mountain-700">अङ्ग्रेजी साहित्य</Link></li>
            <li><Link href="/authors" className="hover:text-mountain-700">सर्जकहरू</Link></li>
            <li><Link href="/gallery" className="hover:text-mountain-700">ग्यालरी</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">सम्बन्धित साइटहरू</div>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            {SITE_LINKS.filter((l) => !("current" in l && l.current)).map((l) => (
              <li key={l.key}>
                {l.href === "#" ? (
                  <span>{l.label} <span className="text-xs">(छिट्टै)</span></span>
                ) : (
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-mountain-700">
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-[var(--color-muted)] sm:px-6 lg:px-8">
          <span>© {year} छथरे लिम्बु साहित्य</span>
          <a
            href="https://itsoch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-mountain-700"
          >
            <span>Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://itsoch.com/itsoch-logo.svg" alt="itsoch" className="h-5 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
