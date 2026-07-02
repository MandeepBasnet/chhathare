"use client";
import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

type Phase = "idle" | "start" | "mid" | "done";

// Top progress bar shown during route transitions.
export function NavLoader() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("idle");
  const finishTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const midTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = React.useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (midTimer.current) clearTimeout(midTimer.current);
    setPhase("start");
    midTimer.current = setTimeout(() => setPhase("mid"), 60);
  }, []);

  const finish = React.useCallback(() => {
    if (midTimer.current) clearTimeout(midTimer.current);
    setPhase("done");
    finishTimer.current = setTimeout(() => setPhase("idle"), 320);
  }, []);

  React.useEffect(() => {
    if (phase !== "idle") finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = (e.target as HTMLElement | null)?.closest?.("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (target.target && target.target !== "_self") return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  React.useEffect(() => {
    const r = router as unknown as Record<string, unknown>;
    const orig = { push: r.push, replace: r.replace, back: r.back, forward: r.forward };
    const wrap = <T extends (...args: unknown[]) => unknown>(fn: T): T =>
      ((...args: unknown[]) => {
        start();
        return (fn as (...a: unknown[]) => unknown).apply(r, args);
      }) as T;
    r.push = wrap(orig.push as never);
    r.replace = wrap(orig.replace as never);
    r.back = wrap(orig.back as never);
    r.forward = wrap(orig.forward as never);
    return () => {
      r.push = orig.push;
      r.replace = orig.replace;
      r.back = orig.back;
      r.forward = orig.forward;
    };
  }, [router, start]);

  return <div aria-hidden className={`nav-progress nav-progress--${phase}`} />;
}
