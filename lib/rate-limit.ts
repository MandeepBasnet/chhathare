import "server-only";

// Lightweight in-memory fixed-window rate limiter for auth endpoints.
//
// Login runs server→Appwrite, so Appwrite's own per-IP brute-force protection
// only ever sees this server's IP. This limiter restores per-client throttling.
//
// NOTE: state lives in this process's memory. On a single long-lived Node server
// (the current deploy) that's effective. If this app is ever scaled to multiple
// instances or a serverless platform, move this to a shared store (Redis/Upstash)
// — otherwise each instance keeps its own counter and the effective limit multiplies.

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

// Opportunistic cleanup so the map can't grow unbounded on a long-lived process.
function sweep(now: number) {
  if (store.size < 500) return;
  for (const [k, e] of store) if (now >= e.resetAt) store.delete(k);
}

export type RateResult = { blocked: boolean; retryAfterSec: number };

// Read the current state without counting an attempt. Use this to reject
// before doing any work once a key is already over its limit.
export function peek(key: string, limit: number): RateResult {
  const now = Date.now();
  const e = store.get(key);
  if (!e || now >= e.resetAt) return { blocked: false, retryAfterSec: 0 };
  const blocked = e.count >= limit;
  return { blocked, retryAfterSec: blocked ? Math.ceil((e.resetAt - now) / 1000) : 0 };
}

// Record one failed attempt against the key and report whether it's now blocked.
export function hit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  let e = store.get(key);
  if (!e || now >= e.resetAt) {
    e = { count: 0, resetAt: now + windowMs };
    store.set(key, e);
  }
  e.count += 1;
  const blocked = e.count >= limit;
  return { blocked, retryAfterSec: blocked ? Math.ceil((e.resetAt - now) / 1000) : 0 };
}

// Clear a key's counter — call on a successful login so a legitimate user is
// never penalised for earlier typos.
export function reset(key: string) {
  store.delete(key);
}
