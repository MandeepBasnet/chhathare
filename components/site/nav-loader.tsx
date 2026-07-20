"use client";
import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

type Phase = "idle" | "start" | "mid" | "done";

// Top progress bar shown during route transitions.
//
// The phase is written straight onto the element's class rather than held in
// state: every transition is triggered by something outside React (a click, a
// route change, a timer), and the only consumer is a CSS class, so routing it
// through state bought a re-render per phase and nothing else.
export function NavLoader() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  const barRef = React.useRef<HTMLDivElement | null>(null);
  const phase = React.useRef<Phase>("idle");
  const finishTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const midTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhase = React.useCallback((p: Phase) => {
    phase.current = p;
    const el = barRef.current;
    if (el) el.className = `nav-progress nav-progress--${p}`;
  }, []);

  const start = React.useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (midTimer.current) clearTimeout(midTimer.current);
    setPhase("start");
    midTimer.current = setTimeout(() => setPhase("mid"), 60);
  }, [setPhase]);

  const finish = React.useCallback(() => {
    if (midTimer.current) clearTimeout(midTimer.current);
    setPhase("done");
    finishTimer.current = setTimeout(() => setPhase("idle"), 320);
  }, [setPhase]);

  // The route settled — run the bar out, but only if a navigation started it.
  React.useEffect(() => {
    if (phase.current !== "idle") finish();
  }, [pathname, search, finish]);

  // Drop any in-flight timers if the bar unmounts mid-transition.
  React.useEffect(
    () => () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
      if (midTimer.current) clearTimeout(midTimer.current);
    },
    [],
  );

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

  // Programmatic navigation (router.push from a form, etc.) fires no click, and
  // the App Router exposes no navigation-start event — so the methods are
  // wrapped for the lifetime of this component and restored on cleanup.
  // NOTE: this reaches into Next's router object and is the most likely thing
  // here to break on a Next upgrade. If the bar stops showing after a form
  // submit, look here first.
  React.useEffect(() => {
    const r = router as unknown as Record<string, unknown>;
    const orig = { push: r.push, replace: r.replace, back: r.back, forward: r.forward };
    const wrap = <T extends (...args: unknown[]) => unknown>(fn: T): T =>
      ((...args: unknown[]) => {
        start();
        return (fn as (...a: unknown[]) => unknown).apply(r, args);
      }) as T;
    /* eslint-disable react-hooks/immutability -- deliberate, scoped, and undone in cleanup */
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
    /* eslint-enable react-hooks/immutability */
  }, [router, start]);

  return <div ref={barRef} aria-hidden className="nav-progress nav-progress--idle" />;
}
