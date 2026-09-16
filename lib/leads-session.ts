import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "grove_leads_session";
export const SESSION_SECONDS = 8 * 60 * 60;

// Use independently generated, random secrets (see docs/leads-setup.md).
function configuration() {
  const password = process.env.LEADS_ACCESS_CODE || "";
  const secret = process.env.LEADS_SESSION_SECRET || "";
  return password.length >= 32 && secret.length >= 32 ? { password, secret } : null;
}

export function leadsAccessConfigured() {
  return configuration() !== null;
}

function equal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function validAccessCode(value: unknown) {
  const config = configuration();
  return !!config && typeof value === "string" && value.length <= 256 && equal(value, config.password);
}

function signature(payload: string) {
  const config = configuration();
  if (!config) throw new Error("Leads access is not configured");
  // Rotating either secret revokes existing sessions.
  return createHmac("sha256", config.secret).update(`${config.password}:${payload}`).digest("base64url");
}

export function createSession(now = Date.now()) {
  const payload = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${payload}.${signature(payload)}`;
}

export function validSession(value: string | undefined, now = Date.now()) {
  if (!configuration() || !value || value.length > 200) return false;
  const [expiry, mac, extra] = value.split(".");
  if (extra !== undefined || !/^\d{10}$/.test(expiry) || !mac) return false;
  const remaining = Number(expiry) - Math.floor(now / 1000);
  return remaining > 0 && remaining <= SESSION_SECONDS && equal(mac, signature(expiry));
}
