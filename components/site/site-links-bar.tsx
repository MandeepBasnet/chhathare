import { SITE_LINKS } from "@/lib/site-links";

// Requirement #3 — the cross-site link bar to the 3 sister sites.
export function SiteLinksBar() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--card)]/60">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-xs sm:px-6 lg:px-8">
        <span className="mr-1 hidden shrink-0 text-[var(--color-muted)] sm:inline">
          सम्बन्धित साइटहरू:
        </span>
        {SITE_LINKS.map((link) => {
          const current = "current" in link && link.current;
          const disabled = link.href === "#";
          const base =
            "shrink-0 rounded-full px-3 py-1 transition " +
            (current
              ? "bg-mountain-600 text-white"
              : disabled
                ? "text-[var(--color-muted)] cursor-not-allowed"
                : "text-[var(--foreground)] hover:bg-mountain-50 hover:text-mountain-700");
          if (current || disabled) {
            return (
              <span key={link.key} className={base} title={disabled ? "छिट्टै आउँदैछ" : undefined}>
                {link.label}
              </span>
            );
          }
          return (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={base}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
