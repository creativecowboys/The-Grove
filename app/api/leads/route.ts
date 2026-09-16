import { cookies } from "next/headers";
import { SESSION_COOKIE, validSession } from "@/lib/leads-session";
import { fetchLeads, LeadNotFoundError, moveLead } from "@/lib/grove-leads";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request: Request) {
  if (!validSession((await cookies()).get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Please sign in to view leads." }, { status: 401, headers });
  }
  const rawPage = new URL(request.url).searchParams.get("page") || "1";
  const page = Number(rawPage);
  if (!/^\d+$/.test(rawPage) || !Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return Response.json({ error: "Invalid page." }, { status: 400, headers });
  }
  try {
    const view = new URL(request.url).searchParams.get("view") === "trash" ? "trash" : "active";
    return Response.json(await fetchLeads(page, view), { headers });
  } catch {
    console.error("Unable to read Grove leads");
    return Response.json({ error: "We couldn't load your leads. Please try again shortly." }, { status: 503, headers });
  }
}

export async function PATCH(request: Request) {
  if (!validSession((await cookies()).get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Please sign in to manage leads." }, { status: 401, headers });
  }
  // Next can use an internal hostname in request.url behind its server/proxy.
  // Compare the browser's origin with the actual HTTP Host, not that internal URL.
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    const parsed = new URL(origin || "");
    sameOrigin = ["http:", "https:"].includes(parsed.protocol) && parsed.host === request.headers.get("host");
  } catch { /* Missing or invalid origin is rejected. */ }
  if (!sameOrigin) {
    return Response.json({ error: "Request not allowed." }, { status: 403, headers });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(body.id) || !["trash", "restore"].includes(body.action)) {
    return Response.json({ error: "Invalid request." }, { status: 400, headers });
  }
  try {
    await moveLead(body.id, body.action);
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof LeadNotFoundError ? "That lead isn't available." : "We couldn't update the lead. Please refresh and try again." }, {
      status: error instanceof LeadNotFoundError ? 404 : 503, headers,
    });
  }
}
