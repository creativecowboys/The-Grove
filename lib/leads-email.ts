import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const LINK_SECONDS = 15 * 60;
const BUCKET_SECONDS = 5 * 60;
export function emailLoginConfigured() {
  return !!process.env.RESEND_API_KEY && !!approvedEmail() &&
    (process.env.LEADS_SESSION_SECRET || "").length >= 32 && (process.env.LEADS_ACCESS_CODE || "").length >= 32;
}
function approvedEmail() {
  return (process.env.LEADS_LOGIN_EMAIL || "").trim().toLowerCase();
}
function mac(issued: string) {
  return createHmac("sha256", process.env.LEADS_SESSION_SECRET || "")
    .update(`grove-email-login:${approvedEmail()}:${process.env.LEADS_ACCESS_CODE}:${issued}`).digest("base64url");
}
// A stable five-minute bucket lets the email provider deduplicate repeated requests.
export function createEmailToken(now = Date.now()) {
  if (!emailLoginConfigured()) throw new Error("Email login unavailable");
  const issued = String(Math.floor(now / 1000 / BUCKET_SECONDS) * BUCKET_SECONDS);
  return `${issued}.${mac(issued)}`;
}
export function validEmailToken(token: unknown, now = Date.now()) {
  if (!emailLoginConfigured() || typeof token !== "string" || token.length > 200) return false;
  const [issued, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d{10}$/.test(issued) || !signature) return false;
  const age = Math.floor(now / 1000) - Number(issued);
  return age >= 0 && age < LINK_SECONDS && timingSafeEqual(
    createHash("sha256").update(signature).digest(), createHash("sha256").update(mac(issued)).digest());
}
export async function sendLoginEmail(value: unknown) {
  if (!emailLoginConfigured()) throw new Error("Email login unavailable");
  // No caller can choose an arbitrary recipient or override the destination URL.
  if (typeof value !== "string" || value.trim().toLowerCase() !== approvedEmail()) return;
  if (process.env.VERCEL_ENV === "preview") throw new Error("Email disabled in preview");
  const token = createEmailToken();
  const link = `https://thegroveatdefoorfarm.com/leads?login=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json",
      "Idempotency-Key": `grove-login-${createHash("sha256").update(token).digest("hex")}` },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL || "The Grove Website <inquiries@creativecowboys.co>",
      to: [approvedEmail()], subject: "Your sign-in link for The Grove leads",
      text: `Open your private leads workspace:\n\n${link}\n\nTap Open my leads on the page to finish signing in. This private link expires in 10–15 minutes. Do not forward it. If you did not request it, you can ignore this email.`,
    }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Email provider unavailable");
}
