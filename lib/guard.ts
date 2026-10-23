// Request-level guards for /api/inquiry: where the post came from, who sent it,
// and how often. Same design as the Arctic Law site's guard.

import { createHash } from "node:crypto";

// Our own pages. A request whose Origin (or Referer) host is the host it was
// sent to is also accepted, which covers Vercel preview URLs and localhost.
const OWN_HOSTS = new Set(["www.thegroveatdefoorfarm.com", "thegroveatdefoorfarm.com", "thegrove.creativecowboys.co"]);

function hostOf(value: string | null) {
  if (!value || value === "null") return "";
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Host the browser says the request came from (Origin, else Referer). "" when absent. */
export function sourceHost(request: Request) {
  return hostOf(request.headers.get("origin")) || hostOf(request.headers.get("referer"));
}

export function originAllowed(request: Request) {
  const from = sourceHost(request);
  if (!from) return false; // browsers always send Origin on a POST; scripts often don't
  if (OWN_HOSTS.has(from)) return true;
  const own = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  return Boolean(own) && from === own;
}

export function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") || "").trim() || "unknown";
}

/** Short one-way tag for logs, so repeat senders can be spotted without storing the address. */
export function ipTag(ip: string) {
  return createHash("sha256").update(`the-grove:${ip}`).digest("hex").slice(0, 12);
}

// Per-address limiter. In memory, so it is per warm server instance and
// resets on a cold start: it stops floods, not a patient bot. Loose on purpose
// so a couple who sends the form twice, or a household on one connection,
// is never caught.
type Rule = { windowMs: number; max: number };
const buckets = new Map<string, Map<string, number[]>>();

export function overLimit(scope: string, key: string, rules: Rule[], now = Date.now()) {
  const longest = Math.max(...rules.map((r) => r.windowMs));
  let bucket = buckets.get(scope);
  if (!bucket) buckets.set(scope, (bucket = new Map()));
  const hits = (bucket.get(key) || []).filter((t) => now - t < longest);
  hits.push(now);
  bucket.set(key, hits);
  if (bucket.size > 5000) {
    for (const [k, v] of bucket) if (!v.length || now - v[v.length - 1] >= longest) bucket.delete(k);
  }
  return rules.some((r) => hits.filter((t) => now - t < r.windowMs).length > r.max);
}

export const INQUIRY_LIMITS: Rule[] = [
  { windowMs: 10 * 60_000, max: 5 },
  { windowMs: 24 * 3_600_000, max: 20 },
];
