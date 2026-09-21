import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const LINK_SECONDS = 15 * 60;
const BUCKET_SECONDS = 5 * 60;
export function emailLoginConfigured() {
  return !!process.env.RESEND_API_KEY && approvedEmails().length > 0 &&
    (process.env.LEADS_SESSION_SECRET || "").length >= 32 && (process.env.LEADS_ACCESS_CODE || "").length >= 32;
}
// Approved sign-in addresses: LEADS_LOGIN_EMAIL (the original single address)
// plus LEADS_LOGIN_EMAILS (comma-separated). Both optional; merged and deduped.
function approvedEmails(): string[] {
  const raw = `${process.env.LEADS_LOGIN_EMAIL || ""},${process.env.LEADS_LOGIN_EMAILS || ""}`;
  return [...new Set(raw.split(",").map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
}
// Short recipient id carried in the link so the server knows which approved
// address the token was issued for, without putting the address in the URL.
function recipientId(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 12);
}
function mac(issued: string, email: string) {
  return createHmac("sha256", process.env.LEADS_SESSION_SECRET || "")
    .update(`grove-email-login:${email}:${process.env.LEADS_ACCESS_CODE}:${issued}`).digest("base64url");
}
// A stable five-minute bucket lets the email provider deduplicate repeated requests.
export function createEmailToken(email: string, now = Date.now()) {
  if (!emailLoginConfigured()) throw new Error("Email login unavailable");
  const target = email.trim().toLowerCase();
  if (!approvedEmails().includes(target)) throw new Error("Email not approved");
  const issued = String(Math.floor(now / 1000 / BUCKET_SECONDS) * BUCKET_SECONDS);
  return `${issued}.${recipientId(target)}.${mac(issued, target)}`;
}
export function validEmailToken(token: unknown, now = Date.now()) {
  if (!emailLoginConfigured() || typeof token !== "string" || token.length > 200) return false;
  const [issued, rid, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d{10}$/.test(issued) || !/^[0-9a-f]{12}$/.test(rid || "") || !signature) return false;
  const age = Math.floor(now / 1000) - Number(issued);
  if (age < 0 || age >= LINK_SECONDS) return false;
  // Removing an address from the approved list revokes its pending links.
  const email = approvedEmails().find((e) => recipientId(e) === rid);
  if (!email) return false;
  return timingSafeEqual(
    createHash("sha256").update(signature).digest(), createHash("sha256").update(mac(issued, email)).digest());
}
export async function sendLoginEmail(value: unknown) {
  if (!emailLoginConfigured()) throw new Error("Email login unavailable");
  // No caller can choose an arbitrary recipient or override the destination URL.
  if (typeof value !== "string") return;
  const target = value.trim().toLowerCase();
  if (!approvedEmails().includes(target)) return;
  if (process.env.VERCEL_ENV === "preview") throw new Error("Email disabled in preview");
  const token = createEmailToken(target);
  const link = `https://thegroveatdefoorfarm.com/leads?login=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json",
      "Idempotency-Key": `grove-login-${createHash("sha256").update(token).digest("hex")}` },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL || "The Grove Website <inquiries@creativecowboys.co>",
      to: [target], subject: "Your sign-in link for The Grove leads",
      text: `Open your private leads workspace:\n\n${link}\n\nTap Open my leads on the page to finish signing in. This private link expires in 10–15 minutes. Do not forward it. If you did not request it, you can ignore this email.`,
    }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Email provider unavailable");
}
